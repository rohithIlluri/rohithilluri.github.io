import numpy as np

from gifscout.index import VideoIndex
from gifscout.search import search
from gifscout.types import Shot


def make_index() -> VideoIndex:
    """Three shots; the middle shot's frames point along the query direction."""
    shots = [Shot(0, 4), Shot(4, 8), Shot(8, 12)]
    timestamps = np.arange(0.5, 12, 1.0)  # 12 frames, ~4 per shot
    shot_ids = np.array([0] * 4 + [1] * 4 + [2] * 4)
    rng = np.random.default_rng(7)
    emb = rng.normal(size=(12, 8)).astype(np.float32)
    emb[4:8] = 0
    emb[4:8, 0] = 1.0  # shot 1 frames near the query axis...
    emb[4:8, 1] = 0.6
    emb[6, 1] = 0.0  # ...with the best (exact) match at t=6.5
    emb /= np.linalg.norm(emb, axis=1, keepdims=True)
    return VideoIndex(
        video="fake.mp4", duration=12.0, fps=1.0, embedder_name="test",
        shots=shots, timestamps=timestamps, shot_ids=shot_ids, embeddings=emb,
    )


QUERY = np.array([[1, 0, 0, 0, 0, 0, 0, 0]], dtype=np.float32)


def test_search_ranks_matching_shot_first():
    matches = search(make_index(), QUERY, top_k=3)
    assert matches[0].shot_index == 1
    assert matches[0].best_frame_t == 6.5
    assert matches[0].score > matches[-1].score


def test_search_window_stays_inside_shot():
    matches = search(make_index(), QUERY, top_k=1, target_len=3.0)
    m = matches[0]
    assert m.start >= 4.0 - 1e-6
    assert m.end <= 8.0 + 1e-6
    assert 2.9 <= m.end - m.start <= 3.1


def test_search_respects_max_len():
    matches = search(make_index(), QUERY, top_k=1, target_len=50, max_len=4.0)
    m = matches[0]
    assert m.end - m.start <= 4.0 + 1e-6


def test_search_multiple_query_embeddings_max_pooled():
    other_axis = np.array([[0, 1, 0, 0, 0, 0, 0, 0]], dtype=np.float32)
    both = np.vstack([other_axis, QUERY])
    matches = search(make_index(), both, top_k=1)
    assert matches[0].shot_index == 1  # best phrasing wins


def test_search_top_k_limits_results():
    assert len(search(make_index(), QUERY, top_k=2)) == 2
