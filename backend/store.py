"""ReportStore: disk is the shared memory. No agent stays alive; its report does."""
import json
from pathlib import Path

BASE_DIR = Path(__file__).parent
REPORTS_DIR = BASE_DIR / "reports"
DATA_DIR = BASE_DIR / "data"
SESSIONS_DIR = BASE_DIR / "sessions"

for d in (REPORTS_DIR, DATA_DIR, SESSIONS_DIR):
    d.mkdir(exist_ok=True)

BUSINESS_CONTEXT_PATH = DATA_DIR / "business_context.json"
DECISION_PATH = DATA_DIR / "decision.txt"


def save_run_input(business_context: dict, decision: str) -> None:
    BUSINESS_CONTEXT_PATH.write_text(json.dumps(business_context, indent=2))
    DECISION_PATH.write_text(decision)


def load_business_context() -> dict:
    if not BUSINESS_CONTEXT_PATH.exists():
        return {}
    return json.loads(BUSINESS_CONTEXT_PATH.read_text())


def load_decision() -> str:
    if not DECISION_PATH.exists():
        return ""
    return DECISION_PATH.read_text()


def write_report(advisor_id: str, markdown: str) -> None:
    (REPORTS_DIR / f"{advisor_id}.md").write_text(markdown)


def read_report(advisor_id: str) -> str | None:
    path = REPORTS_DIR / f"{advisor_id}.md"
    return path.read_text() if path.exists() else None


def read_all_reports() -> dict:
    out = {}
    for path in REPORTS_DIR.glob("*.md"):
        out[path.stem] = path.read_text()
    return out


def append_tool_log(advisor_id: str, entries: list[dict]) -> None:
    path = REPORTS_DIR / f"{advisor_id}.tools.jsonl"
    with path.open("a") as f:
        for entry in entries:
            f.write(json.dumps(entry) + "\n")


def load_session(session_id: str) -> list[dict]:
    path = SESSIONS_DIR / f"{session_id}.json"
    if not path.exists():
        return []
    return json.loads(path.read_text())


def save_session(session_id: str, transcript: list[dict], cap: int = 20) -> None:
    path = SESSIONS_DIR / f"{session_id}.json"
    path.write_text(json.dumps(transcript[-cap:], indent=2))


def load_examples() -> dict:
    path = DATA_DIR / "examples.json"
    if not path.exists():
        return {"examples": []}
    return json.loads(path.read_text())


def clear_all() -> None:
    """Wipes reports, tool logs, chat sessions, and the last run's input.

    Used by /api/reset so a fresh visit doesn't inherit a previous run's
    finished state (RunState is a single process-wide singleton, not
    scoped per browser session).
    """
    for path in REPORTS_DIR.glob("*"):
        path.unlink()
    for path in SESSIONS_DIR.glob("*"):
        path.unlink()
    BUSINESS_CONTEXT_PATH.unlink(missing_ok=True)
    DECISION_PATH.unlink(missing_ok=True)
