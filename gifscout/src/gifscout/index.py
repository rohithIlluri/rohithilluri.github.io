"""Build, save, and load per-video search indexes."""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from .embeddings import Embedder
from .media import iter_frames, probe_duration
from .scenes import detect_shots, shot_index_for
from .types import Shot

log = logging.getLogger(__name__)

MANIFEST = "manifest.json"
VECTORS = "vectors.npz"


@dataclass
class VideoIndex:
    video: str
    duration: float
    fps: float
    embedder_name: str
    shots: list[Shot]
    timestamps: np.ndarray  # (n,) seconds for each sampled frame
    shot_ids: np.ndarray  # (n,) index into `shots` per frame
    embeddings: np.ndarray  # (n, d) L2-normalized frame embeddings

    @property
    def n_frames(self) -> int:
        return len(self.timestamps)

    def save(self, directory: str | Path) -> Path:
        directory = Path(directory)
        directory.mkdir(parents=True, exist_ok=True)
        manifest = {
            "video": self.video,
            "duration": self.duration,
            "fps": self.fps,
            "embedder": self.embedder_name,
            "shots": [s.to_dict() for s in self.shots],
        }
        (directory / MANIFEST).write_text(json.dumps(manifest, indent=2))
        np.savez_compressed(
            directory / VECTORS,
            timestamps=self.timestamps,
            shot_ids=self.shot_ids,
            embeddings=self.embeddings,
        )
        return directory

    @classmethod
    def load(cls, directory: str | Path) -> "VideoIndex":
        directory = Path(directory)
        manifest = json.loads((directory / MANIFEST).read_text())
        arrays = np.load(directory / VECTORS)
        return cls(
            video=manifest["video"],
            duration=manifest["duration"],
            fps=manifest["fps"],
            embedder_name=manifest["embedder"],
            shots=[Shot(**s) for s in manifest["shots"]],
            timestamps=arrays["timestamps"],
            shot_ids=arrays["shot_ids"],
            embeddings=arrays["embeddings"],
        )


def build_index(
    video: str | Path,
    embedder: Embedder,
    fps: float = 2.0,
    batch_size: int = 64,
    frame_size: int = 224,
) -> VideoIndex:
    """Sample frames, embed them, and group them into detected shots."""
    video = str(video)
    duration = probe_duration(video)
    shots = detect_shots(video, duration)
    log.info("Indexing %s: %.1fs, %d shots", video, duration, len(shots))

    timestamps: list[float] = []
    vectors: list[np.ndarray] = []
    batch_images, batch_ts = [], []

    def flush() -> None:
        if not batch_images:
            return
        vectors.append(embedder.embed_images(batch_images))
        timestamps.extend(batch_ts)
        batch_images.clear()
        batch_ts.clear()

    for t, image in iter_frames(video, fps=fps, width=frame_size, height=frame_size):
        batch_images.append(image)
        batch_ts.append(t)
        if len(batch_images) >= batch_size:
            flush()
    flush()

    if not timestamps:
        raise ValueError(f"No frames decoded from {video}")

    ts = np.asarray(timestamps, dtype=np.float64)
    shot_ids = np.asarray([shot_index_for(shots, t) for t in ts], dtype=np.int64)
    return VideoIndex(
        video=video,
        duration=duration,
        fps=fps,
        embedder_name=embedder.name,
        shots=shots,
        timestamps=ts,
        shot_ids=shot_ids,
        embeddings=np.vstack(vectors).astype(np.float32),
    )
