"""Interactive per-advisor chat: reload the role's prompt + its report, no live agent."""
import advisors
import store
import tools
from gemma_runner import gemma_runner


async def chat(advisor_id: str, session_id: str, message: str) -> str:
    report = store.read_report(advisor_id)
    if report is None:
        raise FileNotFoundError(f"no report yet for advisor '{advisor_id}'")

    system_prompt = advisors.build_system_prompt(advisor_id) + (
        "\n\nYou already wrote the report below. The owner is now asking follow-up "
        "questions about it. Answer conversationally, grounded in the report and the "
        "business data. Do not re-emit the full report format."
    )

    transcript = store.load_session(session_id)
    business_context = store.load_business_context()
    tools.set_business_context(business_context)

    convo = [
        {"role": "user", "content": f"business_context:\n{business_context}\n\nYour report:\n{report}"},
        *transcript,
        {"role": "user", "content": message},
    ]

    tool_log: list[dict] = []
    answer = await gemma_runner.run(
        system_prompt,
        convo,
        tool_registry=tools.TOOL_REGISTRY,
        allowed_tools=set(tools.ADVISOR_TOOLS[advisor_id]),
        tool_log=tool_log,
    )
    if tool_log:
        store.append_tool_log(advisor_id, tool_log)

    transcript.append({"role": "user", "content": message})
    transcript.append({"role": "assistant", "content": answer})
    store.save_session(session_id, transcript)

    return answer
