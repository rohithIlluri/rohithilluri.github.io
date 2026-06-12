"""Instant mode: search existing GIF libraries (Tenor, GIPHY).

Used when the user wants *a* GIF of a famous moment right now, rather than
cutting one from their own video. Both providers need free API keys:
  TENOR_API_KEY  — https://developers.google.com/tenor
  GIPHY_API_KEY  — https://developers.giphy.com
"""

from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request

from .types import GifCandidate

_TIMEOUT = 15


def _get_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "gifscout/0.1"})
    with urllib.request.urlopen(req, timeout=_TIMEOUT) as resp:
        return json.loads(resp.read().decode())


def fetch_bytes(url: str, max_bytes: int = 4_000_000) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "gifscout/0.1"})
    with urllib.request.urlopen(req, timeout=_TIMEOUT) as resp:
        return resp.read(max_bytes)


class TenorProvider:
    name = "tenor"

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.environ.get("TENOR_API_KEY")

    @property
    def available(self) -> bool:
        return bool(self.api_key)

    def search(self, query: str, limit: int = 8) -> list[GifCandidate]:
        params = urllib.parse.urlencode(
            {"q": query, "key": self.api_key, "limit": limit, "media_filter": "gif,tinygif"}
        )
        data = _get_json(f"https://tenor.googleapis.com/v2/search?{params}")
        out = []
        for item in data.get("results", []):
            media = item.get("media_formats", {})
            gif = media.get("gif", {}).get("url")
            preview = media.get("tinygif", {}).get("url") or gif
            if gif:
                out.append(
                    GifCandidate(
                        url=gif,
                        preview_url=preview,
                        title=item.get("content_description", ""),
                        source=self.name,
                    )
                )
        return out


class GiphyProvider:
    name = "giphy"

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.environ.get("GIPHY_API_KEY")

    @property
    def available(self) -> bool:
        return bool(self.api_key)

    def search(self, query: str, limit: int = 8) -> list[GifCandidate]:
        params = urllib.parse.urlencode(
            {"q": query, "api_key": self.api_key, "limit": limit, "rating": "pg-13"}
        )
        data = _get_json(f"https://api.giphy.com/v1/gifs/search?{params}")
        out = []
        for item in data.get("data", []):
            images = item.get("images", {})
            gif = images.get("original", {}).get("url")
            preview = images.get("fixed_width_small_still", {}).get("url") or gif
            if gif:
                out.append(
                    GifCandidate(
                        url=gif,
                        preview_url=preview,
                        title=item.get("title", ""),
                        source=self.name,
                    )
                )
        return out


def search_web_gifs(query: str, limit: int = 8) -> list[GifCandidate]:
    """Search all configured providers, interleaving their results."""
    providers = [p for p in (TenorProvider(), GiphyProvider()) if p.available]
    if not providers:
        raise RuntimeError(
            "No GIF provider configured. Set TENOR_API_KEY and/or GIPHY_API_KEY."
        )
    per = max(limit // len(providers), 1)
    results: list[GifCandidate] = []
    for provider in providers:
        try:
            results.extend(provider.search(query, limit=per))
        except Exception:
            continue
    return results[:limit]
