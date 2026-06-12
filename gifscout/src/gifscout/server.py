"""FastAPI server: web UI + JSON API.

Run with `gifscout serve` (requires `pip install gifscout[server]`).
"""

from __future__ import annotations

import base64
import hashlib
import io
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel, Field

from .media import extract_frame
from .pipeline import GifScout
from .render import render_gif

WEB_DIR = Path(__file__).parent / "web"


class IndexRequest(BaseModel):
    source: str = Field(description="Local path or URL of the video")
    force: bool = False


class SearchRequest(BaseModel):
    source: str
    query: str
    top_k: int = 6
    thumbnails: bool = True


class GifRequest(BaseModel):
    source: str
    start: float
    end: float
    fps: int = 14
    width: int = 480
    caption: str | None = None
    boomerang: bool = False


def create_app(scout: GifScout | None = None) -> FastAPI:
    scout = scout or GifScout()
    app = FastAPI(title="GifScout", version="0.1.0")
    gif_dir = scout.workdir / "gifs"

    @app.get("/", response_class=HTMLResponse)
    def home() -> str:
        return (WEB_DIR / "index.html").read_text()

    @app.post("/api/index")
    def index_video(req: IndexRequest) -> dict:
        try:
            index = scout.index_video(req.source, force=req.force)
        except FileNotFoundError as exc:
            raise HTTPException(404, str(exc)) from exc
        return {
            "video": index.video,
            "duration": index.duration,
            "frames": index.n_frames,
            "shots": len(index.shots),
            "embedder": index.embedder_name,
        }

    @app.post("/api/search")
    def search_video(req: SearchRequest) -> dict:
        try:
            matches, plan = scout.find(req.source, req.query, top_k=req.top_k)
        except FileNotFoundError as exc:
            raise HTTPException(404, str(exc)) from exc
        results = []
        for m in matches:
            item = m.to_dict()
            if req.thumbnails:
                frame = extract_frame(m.video, m.best_frame_t, width=320)
                buf = io.BytesIO()
                frame.save(buf, format="JPEG", quality=80)
                item["thumbnail"] = "data:image/jpeg;base64," + base64.standard_b64encode(
                    buf.getvalue()
                ).decode()
            results.append(item)
        return {
            "query": req.query,
            "visual_queries": plan.visual_queries,
            "suggested_caption": plan.caption,
            "source_guess": plan.source_guess,
            "matches": results,
        }

    @app.post("/api/gif")
    def make_gif(req: GifRequest) -> FileResponse:
        video = Path(req.source).expanduser()
        if not video.exists():
            raise HTTPException(404, f"Video not found: {req.source}")
        if req.end <= req.start:
            raise HTTPException(422, "end must be greater than start")
        stamp = hashlib.sha256(
            f"{video}|{req.start}|{req.end}|{req.fps}|{req.width}|{req.caption}|{req.boomerang}".encode()
        ).hexdigest()[:16]
        out = gif_dir / f"{stamp}.gif"
        if not out.exists():
            render_gif(
                video, req.start, req.end, out,
                fps=req.fps, width=req.width,
                caption=req.caption, boomerang=req.boomerang,
            )
        return FileResponse(out, media_type="image/gif", filename=out.name)

    @app.get("/api/health")
    def health() -> dict:
        return {"status": "ok", "embedder": scout.embedder.name}

    return app
