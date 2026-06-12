"""GifScout — AI that finds and extracts any GIF-able moment from movies and clips."""

from .pipeline import GifScout
from .types import GifCandidate, Match, Shot

__version__ = "0.1.0"
__all__ = ["GifScout", "Match", "Shot", "GifCandidate", "__version__"]
