"""Command-line interface.

Examples:
  gifscout snip movie.mp4 "the hero raises a glass and smirks"
  gifscout find movie.mp4 "car chase at night" --top-k 5
  gifscout index https://example.com/clip
  gifscout web "excited minion" --limit 5
  gifscout serve --port 8000
"""

from __future__ import annotations

import argparse
import json
import logging
import sys

from .pipeline import DEFAULT_WORKDIR, GifScout


def _add_common(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--workdir", default=str(DEFAULT_WORKDIR))
    parser.add_argument(
        "--embedder", default="auto", choices=["auto", "openclip", "hash"],
        help="auto tries CLIP and falls back to a non-semantic hash embedder",
    )
    parser.add_argument("--fps", type=float, default=2.0, help="frame sampling rate")
    parser.add_argument("--no-llm", action="store_true", help="skip Claude query expansion")


def _scout(args: argparse.Namespace) -> GifScout:
    return GifScout(
        workdir=args.workdir,
        embedder=args.embedder,
        fps=args.fps,
        use_llm=not args.no_llm,
    )


def main(argv: list[str] | None = None) -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    parser = argparse.ArgumentParser(prog="gifscout", description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    p_index = sub.add_parser("index", help="pre-index a video or URL")
    p_index.add_argument("source")
    p_index.add_argument("--force", action="store_true")
    _add_common(p_index)

    p_find = sub.add_parser("find", help="rank the best moments for a query")
    p_find.add_argument("source")
    p_find.add_argument("query")
    p_find.add_argument("--top-k", type=int, default=5)
    _add_common(p_find)

    p_snip = sub.add_parser("snip", help="cut the best moment as a GIF")
    p_snip.add_argument("source")
    p_snip.add_argument("query")
    p_snip.add_argument("-o", "--out")
    p_snip.add_argument("--gif-fps", type=int, default=14)
    p_snip.add_argument("--width", type=int, default=480)
    p_snip.add_argument("--caption")
    p_snip.add_argument("--auto-caption", action="store_true",
                        help="let Claude suggest a burned-in caption")
    p_snip.add_argument("--boomerang", action="store_true")
    p_snip.add_argument("--pick", type=int, default=0, help="use the Nth-best match")
    _add_common(p_snip)

    p_web = sub.add_parser("web", help="instant mode: search Tenor/GIPHY")
    p_web.add_argument("query")
    p_web.add_argument("--limit", type=int, default=8)
    p_web.add_argument("--rerank", action="store_true", help="rerank with Claude vision")

    p_serve = sub.add_parser("serve", help="run the web UI / API server")
    p_serve.add_argument("--host", default="127.0.0.1")
    p_serve.add_argument("--port", type=int, default=8000)
    _add_common(p_serve)

    args = parser.parse_args(argv)

    if args.command == "index":
        index = _scout(args).index_video(args.source, force=args.force)
        print(f"Indexed {index.video}: {index.n_frames} frames, {len(index.shots)} shots")
        return 0

    if args.command == "find":
        matches, plan = _scout(args).find(args.source, args.query, top_k=args.top_k)
        if plan.visual_queries != [args.query]:
            print(f"Searched as: {plan.visual_queries}", file=sys.stderr)
        print(json.dumps([m.to_dict() for m in matches], indent=2))
        return 0

    if args.command == "snip":
        path, match, plan = _scout(args).snip(
            args.source, args.query,
            out_path=args.out, fps=args.gif_fps, width=args.width,
            caption=args.caption, auto_caption=args.auto_caption,
            boomerang=args.boomerang, pick=args.pick,
        )
        print(f"GIF: {path}")
        print(f"Moment: {match.start:.2f}s–{match.end:.2f}s (score {match.score:.3f})")
        return 0

    if args.command == "web":
        from .llm import ClaudeAssistant
        from .providers import fetch_bytes, search_web_gifs

        candidates = search_web_gifs(args.query, limit=args.limit)
        if args.rerank and candidates:
            assistant = ClaudeAssistant()
            previews = [fetch_bytes(c.preview_url) for c in candidates]
            order = assistant.rerank_candidates(args.query, candidates, previews)
            candidates = [candidates[i] for i in order]
        print(json.dumps([c.to_dict() for c in candidates], indent=2))
        return 0

    if args.command == "serve":
        import uvicorn

        from .server import create_app

        app = create_app(_scout(args))
        uvicorn.run(app, host=args.host, port=args.port)
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
