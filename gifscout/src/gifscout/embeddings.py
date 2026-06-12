"""Embedding backends.

`OpenClipEmbedder` is the real deal: joint image/text embeddings so a natural
language query lands near the frames that show it. It needs `torch` +
`open-clip-torch` (install with `pip install gifscout[ml]`).

`HashEmbedder` is a deterministic, dependency-free stand-in used for tests and
for environments without the ML stack. It is NOT semantic — text queries won't
meaningfully match image content — but it keeps the whole pipeline runnable.
"""

from __future__ import annotations

import hashlib
import logging
from typing import Protocol

import numpy as np
from PIL import Image

log = logging.getLogger(__name__)


def l2_normalize(x: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(x, axis=-1, keepdims=True)
    return x / np.maximum(norms, 1e-12)


class Embedder(Protocol):
    name: str
    dim: int

    def embed_images(self, images: list[Image.Image]) -> np.ndarray: ...
    def embed_texts(self, texts: list[str]) -> np.ndarray: ...


class OpenClipEmbedder:
    """CLIP image/text embeddings via open_clip (lazy-loaded)."""

    def __init__(
        self,
        model_name: str = "ViT-B-32",
        pretrained: str = "laion2b_s34b_b79k",
        device: str | None = None,
    ):
        import open_clip  # noqa: PLC0415 — heavy import, keep lazy
        import torch  # noqa: PLC0415

        self._torch = torch
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            model_name, pretrained=pretrained
        )
        self.model.eval().to(self.device)
        self.tokenizer = open_clip.get_tokenizer(model_name)
        self.name = f"openclip/{model_name}/{pretrained}"
        with torch.no_grad():
            probe = self.model.encode_text(self.tokenizer(["probe"]).to(self.device))
        self.dim = int(probe.shape[-1])

    def embed_images(self, images: list[Image.Image]) -> np.ndarray:
        torch = self._torch
        batch = torch.stack([self.preprocess(im.convert("RGB")) for im in images])
        with torch.no_grad():
            feats = self.model.encode_image(batch.to(self.device))
        return l2_normalize(feats.cpu().numpy().astype(np.float32))

    def embed_texts(self, texts: list[str]) -> np.ndarray:
        torch = self._torch
        tokens = self.tokenizer(texts).to(self.device)
        with torch.no_grad():
            feats = self.model.encode_text(tokens)
        return l2_normalize(feats.cpu().numpy().astype(np.float32))


class HashEmbedder:
    """Deterministic non-semantic embedder for tests / ML-free installs."""

    def __init__(self, dim: int = 256):
        self.dim = dim
        self.name = f"hash/{dim}"

    def embed_images(self, images: list[Image.Image]) -> np.ndarray:
        side = int(np.sqrt(self.dim))
        out = np.empty((len(images), self.dim), dtype=np.float32)
        for i, im in enumerate(images):
            gray = im.convert("L").resize((side, side))
            vec = np.asarray(gray, dtype=np.float32).reshape(-1)
            # Offset by mid-gray rather than the per-image mean so flat,
            # solid-color frames still produce distinct non-zero vectors.
            vec = vec - 128.0
            if vec.size < self.dim:
                vec = np.pad(vec, (0, self.dim - vec.size))
            out[i] = vec[: self.dim]
        return l2_normalize(out)

    def embed_texts(self, texts: list[str]) -> np.ndarray:
        out = np.zeros((len(texts), self.dim), dtype=np.float32)
        for i, text in enumerate(texts):
            t = text.lower()
            for j in range(max(len(t) - 2, 1)):
                gram = t[j : j + 3].encode()
                h = int.from_bytes(hashlib.blake2b(gram, digest_size=4).digest(), "big")
                out[i, h % self.dim] += 1.0
        return l2_normalize(out)


def get_embedder(name: str = "auto", **kwargs) -> Embedder:
    """Resolve an embedder by name: 'openclip', 'hash', or 'auto'."""
    if name == "hash":
        return HashEmbedder(**kwargs)
    if name == "openclip":
        return OpenClipEmbedder(**kwargs)
    if name == "auto":
        try:
            return OpenClipEmbedder(**kwargs)
        except ImportError:
            log.warning(
                "open-clip-torch not installed; falling back to the non-semantic "
                "hash embedder. Install gifscout[ml] for real semantic search."
            )
            return HashEmbedder()
    raise ValueError(f"Unknown embedder: {name!r}")
