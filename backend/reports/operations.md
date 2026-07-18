# Operations Advisor Report

## Verdict
caution

## Summary
Raising the price of the sourdough loaf by 10% will significantly increase demand, leading to capacity overload. Current capacity is 2500 units, and projected demand is 3000 units. This represents a 20% increase, exceeding current capacity.

## Key findings
- Projected demand is 3000 units.
- Current capacity is 2500 units.
- Capacity utilization will be 120%.
- Lead time is 2 days.

## Numbers
- get_metric("business.monthly_revenue") = 85000
- capacity_check(2500, 3000)['value'] = 120.0
- capacity_check(2500, 3000)['over_capacity_flag'] = true

## Risks
- Production capacity will be exceeded.
- Potential for stockouts.

## Recommendation
Assess the impact of increased demand before proceeding.

## Open questions
- What is the projected increase in sales volume?
- Can the lead time be reduced?