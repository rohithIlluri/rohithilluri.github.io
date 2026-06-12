"""High-level orchestration: source → index (cached) → search → GIF."""

from __future__ import annotations

import hashlib
import logging
import shutil
import subprocess
from pathlib import Path

import numpy as np

from .embeddings import Embedder, get_embedder
from .index import VideoIndex, build_index
from .llm import ClaudeAssistant, QueryPlan
from .render import render_gif
from .search import search
from .types import Match

log = logging.getLogger(__name__)

DEFAULT_WORKDIR = Path.home() / ".cache" / "gifscout"


def resolve_source(source: str, workdir: Path) -> Path:
    """Return a local video path; download URLs with yt-dlp."""
    if not source.startswith(("http://", "https://")):
        path = Path(source).expanduser()
        if not path.exists():
            raise FileNotFoundError(f"Video not found: {source}")
        return path
    if shutil.which("yt-dlp") is None:
        raise RuntimeError("yt-dlp is required to ingest URLs: pip install yt-dlp")
    downloads = workdir / "downloads"
    downloads.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256(source.encode()).hexdigest()[:16]
    existing = list(downloads.glob(f"{digest}.*"))
    if existing:
        return existing[0]
    subprocess.run(
        [
            "yt-dlp",
            "-f", "bv*[height<=720]+ba/b[height<=720]/b",
            "--merge-output-format", "mp4",
            "-o", str(downloads / f"{digest}.%(ext)s"),
            source,
        ],
        check=True,
    )
    downloaded = list(downloads.glob(f"{digest}.*"))
    if not downloaded:
        raise RuntimeError(f"yt-dlp produced no file for {source}")
    return downloaded[0]


class GifScout:
    """The main entry point: index videos and find GIF-able moments."""

    def __init__(
        self,
        workdir: str | Path = DEFAULT_WORKDIR,
        embedder: str | Embedder = "auto",
        fps: float = 2.0,
        use_llm: bool = True,
        model: str | None = None,
    ):
        self.workdir = Path(workdir)
        self.workdir.mkdir(parents=True, exist_ok=True)
        self.embedder = embedder if not isinstance(embedder, str) else get_embedder(embedder)
        self.fps = fps
        kwargs = {"model": model} if model else {}
        self.assistant = ClaudeAssistant(**kwargs) if use_llm else None
        self._indexes: dict[str, VideoIndex] = {}

    # ---- indexing -------------------------------------------------------

    def _cache_key(self, video: Path) -> str:
        stat = video.stat()
        raw = f"{video.resolve()}|{stat.st_size}|{stat.st_mtime_ns}|{self.fps}|{self.embedder.name}"
        return hashlib.sha256(raw.encode()).hexdigest()[:20]

    def index_video(self, source: str, force: bool = False) -> VideoIndex:
        video = resolve_source(source, self.workdir)
        key = self._cache_key(video)
        if not force and key in self._indexes:
            return self._indexes[key]
        cache_dir = self.workdir / "index" / key
        if not force and (cache_dir / "manifest.json").exists():
            index = VideoIndex.load(cache_dir)
        else:
            index = build_index(video, self.embedder, fps=self.fps)
            index.save(cache_dir)
        self._indexes[key] = index
        return index

    # ---- search ---------------------------------------------------------

    def plan_query(self, query: str) -> QueryPlan:
        if self.assistant and self.assistant.available:
            return self.assistant.expand_query(query)
        return QueryPlan(visual_queries=[query])

    def find(
        self, source: str, query: str, top_k: int = 5, **search_kwargs
    ) -> tuple[list[Match], QueryPlan]:
        index = self.index_video(source)
        plan = self.plan_query(query)
        embeddings = self.embedder.embed_texts(plan.visual_queries)
        matches = search(index, np.asarray(embeddings), top_k=top_k, **search_kwargs)
        return matches, plan

    # ---- rendering ------------------------------------------------------

    def snip(
        self,
        source: str,
        query: str,
        out_path: str | Path | None = None,
        fps: int = 14,
        width: int = 480,
        caption: str | None = None,
        auto_caption: bool = False,
        boomerang: bool = False,
        pick: int = 0,
    ) -> tuple[Path, Match, QueryPlan]:
        """Find the best moment for `query` and render it as a GIF."""
        matches, plan = self.find(source, query, top_k=max(pick + 1, 3))
        if not matches:
            raise RuntimeError(f"No matching moment found for {query!r}")
        match = matches[min(pick, len(matches) - 1)]
        if caption is None and auto_caption:
            caption = plan.caption
        if out_path is None:
            slug = "".join(c if c.isalnum() else "-" for c in query.lower())[:48].strip("-")
            out_path = self.workdir / "gifs" / f"{slug or 'gif'}.gif"
        path = render_gif(
            match.video, match.start, match.end, out_path,
            fps=fps, width=width, caption=caption, boomerang=boomerang,
        )
        return path, match, plan
