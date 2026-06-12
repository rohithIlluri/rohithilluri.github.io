import shutil
import subprocess
from pathlib import Path

import pytest

HAS_FFMPEG = shutil.which("ffmpeg") is not None and shutil.which("ffprobe") is not None

needs_ffmpeg = pytest.mark.skipif(not HAS_FFMPEG, reason="ffmpeg not installed")


@pytest.fixture(scope="session")
def sample_video(tmp_path_factory) -> Path:
    """A 6-second test video with three visually distinct 2s segments."""
    if not HAS_FFMPEG:
        pytest.skip("ffmpeg not installed")
    path = tmp_path_factory.mktemp("video") / "sample.mp4"
    filtergraph = (
        "color=c=red:s=320x240:d=2:r=12[v0];"
        "color=c=green:s=320x240:d=2:r=12[v1];"
        "smptebars=s=320x240:d=2:r=12[v2];"
        "[v0][v1][v2]concat=n=3:v=1[out]"
    )
    subprocess.run(
        [
            "ffmpeg", "-v", "error", "-y",
            "-filter_complex", filtergraph,
            "-map", "[out]",
            "-pix_fmt", "yuv420p",
            str(path),
        ],
        check=True,
    )
    return path
