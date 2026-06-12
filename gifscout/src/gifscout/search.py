"""Rank shots against a query embedding and pick tight GIF windows."""

from __future__ import annotations

import numpy as np

from .index import VideoIndex
from .types import Match


def search(
    index: VideoIndex,
    query_embeddings: np.ndarray,
    top_k: int = 5,
    target_len: float = 2.8,
    min_len: float = 1.0,
    max_len: float = 6.0,
) -> list[Match]:
    """Return the top-k moments for one or more query embeddings.

    Multiple query embeddings (e.g. Claude's paraphrases of the request) are
    max-pooled per frame, so a frame only needs to match one phrasing well.
    Shots are scored by their best frame plus a small bonus for consistent
    matches, then a window around the best frame is clamped to the shot.
    """
    q = np.atleast_2d(query_embeddings).astype(np.float32)
    sims = index.embeddings @ q.T  # (n_frames, n_queries)
    frame_scores = sims.max(axis=1)

    matches: list[Match] = []
    for shot_idx, shot in enumerate(index.shots):
        mask = index.shot_ids == shot_idx
        if not mask.any():
            continue
        shot_scores = frame_scores[mask]
        shot_ts = index.timestamps[mask]
        best_local = int(shot_scores.argmax())
        score = float(shot_scores[best_local]) + 0.15 * float(shot_scores.mean())
        best_t = float(shot_ts[best_local])

        half = target_len / 2
        start = max(shot.start, best_t - half)
        end = min(shot.end, best_t + half)
        # If clamping shrank the window, grow the other side inside the shot.
        deficit = target_len - (end - start)
        if deficit > 0:
            start = max(shot.start, start - deficit)
            end = min(shot.end, end + (target_len - (end - start)))
        if end - start < min_len:
            end = min(shot.end, start + min_len)
        end = min(end, start + max_len)
        if end - start < 0.2:
            continue

        matches.append(
            Match(
                score=score,
                start=start,
                end=end,
                shot_index=shot_idx,
                best_frame_t=best_t,
                video=index.video,
            )
        )

    matches.sort(key=lambda m: m.score, reverse=True)
    return matches[:top_k]
