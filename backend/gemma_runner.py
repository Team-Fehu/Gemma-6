"""GemmaRunner: the only module that knows about the model.

One model in memory at a time. A lock guards every generation so two
requests can never hit Ollama concurrently and thrash the device.
"""
import asyncio
import json
import os
import re
from dataclasses import dataclass, field

import httpx

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
MODEL_NAME = os.environ.get("GEMMA_MODEL", "gemma3:4b")
MAX_TOOL_STEPS = 5

TOOL_CALL_RE = re.compile(r"```tool_call\s*(\{.*?\})\s*```", re.DOTALL)


@dataclass
class BusyError(Exception):
    message: str = "Advisors are still thinking. Try again in a moment."


class GemmaRunner:
    """Single-model gateway. Ollama-local by default; swap backend here only."""

    def __init__(self):
        self.lock = asyncio.Lock()
        self._client = httpx.AsyncClient(timeout=120.0)

    def is_locked(self) -> bool:
        return self.lock.locked()

    async def _generate(self, system_prompt: str, messages: list[dict]) -> str:
        """One raw call to Ollama's chat endpoint. Caller already holds the lock."""
        payload = {
            "model": MODEL_NAME,
            "messages": [{"role": "system", "content": system_prompt}] + messages,
            "stream": False,
            "options": {"temperature": 0.3},
        }
        resp = await self._client.post(f"{OLLAMA_HOST}/api/chat", json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["message"]["content"]

    @staticmethod
    def _extract_tool_call(text: str) -> dict | None:
        match = TOOL_CALL_RE.search(text)
        if not match:
            return None
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            return None

    async def run(
        self,
        system_prompt: str,
        messages: list[dict],
        tool_registry: dict | None = None,
        allowed_tools: set[str] | None = None,
        tool_log: list | None = None,
        acquire_lock: bool = True,
    ) -> str:
        """Run a generation, resolving tool calls in a loop if tools are offered.

        Returns the final free-text answer (the report, or a chat reply).
        Raises BusyError if the lock is held and acquire_lock=True with nowait semantics.
        """
        if acquire_lock:
            if self.lock.locked():
                raise BusyError()
            async with self.lock:
                return await self._run_locked(system_prompt, messages, tool_registry, allowed_tools, tool_log)
        else:
            return await self._run_locked(system_prompt, messages, tool_registry, allowed_tools, tool_log)

    async def _run_locked(self, system_prompt, messages, tool_registry, allowed_tools, tool_log):
        convo = list(messages)
        for _step in range(MAX_TOOL_STEPS):
            text = await self._generate(system_prompt, convo)
            call = self._extract_tool_call(text) if tool_registry else None
            if not call:
                return text

            name = call.get("name")
            args = call.get("args", {})
            convo.append({"role": "assistant", "content": text})

            if not allowed_tools or name not in allowed_tools or name not in tool_registry:
                result = {"error": f"tool '{name}' is not available to this advisor", "value": None}
            else:
                try:
                    result = tool_registry[name](**args)
                except Exception as exc:  # noqa: BLE001 - surfaced to the model as a grounding gap
                    result = {"error": str(exc), "value": None}

            if tool_log is not None:
                tool_log.append({"tool": name, "args": args, "result": result})

            result_block = f"```tool_result\n{json.dumps({'name': name, **result})}\n```"
            convo.append({"role": "user", "content": result_block})

        # Step cap hit: force a final answer with no more tool access.
        forced = await self._generate(
            system_prompt + "\n\nYou have used all your tool calls. Write your final report now using only what you already know.",
            convo,
        )
        return forced


gemma_runner = GemmaRunner()
