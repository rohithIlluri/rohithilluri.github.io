from gifscout.scenes import detect_shots, fixed_windows, shot_index_for
from gifscout.types import Shot

from .conftest import needs_ffmpeg


def test_fixed_windows_cover_duration():
    shots = fixed_windows(10.0, window=4.0)
    assert shots[0].start == 0.0
    assert shots[-1].end == 10.0
    for a, b in zip(shots, shots[1:]):
        assert a.end == b.start


def test_fixed_windows_merges_tiny_tail():
    shots = fixed_windows(8.5, window=4.0)  # tail of 0.5s < 25% of window
    assert len(shots) == 2
    assert shots[-1].end == 8.5


def test_fixed_windows_empty():
    assert fixed_windows(0.0) == []


def test_shot_index_for():
    shots = [Shot(0, 2), Shot(2, 5), Shot(5, 9)]
    assert shot_index_for(shots, 1.0) == 0
    assert shot_index_for(shots, 2.0) == 1
    assert shot_index_for(shots, 8.9) == 2
    assert shot_index_for(shots, 99.0) == 2  # clamps past the end


@needs_ffmpeg
def test_detect_shots_finds_color_cuts(sample_video):
    shots = detect_shots(sample_video, duration=6.0)
    # Three distinct color segments -> at least 2 shots, covering the video.
    assert len(shots) >= 2
    assert shots[0].start == 0.0
    assert abs(shots[-1].end - 6.0) < 0.5
