import numpy as np

from gifscout.embeddings import HashEmbedder
from gifscout.index import VideoIndex, build_index

from .conftest import needs_ffmpeg


@needs_ffmpeg
def test_build_index(sample_video):
    index = build_index(sample_video, HashEmbedder(), fps=2.0)
    assert index.n_frames >= 10  # ~12 frames at 2fps over 6s
    assert index.embeddings.shape == (index.n_frames, 256)
    assert len(index.shots) >= 1
    assert index.shot_ids.max() < len(index.shots)
    assert np.all(np.diff(index.timestamps) > 0)
    np.testing.assert_allclose(
        np.linalg.norm(index.embeddings, axis=1), 1.0, atol=1e-4
    )


@needs_ffmpeg
def test_index_save_load_roundtrip(sample_video, tmp_path):
    index = build_index(sample_video, HashEmbedder(), fps=2.0)
    index.save(tmp_path / "idx")
    loaded = VideoIndex.load(tmp_path / "idx")
    assert loaded.video == index.video
    assert loaded.embedder_name == index.embedder_name
    assert loaded.shots == index.shots
    np.testing.assert_array_equal(loaded.timestamps, index.timestamps)
    np.testing.assert_array_equal(loaded.embeddings, index.embeddings)
