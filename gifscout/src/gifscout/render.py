"""High-quality GIF (and MP4) rendering with ffmpeg.

Uses the palettegen/paletteuse pair in a single filter graph for crisp,
banding-free GIFs, with optional burned-in captions and boomerang looping.
"""

from __future__ import annotations

import subprocess
from pathlib import Path

from .media import require_ffmpeg


def escape_drawtext(text: str) -> str:
    """Escape a string for ffmpeg's drawtext filter."""
    out = []
    for ch in text:
        if ch in "\\':%":
            out.append("\\" + ch)
        elif ch == ",":
            out.append("\\,")
        elif ch == "[" or ch == "]":
            out.append("\\" + ch)
        else:
            out.append(ch)
    return "".join(out)


def build_filtergraph(
    fps: int = 14,
    width: int = 480,
    caption: str | None = None,
    boomerang: bool = False,
) -> str:
    """Compose the ffmpeg filter_complex used by render_gif."""
    stages = [f"fps={fps}", f"scale={width}:-2:flags=lanczos"]
    if caption:
        text = escape_drawtext(caption)
        stages.append(
            "drawtext=text='%s':fontcolor=white:borderw=2:bordercolor=black:"
            "fontsize=h/9:x=(w-text_w)/2:y=h-text_h-h/16" % text
        )
    chain = ",".join(stages)
    if boomerang:
        return (
            f"[0:v]{chain},split[fwd][tmp];"
            "[tmp]reverse[rev];[fwd][rev]concat=n=2:v=1[seq];"
            "[seq]split[a][b];[a]palettegen=stats_mode=diff[p];"
            "[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle[out]"
        )
    return (
        f"[0:v]{chain},split[a][b];"
        "[a]palettegen=stats_mode=diff[p];"
        "[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle[out]"
    )


def render_gif(
    video: str | Path,
    start: float,
    end: float,
    out_path: str | Path,
    fps: int = 14,
    width: int = 480,
    caption: str | None = None,
    boomerang: bool = False,
) -> Path:
    """Cut [start, end] from `video` and render an optimized GIF."""
    require_ffmpeg()
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    duration = max(end - start, 0.1)
    cmd = [
        "ffmpeg", "-v", "error", "-y",
        "-ss", f"{max(start, 0):.3f}",
        "-t", f"{duration:.3f}",
        "-i", str(video),
        "-filter_complex", build_filtergraph(fps, width, caption, boomerang),
        "-map", "[out]",
        "-loop", "0",
        str(out_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg GIF render failed: {result.stderr[-800:]}")
    return out_path


def render_mp4(
    video: str | Path,
    start: float,
    end: float,
    out_path: str | Path,
    width: int = 720,
) -> Path:
    """Cut a silent MP4 clip (smaller than a GIF, good for previews)."""
    require_ffmpeg()
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-v", "error", "-y",
        "-ss", f"{max(start, 0):.3f}",
        "-t", f"{max(end - start, 0.1):.3f}",
        "-i", str(video),
        "-vf", f"scale={width}:-2",
        "-an",
        "-movflags", "+faststart",
        str(out_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg MP4 render failed: {result.stderr[-800:]}")
    return out_path
