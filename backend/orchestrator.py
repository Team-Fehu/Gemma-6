"""Runs the six advisors in sequence, then the front desk synthesis.

Sequential on purpose: one model in memory, one generation at a time.
Progress is tracked in a plain in-memory RunState that /api/status reads.
"""
import json

import advisors
import store
import tools
from front_desk import synthesize
from gemma_runner import gemma_runner


class RunState:
    def __init__(self):
        self.state = "idle"  # idle | running | done | error
        self.run_id: str | None = None
        self.current_advisor: str | None = None
        self.completed: list[str] = []
        self.error: str | None = None

    def to_dict(self):
        return {
            "state": self.state,
            "run_id": self.run_id,
            "current_advisor": self.current_advisor,
            "completed": self.completed,
            "order": advisors.ADVISOR_ORDER + ["front_desk"],
            "error": self.error,
        }

    def reset(self):
        self.state = "idle"
        self.run_id = None
        self.current_advisor = None
        self.completed = []
        self.error = None


run_state = RunState()


async def run_analysis(run_id: str, business_context: dict, decision: str) -> None:
    run_state.state = "running"
    run_state.run_id = run_id
    run_state.completed = []
    run_state.error = None

    store.save_run_input(business_context, decision)
    tools.set_business_context(business_context)

    input_message = {
        "role": "user",
        "content": f"business_context:\n```json\n{json.dumps(business_context, indent=2)}\n```\n\ndecision under test:\n{decision}",
    }

    try:
        for advisor_id in advisors.ADVISOR_ORDER:
            run_state.current_advisor = advisor_id
            system_prompt = advisors.build_system_prompt(advisor_id)
            tool_log: list[dict] = []
            report = await gemma_runner.run(
                system_prompt,
                [input_message],
                tool_registry=tools.TOOL_REGISTRY,
                allowed_tools=set(tools.ADVISOR_TOOLS[advisor_id]),
                tool_log=tool_log,
            )
            store.write_report(advisor_id, report)
            store.append_tool_log(advisor_id, tool_log)
            run_state.completed.append(advisor_id)

        run_state.current_advisor = "front_desk"
        reports = store.read_all_reports()
        overview = await synthesize(reports)
        store.write_report("overview", overview)
        run_state.completed.append("front_desk")

        run_state.state = "done"
        run_state.current_advisor = None
    except Exception as exc:  # noqa: BLE001 - surfaced to the frontend, not swallowed
        run_state.state = "error"
        run_state.error = str(exc)
        run_state.current_advisor = None
