"""Front desk: reads all six reports, synthesizes, and answers general questions.

Never re-derives numbers. Cites which advisor said what.
"""
from advisors import FRONT_DESK_PROMPT, FRONT_DESK_SYNTHESIS_PROMPT
from gemma_runner import gemma_runner


def _reports_block(reports: dict) -> str:
    order = ["pricing", "revenue", "supplier", "collections", "operations", "growth"]
    parts = []
    for advisor_id in order:
        if advisor_id in reports:
            parts.append(f"--- {advisor_id} ---\n{reports[advisor_id]}")
    return "\n\n".join(parts)


async def synthesize(reports: dict) -> str:
    message = {"role": "user", "content": f"Here are the six reports:\n\n{_reports_block(reports)}\n\nWrite the synthesis."}
    return await gemma_runner.run(FRONT_DESK_SYNTHESIS_PROMPT, [message])


async def answer(reports: dict, transcript: list[dict], message: str) -> str:
    context_msg = {"role": "user", "content": f"Here are the six reports:\n\n{_reports_block(reports)}"}
    convo = [context_msg] + transcript + [{"role": "user", "content": message}]
    return await gemma_runner.run(FRONT_DESK_PROMPT, convo)
