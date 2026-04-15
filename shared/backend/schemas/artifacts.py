from __future__ import annotations

from pydantic import BaseModel


class ArtifactManifest(BaseModel):
    root: str
    categories: dict[str, str]
