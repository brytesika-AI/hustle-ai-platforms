from __future__ import annotations

from dataclasses import asdict

from shared.backend.agents.persistent import PersistentAgent


class AgentRegistry:
    def __init__(self) -> None:
        self._agents: dict[str, PersistentAgent] = {}

    def register(self, agent: PersistentAgent) -> None:
        self._agents[agent.agent_id] = agent

    def snapshot(self) -> list[dict]:
        return [asdict(agent) for agent in self._agents.values()]
