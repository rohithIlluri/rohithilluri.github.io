"""Core data types shared across the pipeline."""

from __future__ import annotations

from dataclasses import dataclass, field, asdict


@dataclass(frozen=True)
class Shot:
    """A contiguous camera shot inside a video, in seconds."""

    start: float
    end: float

    @property
    def duration(self) -> float:
        return self.end - self.start

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class Match:
    """A ranked candidate moment for a query."""

    score: float
    start: float
    end: float
    shot_index: int
    best_frame_t: float
    video: str

    def to_dict(self) -> dict:
        return {
            "score": round(self.score, 4),
            "start": round(self.start, 3),
            "end": round(self.end, 3),
            "shot_index": self.shot_index,
            "best_frame_t": round(self.best_frame_t, 3),
            "video": self.video,
        }


@dataclass
class GifCandidate:
    """An existing GIF found via a provider (Tenor/GIPHY) in instant mode."""

    url: str
    preview_url: str
    title: str
    source: str
    extra: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "url": self.url,
            "preview_url": self.preview_url,
            "title": self.title,
            "source": self.source,
        }
