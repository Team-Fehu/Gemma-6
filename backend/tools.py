"""Deterministic calculators. The model reasons; these compute.

Every function is pure over its arguments (or over business_context via
get_metric). No I/O, no model calls. Every result carries value + formula +
inputs so a report can cite exactly where a number came from.
"""

_BUSINESS_CONTEXT: dict = {}


def set_business_context(ctx: dict) -> None:
    global _BUSINESS_CONTEXT
    _BUSINESS_CONTEXT = ctx


def _get(path: str, default=None):
    node = _BUSINESS_CONTEXT
    for part in path.split("."):
        if isinstance(node, dict) and part in node:
            node = node[part]
        else:
            return default
    return node


def get_metric(key: str) -> dict:
    """Shared grounding tool: look up a raw value from business_context."""
    value = _get(key)
    return {"value": value, "found": value is not None, "formula": f"business_context.{key}", "inputs": {}}


# ---------- Pricing ----------

def price_elasticity_impact(current_price: float, new_price: float, base_demand: float, elasticity: float) -> dict:
    pct_price_change = (new_price - current_price) / current_price
    pct_demand_change = elasticity * pct_price_change
    new_demand = base_demand * (1 + pct_demand_change)
    revenue_before = current_price * base_demand
    revenue_after = new_price * new_demand
    return {
        "value": round(new_demand, 2),
        "unit": "units",
        "formula": "new_demand = base_demand * (1 + elasticity * pct_price_change)",
        "inputs": {"current_price": current_price, "new_price": new_price, "base_demand": base_demand, "elasticity": elasticity},
        "demand_change_pct": round(pct_demand_change * 100, 2),
        "revenue_before": round(revenue_before, 2),
        "revenue_after": round(revenue_after, 2),
        "revenue_change": round(revenue_after - revenue_before, 2),
    }


def margin_at_price(price: float, unit_cost: float, volume: float) -> dict:
    margin = (price - unit_cost) * volume
    margin_pct = (price - unit_cost) / price if price else 0
    return {
        "value": round(margin, 2),
        "unit": "currency",
        "formula": "(price - unit_cost) * volume",
        "inputs": {"price": price, "unit_cost": unit_cost, "volume": volume},
        "margin_pct": round(margin_pct * 100, 2),
    }


def segment_churn(segments: list[dict], price_change_pct: float) -> dict:
    out = []
    for seg in segments:
        size = seg.get("size", 0)
        sensitivity = seg.get("price_sensitivity", seg.get("sensitivity", 0))
        churned = size * sensitivity * abs(price_change_pct)
        out.append({
            "name": seg.get("name"),
            "size": size,
            "churned": round(churned, 2),
            "retained": round(size - churned, 2),
        })
    return {
        "value": out,
        "unit": "customers",
        "formula": "churned = size * price_sensitivity * abs(price_change_pct)",
        "inputs": {"segments": segments, "price_change_pct": price_change_pct},
    }


# ---------- Revenue forecasting ----------

def project_revenue(base_monthly_revenue: float, monthly_growth_rate: float, months: int, decision_delta_pct: float = 0.0) -> dict:
    status_quo, decision = [], []
    rev_sq, rev_dec = base_monthly_revenue, base_monthly_revenue
    for _ in range(months):
        rev_sq *= (1 + monthly_growth_rate)
        rev_dec = rev_sq * (1 + decision_delta_pct)
        status_quo.append(round(rev_sq, 2))
        decision.append(round(rev_dec, 2))
    return {
        "value": decision,
        "unit": "currency/month",
        "formula": "compound base_monthly_revenue at monthly_growth_rate, then apply decision_delta_pct",
        "inputs": {"base_monthly_revenue": base_monthly_revenue, "monthly_growth_rate": monthly_growth_rate, "months": months, "decision_delta_pct": decision_delta_pct},
        "status_quo": status_quo,
    }


def revenue_range(point_estimate: float, uncertainty_pct: float) -> dict:
    low = point_estimate * (1 - uncertainty_pct)
    high = point_estimate * (1 + uncertainty_pct)
    return {
        "value": {"low": round(low, 2), "high": round(high, 2)},
        "unit": "currency",
        "formula": "point_estimate * (1 +/- uncertainty_pct)",
        "inputs": {"point_estimate": point_estimate, "uncertainty_pct": uncertainty_pct},
    }


# ---------- Supplier ----------

def supplier_exposure(suppliers: list[dict]) -> dict:
    if not suppliers:
        return {"value": 0, "unit": "pct", "formula": "max(share_of_spend)", "inputs": {"suppliers": suppliers}, "single_supplier_flag": False}
    top = max(suppliers, key=lambda s: s.get("share_of_spend", 0))
    top_share = top.get("share_of_spend", 0)
    return {
        "value": round(top_share * 100, 2),
        "unit": "pct",
        "formula": "max(share_of_spend) across suppliers",
        "inputs": {"suppliers": suppliers},
        "top_supplier": top.get("name"),
        "single_supplier_flag": top_share > 0.5,
    }


def renegotiation_cost(current_unit_price: float, proposed_unit_price: float, annual_volume: float) -> dict:
    delta = (proposed_unit_price - current_unit_price) * annual_volume
    return {
        "value": round(delta, 2),
        "unit": "currency/year",
        "formula": "(proposed_unit_price - current_unit_price) * annual_volume",
        "inputs": {"current_unit_price": current_unit_price, "proposed_unit_price": proposed_unit_price, "annual_volume": annual_volume},
    }


# ---------- Collections ----------

def estimate_cashflow_impact(current_dso: float, segments: list[dict]) -> dict:
    weighted_shift = sum(s.get("share", 0) * s.get("pay_delay_shift_days", 0) for s in segments)
    new_dso = current_dso + weighted_shift
    return {
        "value": round(new_dso, 2),
        "unit": "days",
        "formula": "current_dso + sum(share * pay_delay_shift_days)",
        "inputs": {"current_dso": current_dso, "segments": segments},
        "cash_timing_shift_days": round(weighted_shift, 2),
    }


def late_payment_risk(segments: list[dict]) -> dict:
    exposure = sum(s.get("amount", 0) * s.get("late_probability", 0) for s in segments)
    return {
        "value": round(exposure, 2),
        "unit": "currency",
        "formula": "sum(amount * late_probability)",
        "inputs": {"segments": segments},
    }


# ---------- Operations ----------

def capacity_check(current_capacity: float, projected_demand: float) -> dict:
    utilization = (projected_demand / current_capacity) if current_capacity else float("inf")
    return {
        "value": round(utilization * 100, 2),
        "unit": "pct",
        "formula": "projected_demand / current_capacity",
        "inputs": {"current_capacity": current_capacity, "projected_demand": projected_demand},
        "over_capacity_flag": utilization > 1,
    }


def inventory_needs(demand_forecast: float, lead_time_days: float, current_stock: float, safety_stock: float) -> dict:
    demand_over_lead_time = demand_forecast * (lead_time_days / 30)
    reorder = demand_over_lead_time + safety_stock - current_stock
    return {
        "value": round(max(reorder, 0), 2),
        "unit": "units",
        "formula": "(demand_forecast * lead_time_days/30) + safety_stock - current_stock",
        "inputs": {"demand_forecast": demand_forecast, "lead_time_days": lead_time_days, "current_stock": current_stock, "safety_stock": safety_stock},
        "stockout_risk": reorder > current_stock,
    }


# ---------- Growth ----------

def cannibalization_estimate(new_line_revenue: float, overlap_pct: float, existing_line_revenue: float) -> dict:
    cannibalized = existing_line_revenue * overlap_pct
    net_new = new_line_revenue - cannibalized
    return {
        "value": round(net_new, 2),
        "unit": "currency",
        "formula": "net_new = new_line_revenue - (existing_line_revenue * overlap_pct)",
        "inputs": {"new_line_revenue": new_line_revenue, "overlap_pct": overlap_pct, "existing_line_revenue": existing_line_revenue},
        "cannibalized": round(cannibalized, 2),
    }


TOOL_REGISTRY = {
    "get_metric": get_metric,
    "price_elasticity_impact": price_elasticity_impact,
    "margin_at_price": margin_at_price,
    "segment_churn": segment_churn,
    "project_revenue": project_revenue,
    "revenue_range": revenue_range,
    "supplier_exposure": supplier_exposure,
    "renegotiation_cost": renegotiation_cost,
    "estimate_cashflow_impact": estimate_cashflow_impact,
    "late_payment_risk": late_payment_risk,
    "capacity_check": capacity_check,
    "inventory_needs": inventory_needs,
    "cannibalization_estimate": cannibalization_estimate,
}

ADVISOR_TOOLS = {
    "pricing": ["get_metric", "price_elasticity_impact", "margin_at_price", "segment_churn"],
    "revenue": ["get_metric", "project_revenue", "revenue_range"],
    "supplier": ["get_metric", "supplier_exposure", "renegotiation_cost"],
    "collections": ["get_metric", "estimate_cashflow_impact", "late_payment_risk"],
    "operations": ["get_metric", "capacity_check", "inventory_needs"],
    "growth": ["get_metric", "cannibalization_estimate"],
}

# Compact prompt-text description of each tool, rendered into the advisor's system prompt.
TOOL_DESCRIPTIONS = {
    "get_metric": "get_metric(key: str) -> looks up a raw value from the business data by dotted key, e.g. 'business.monthly_revenue'.",
    "price_elasticity_impact": "price_elasticity_impact(current_price, new_price, base_demand, elasticity) -> projects new demand and revenue change.",
    "margin_at_price": "margin_at_price(price, unit_cost, volume) -> gross margin and margin %.",
    "segment_churn": "segment_churn(segments: [{name, size, price_sensitivity}], price_change_pct) -> churned/retained per segment.",
    "project_revenue": "project_revenue(base_monthly_revenue, monthly_growth_rate, months, decision_delta_pct) -> monthly revenue series.",
    "revenue_range": "revenue_range(point_estimate, uncertainty_pct) -> low/high range around a point estimate.",
    "supplier_exposure": "supplier_exposure(suppliers: [{name, share_of_spend}]) -> top supplier concentration and single-supplier risk flag.",
    "renegotiation_cost": "renegotiation_cost(current_unit_price, proposed_unit_price, annual_volume) -> annual cost delta.",
    "estimate_cashflow_impact": "estimate_cashflow_impact(current_dso, segments: [{share, pay_delay_shift_days}]) -> new days-sales-outstanding.",
    "late_payment_risk": "late_payment_risk(segments: [{amount, late_probability}]) -> weighted late-payment exposure.",
    "capacity_check": "capacity_check(current_capacity, projected_demand) -> utilization % and over-capacity flag.",
    "inventory_needs": "inventory_needs(demand_forecast, lead_time_days, current_stock, safety_stock) -> reorder quantity and stockout risk.",
    "cannibalization_estimate": "cannibalization_estimate(new_line_revenue, overlap_pct, existing_line_revenue) -> net new revenue after cannibalization.",
}
