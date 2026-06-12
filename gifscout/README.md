# GifScout 🎬✂️

**Get any GIF from movies or clips with AI.** Describe a moment in plain
English — *"she throws her hands up and laughs"*, *"the car flips over the
bridge at night"* — and GifScout finds it inside your video and cuts a
high-quality GIF, automatically.

```
gifscout snip movie.mp4 "the hero raises a glass and smirks"
# → GIF: ~/.cache/gifscout/gifs/the-hero-raises-a-glass-and-smirks.gif
# → Moment: 4032.10s–4034.90s (score 0.312)
```

## How it works

```
 video / URL ──▶ shot detection ──▶ frame sampling ──▶ CLIP embeddings ──▶ index
                                                                            │
 "the toast scene" ──▶ Claude query expansion ──▶ text embeddings ──▶ ranked moments
                                                                            │
                                              ffmpeg palette-optimized GIF ◀┘
```

1. **Ingest** — local files, or any URL via `yt-dlp`.
2. **Shot detection** — PySceneDetect if installed, else ffmpeg's scene-score
   filter, else fixed windows. GIF cuts never cross a hard cut.
3. **Semantic indexing** — frames are sampled (~2 fps) and embedded with
   OpenCLIP; the index is cached on disk so a video is only processed once.
4. **Query understanding (optional)** — Claude (`claude-opus-4-8`) rewrites a
   fuzzy request ("the *you shall not pass* moment") into several literal
   visual descriptions, which are max-pooled at search time. It can also
   suggest a caption to burn in.
5. **Localization** — shots are ranked by best-frame similarity; the GIF
   window is centered on the best frame and clamped to the shot.
6. **Rendering** — ffmpeg with `palettegen`/`paletteuse` (lanczos scaling,
   Bayer dithering) for crisp GIFs; optional captions and boomerang loops.
7. **Instant mode** — when you want a famous GIF that already exists,
   `gifscout web` searches Tenor + GIPHY, optionally reranked by Claude vision.

## Install

```bash
pip install -e ".[all]"        # everything: CLIP, server, yt-dlp, Claude
pip install -e .               # minimal core (hash embedder, no semantics)
pip install -e ".[ml,server]"  # the recommended pairing
```

You also need **ffmpeg** on your PATH (`apt install ffmpeg` / `brew install ffmpeg`).

Optional environment variables:

| Variable            | Enables                                  |
|---------------------|------------------------------------------|
| `ANTHROPIC_API_KEY` | Claude query expansion, captions, rerank |
| `TENOR_API_KEY`     | Instant mode via Tenor                   |
| `GIPHY_API_KEY`     | Instant mode via GIPHY                   |

## Usage

### CLI

```bash
# Pre-index (optional — snip/find index on demand and cache)
gifscout index movie.mp4
gifscout index "https://www.youtube.com/watch?v=..."

# Rank the best moments for a description
gifscout find movie.mp4 "car chase at night" --top-k 5

# Cut the best moment as a GIF
gifscout snip movie.mp4 "slow clap in the courtroom" -o clap.gif \
    --width 480 --gif-fps 14 --auto-caption --boomerang

# Instant mode: find an existing GIF on the web
gifscout web "excited minion" --rerank
```

### Web UI

```bash
pip install -e ".[server]"
gifscout serve --port 8000   # then open http://127.0.0.1:8000
```

Type a video path and a description; pick from thumbnail candidates; download
the rendered GIF.

### Python

```python
from gifscout import GifScout

scout = GifScout()
path, match, plan = scout.snip("movie.mp4", "the dramatic door slam")
print(path, match.start, match.end)
```

## Development

```bash
pip install -e ".[dev]"
pytest
```

The test suite runs without the ML stack (a deterministic hash embedder stands
in for CLIP) and skips ffmpeg-dependent tests when ffmpeg is absent.

## Project layout

```
src/gifscout/
  media.py       ffprobe/ffmpeg probing + raw-frame sampling
  scenes.py      shot detection (PySceneDetect → ffmpeg → fixed windows)
  embeddings.py  OpenCLIP embedder + hash fallback
  index.py       per-video index build/save/load
  search.py      shot ranking + GIF window selection
  render.py      palette-optimized GIF / MP4 rendering
  llm.py         Claude query expansion, captions, vision rerank
  providers.py   Tenor / GIPHY instant search
  pipeline.py    GifScout orchestrator with on-disk caching
  cli.py         command-line interface
  server.py      FastAPI app
  web/           single-page UI
```

## Roadmap

- [ ] SigLIP / larger CLIP presets and GPU batching
- [ ] Subtitle/transcript fusion (match dialogue, not just visuals)
- [ ] Sticker-style transparent WebP/APNG export
- [ ] Frame-accurate window refinement with a second high-fps pass

## License

MIT
