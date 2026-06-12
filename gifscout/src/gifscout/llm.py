"""Claude-powered query understanding and GIF reranking (optional).

Everything here degrades gracefully: if `anthropic` isn't installed or
ANTHROPIC_API_KEY isn't set, callers get pass-through behavior.
"""

from __future__ import annotations

import base64
import json
import logging
import os
import re
from dataclasses import dataclass, field

from .types import GifCandidate

log = logging.getLogger(__name__)

DEFAULT_MODEL = "claude-opus-4-8"

QUERY_PLAN_SCHEMA = {
    "type": "object",
    "properties": {
        "visual_queries": {
            "type": "array",
            "items": {"type": "string"},
            "description": "3-5 short literal visual descriptions of the moment, "
            "phrased like CLIP captions (subjects, actions, setting).",
        },
        "caption": {
            "type": ["string", "null"],
            "description": "A short punchy caption to burn into the GIF, or null.",
        },
        "source_guess": {
            "type": ["string", "null"],
            "description": "The movie/show this is probably from, or null.",
        },
    },
    "required": ["visual_queries", "caption", "source_guess"],
    "additionalProperties": False,
}


@dataclass
class QueryPlan:
    visual_queries: list[str] = field(default_factory=list)
    caption: str | None = None
    source_guess: str | None = None


class ClaudeAssistant:
    def __init__(self, model: str = DEFAULT_MODEL, api_key: str | None = None):
        self.model = model
        self._api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        self._client = None

    @property
    def available(self) -> bool:
        if not self._api_key:
            return False
        try:
            import anthropic  # noqa: F401, PLC0415
        except ImportError:
            return False
        return True

    @property
    def client(self):
        if self._client is None:
            import anthropic  # noqa: PLC0415

            self._client = anthropic.Anthropic(api_key=self._api_key)
        return self._client

    def _create(self, **kwargs):
        """messages.create with a fallback for SDKs predating output_config."""
        try:
            return self.client.messages.create(**kwargs)
        except TypeError:
            kwargs.pop("output_config", None)
            return self.client.messages.create(**kwargs)

    def expand_query(self, query: str) -> QueryPlan:
        """Turn a fuzzy request ('the you-shall-not-pass moment') into literal
        visual descriptions CLIP can match, plus a suggested caption."""
        if not self.available:
            return QueryPlan(visual_queries=[query])
        try:
            response = self._create(
                model=self.model,
                max_tokens=1024,
                system=(
                    "You translate GIF requests into literal visual descriptions "
                    "for a CLIP-based video search engine. Describe only what is "
                    "visible on screen: people, actions, expressions, settings, "
                    "framing. Respond with JSON only."
                ),
                messages=[
                    {
                        "role": "user",
                        "content": f"GIF request: {query}\n\n"
                        'Respond with JSON: {"visual_queries": [3-5 strings], '
                        '"caption": string or null, "source_guess": string or null}',
                    }
                ],
                output_config={"format": {"type": "json_schema", "schema": QUERY_PLAN_SCHEMA}},
            )
            data = _parse_json(_response_text(response))
            plan = QueryPlan(
                visual_queries=[q for q in data.get("visual_queries", []) if q] or [query],
                caption=data.get("caption"),
                source_guess=data.get("source_guess"),
            )
            if query not in plan.visual_queries:
                plan.visual_queries.append(query)
            return plan
        except Exception:  # API/network errors must never break local search
            log.exception("Claude query expansion failed; using the raw query")
            return QueryPlan(visual_queries=[query])

    def rerank_candidates(
        self, query: str, candidates: list[GifCandidate], previews: list[bytes]
    ) -> list[int]:
        """Order existing GIF candidates by fit, judging their preview images.

        `previews` are JPEG/PNG/GIF-first-frame bytes aligned with `candidates`.
        Returns candidate indices, best first.
        """
        if not self.available or not candidates:
            return list(range(len(candidates)))
        content: list[dict] = [
            {
                "type": "text",
                "text": f"GIF request: {query!r}. Below are numbered candidate "
                "previews. Respond with JSON only: "
                '{"ranking": [indices, best match first]}',
            }
        ]
        for i, (cand, blob) in enumerate(zip(candidates, previews)):
            content.append({"type": "text", "text": f"Candidate {i}: {cand.title}"})
            content.append(
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": _sniff_media_type(blob),
                        "data": base64.standard_b64encode(blob).decode(),
                    },
                }
            )
        try:
            response = self._create(
                model=self.model, max_tokens=512,
                messages=[{"role": "user", "content": content}],
            )
            ranking = _parse_json(_response_text(response)).get("ranking", [])
            valid = [i for i in ranking if isinstance(i, int) and 0 <= i < len(candidates)]
            remainder = [i for i in range(len(candidates)) if i not in valid]
            return valid + remainder
        except Exception:
            log.exception("Claude rerank failed; keeping provider order")
            return list(range(len(candidates)))


def _response_text(response) -> str:
    if getattr(response, "stop_reason", None) == "refusal":
        raise RuntimeError("Claude declined the request")
    parts = [b.text for b in response.content if getattr(b, "type", "") == "text"]
    return "\n".join(parts)


def _parse_json(text: str) -> dict:
    """Parse JSON from a response, tolerating surrounding prose/code fences."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, flags=re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


def _sniff_media_type(blob: bytes) -> str:
    if blob[:3] == b"GIF":
        return "image/gif"
    if blob[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if blob[:4] == b"RIFF" and blob[8:12] == b"WEBP":
        return "image/webp"
    return "image/jpeg"
