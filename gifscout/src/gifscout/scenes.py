"""Shot boundary detection.

Strategy, best-first:
  1. PySceneDetect (if installed) — content-aware detector.
  2. ffmpeg's `scdet`-style scene score filter — no extra deps.
  3. Fixed-length windows — always works, even without ffmpeg.
"""

from __future__ import annotations

import re
import shutil
import subprocess
from pathlib import Path

from .types import Shot

_SCENE_RE = re.compile(r"pts_time:(\d+(?:\.\d+)?)")


def fixed_windows(duration: float, window: float = 4.0) -> list[Shot]:
    """Split [0, duration] into fixed windows. Last fragment merges if tiny."""
    if duration <= 0:
        return []
    shots: list[Shot] = []
    t = 0.0
    while t < duration:
        end = min(t + window, duration)
        shots.append(Shot(t, end))
        t = end
    if len(shots) >= 2 and shots[-1].duration < window * 0.25:
        last = shots.pop()
        prev = shots.pop()
        shots.append(Shot(prev.start, last.end))
    return shots


def _shots_from_boundaries(
    boundaries: list[float], duration: float, min_len: float
) -> list[Shot]:
    cuts = [0.0] + sorted(b for b in boundaries if 0 < b < duration) + [duration]
    shots: list[Shot] = []
    for a, b in zip(cuts, cuts[1:]):
        if b - a < 1e-3:
            continue
        if shots and (b - a) < min_len:
            prev = shots.pop()
            shots.append(Shot(prev.start, b))
        else:
            shots.append(Shot(a, b))
    return shots


def detect_shots_ffmpeg(
    video: str | Path, duration: float, threshold: float = 0.27, min_len: float = 0.6
) -> list[Shot]:
    """Detect shot boundaries with ffmpeg's scene-change score."""
    proc = subprocess.run(
        [
            "ffmpeg", "-v", "info",
            "-i", str(video),
            "-vf", f"select='gt(scene,{threshold})',showinfo",
            "-f", "null", "-",
        ],
        capture_output=True,
        text=True,
    )
    boundaries = [float(m) for m in _SCENE_RE.findall(proc.stderr)]
    return _shots_from_boundaries(boundaries, duration, min_len)


def detect_shots_pyscenedetect(
    video: str | Path, min_len: float = 0.6
) -> list[Shot] | None:
    try:
        from scenedetect import ContentDetector, detect  # type: ignore
    except ImportError:
        return None
    scene_list = detect(str(video), ContentDetector(min_scene_len=int(min_len * 24)))
    if not scene_list:
        return None
    return [Shot(s.get_seconds(), e.get_seconds()) for s, e in scene_list]


def detect_shots(
    video: str | Path,
    duration: float,
    threshold: float = 0.27,
    min_len: float = 0.6,
    fallback_window: float = 4.0,
) -> list[Shot]:
    """Best-available shot detection with graceful fallbacks."""
    shots = detect_shots_pyscenedetect(video, min_len=min_len)
    if shots:
        return shots
    if shutil.which("ffmpeg"):
        shots = detect_shots_ffmpeg(video, duration, threshold=threshold, min_len=min_len)
        if shots:
            return shots
    return fixed_windows(duration, window=fallback_window)


def shot_index_for(shots: list[Shot], t: float) -> int:
    """Map a timestamp to the index of the shot containing it."""
    for i, shot in enumerate(shots):
        if shot.start <= t < shot.end:
            return i
    return max(len(shots) - 1, 0)
