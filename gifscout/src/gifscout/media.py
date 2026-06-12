"""Thin wrappers around ffmpeg/ffprobe for probing and frame extraction."""

from __future__ import annotations

import json
import shutil
import subprocess
from collections.abc import Iterator
from pathlib import Path

from PIL import Image


class FFmpegNotFoundError(RuntimeError):
    pass


def require_ffmpeg() -> None:
    if shutil.which("ffmpeg") is None or shutil.which("ffprobe") is None:
        raise FFmpegNotFoundError(
            "ffmpeg/ffprobe not found on PATH. Install ffmpeg "
            "(https://ffmpeg.org/download.html) to index videos and render GIFs."
        )


def probe_duration(video: str | Path) -> float:
    """Return the duration of a video in seconds."""
    require_ffmpeg()
    out = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "json",
            str(video),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(json.loads(out.stdout)["format"]["duration"])


def iter_frames(
    video: str | Path,
    fps: float = 2.0,
    width: int = 224,
    height: int = 224,
) -> Iterator[tuple[float, Image.Image]]:
    """Yield (timestamp, PIL image) pairs sampled at `fps` from the video.

    Frames are decoded by ffmpeg into a raw RGB pipe so no temporary files
    are written. Timestamps are the centers of each sampling interval.
    """
    require_ffmpeg()
    cmd = [
        "ffmpeg", "-v", "error",
        "-i", str(video),
        "-vf", f"fps={fps},scale={width}:{height}",
        "-pix_fmt", "rgb24",
        "-f", "rawvideo",
        "-",
    ]
    frame_bytes = width * height * 3
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    assert proc.stdout is not None
    try:
        i = 0
        while True:
            buf = proc.stdout.read(frame_bytes)
            if len(buf) < frame_bytes:
                break
            t = (i + 0.5) / fps
            yield t, Image.frombytes("RGB", (width, height), buf)
            i += 1
    finally:
        proc.stdout.close()
        proc.wait()
    if proc.returncode not in (0, None) and i == 0:
        stderr = proc.stderr.read().decode(errors="replace") if proc.stderr else ""
        raise RuntimeError(f"ffmpeg failed to decode {video}: {stderr[-800:]}")


def extract_frame(video: str | Path, t: float, width: int = 480) -> Image.Image:
    """Grab a single frame at time `t` (used for thumbnails)."""
    require_ffmpeg()
    out = subprocess.run(
        [
            "ffmpeg", "-v", "error",
            "-ss", f"{max(t, 0):.3f}",
            "-i", str(video),
            "-frames:v", "1",
            "-vf", f"scale={width}:-2",
            "-pix_fmt", "rgb24",
            "-f", "image2pipe",
            "-vcodec", "png",
            "-",
        ],
        capture_output=True,
        check=True,
    )
    import io

    return Image.open(io.BytesIO(out.stdout)).convert("RGB")
