from gifscout.render import build_filtergraph, escape_drawtext, render_gif

from .conftest import needs_ffmpeg


def test_escape_drawtext():
    assert escape_drawtext("it's 100%") == "it\\'s 100\\%"
    assert escape_drawtext("a,b:c") == "a\\,b\\:c"
    assert escape_drawtext("plain words") == "plain words"


def test_build_filtergraph_variants():
    plain = build_filtergraph(fps=10, width=320)
    assert "fps=10" in plain and "scale=320" in plain
    assert "palettegen" in plain and "paletteuse" in plain
    assert "reverse" not in plain

    boom = build_filtergraph(boomerang=True)
    assert "reverse" in boom and "concat" in boom

    cap = build_filtergraph(caption="hi there")
    assert "drawtext" in cap and "hi there" in cap


@needs_ffmpeg
def test_render_gif(sample_video, tmp_path):
    out = render_gif(sample_video, start=0.5, end=2.0, out_path=tmp_path / "x.gif",
                     fps=8, width=160)
    data = out.read_bytes()
    assert data[:6] in (b"GIF87a", b"GIF89a")
    assert len(data) > 1000


@needs_ffmpeg
def test_render_gif_boomerang_and_caption(sample_video, tmp_path):
    out = render_gif(
        sample_video, start=0.0, end=1.0, out_path=tmp_path / "b.gif",
        fps=6, width=120, caption="100% test", boomerang=True,
    )
    assert out.read_bytes()[:3] == b"GIF"
