from gifscout.llm import ClaudeAssistant, QueryPlan, _parse_json, _sniff_media_type
from gifscout.types import GifCandidate


def test_parse_json_plain():
    assert _parse_json('{"a": 1}') == {"a": 1}


def test_parse_json_with_prose():
    text = 'Here you go:\n```json\n{"visual_queries": ["a dog"]}\n```'
    assert _parse_json(text) == {"visual_queries": ["a dog"]}


def test_sniff_media_type():
    assert _sniff_media_type(b"GIF89a...") == "image/gif"
    assert _sniff_media_type(b"\x89PNG\r\n\x1a\n....") == "image/png"
    assert _sniff_media_type(b"RIFF1234WEBPxxxx") == "image/webp"
    assert _sniff_media_type(b"\xff\xd8\xff\xe0") == "image/jpeg"


def test_assistant_unavailable_without_key(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    assistant = ClaudeAssistant()
    assert assistant.available is False
    plan = assistant.expand_query("the famous toast scene")
    assert plan == QueryPlan(visual_queries=["the famous toast scene"])


def test_rerank_passthrough_without_key(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    assistant = ClaudeAssistant()
    candidates = [
        GifCandidate(url="u1", preview_url="p1", title="a", source="tenor"),
        GifCandidate(url="u2", preview_url="p2", title="b", source="giphy"),
    ]
    assert assistant.rerank_candidates("q", candidates, [b"", b""]) == [0, 1]


class _FakeBlock:
    type = "text"

    def __init__(self, text):
        self.text = text


class _FakeResponse:
    stop_reason = "end_turn"

    def __init__(self, text):
        self.content = [_FakeBlock(text)]


class _FakeMessages:
    def __init__(self, text):
        self._text = text

    def create(self, **kwargs):
        return _FakeResponse(self._text)


class _FakeClient:
    def __init__(self, text):
        self.messages = _FakeMessages(text)


def test_expand_query_parses_response(monkeypatch):
    assistant = ClaudeAssistant(api_key="test-key")
    assistant._client = _FakeClient(
        '{"visual_queries": ["man raising a champagne glass", "leonardo dicaprio toast"],'
        ' "caption": "Cheers!", "source_guess": "The Great Gatsby"}'
    )
    monkeypatch.setattr(ClaudeAssistant, "available", property(lambda self: True))
    plan = assistant.expand_query("gatsby toast")
    assert "man raising a champagne glass" in plan.visual_queries
    assert "gatsby toast" in plan.visual_queries  # original query always kept
    assert plan.caption == "Cheers!"
    assert plan.source_guess == "The Great Gatsby"
