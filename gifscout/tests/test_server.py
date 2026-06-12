import pytest

from .conftest import needs_ffmpeg

fastapi = pytest.importorskip("fastapi")
from fastapi.testclient import TestClient  # noqa: E402

from gifscout.pipeline import GifScout  # noqa: E402
from gifscout.server import create_app  # noqa: E402


@pytest.fixture()
def client(tmp_path):
    scout = GifScout(workdir=tmp_path, embedder="hash", use_llm=False)
    return TestClient(create_app(scout))


def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["embedder"].startswith("hash/")


def test_home_serves_ui(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert "GifScout" in resp.text


@needs_ffmpeg
def test_index_search_and_gif_flow(client, sample_video):
    resp = client.post("/api/index", json={"source": str(sample_video)})
    assert resp.status_code == 200
    body = resp.json()
    assert body["frames"] > 0 and body["shots"] >= 1

    resp = client.post(
        "/api/search",
        json={"source": str(sample_video), "query": "red screen", "top_k": 3},
    )
    assert resp.status_code == 200
    matches = resp.json()["matches"]
    assert matches, "expected at least one match"
    assert matches[0]["thumbnail"].startswith("data:image/jpeg;base64,")

    best = matches[0]
    resp = client.post(
        "/api/gif",
        json={"source": str(sample_video), "start": best["start"], "end": best["end"]},
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "image/gif"
    assert resp.content[:3] == b"GIF"


def test_search_missing_video_404(client):
    resp = client.post("/api/search", json={"source": "/nope.mp4", "query": "x"})
    assert resp.status_code == 404


def test_gif_invalid_range_422(client, sample_video):
    resp = client.post(
        "/api/gif", json={"source": str(sample_video), "start": 2.0, "end": 1.0}
    )
    assert resp.status_code == 422
