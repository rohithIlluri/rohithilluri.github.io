import numpy as np
from PIL import Image

from gifscout.embeddings import HashEmbedder, get_embedder


def test_hash_embedder_shapes_and_normalization():
    emb = HashEmbedder(dim=256)
    images = [Image.new("RGB", (64, 64), c) for c in ["red", "green", "blue"]]
    vecs = emb.embed_images(images)
    assert vecs.shape == (3, 256)
    np.testing.assert_allclose(np.linalg.norm(vecs, axis=1), 1.0, atol=1e-5)

    texts = emb.embed_texts(["a red frame", "completely different words"])
    assert texts.shape == (2, 256)
    np.testing.assert_allclose(np.linalg.norm(texts, axis=1), 1.0, atol=1e-5)


def test_hash_embedder_deterministic():
    a = HashEmbedder().embed_texts(["same query"])
    b = HashEmbedder().embed_texts(["same query"])
    np.testing.assert_array_equal(a, b)


def test_distinct_images_get_distinct_embeddings():
    emb = HashEmbedder()
    img_a = Image.new("L", (32, 32), 10).convert("RGB")
    img_b = Image.effect_noise((32, 32), 64).convert("RGB")
    vecs = emb.embed_images([img_a, img_b])
    assert float(vecs[0] @ vecs[1]) < 0.99


def test_get_embedder_resolution():
    assert get_embedder("hash").name.startswith("hash/")
    # auto must never raise, even without torch installed
    assert get_embedder("auto").dim > 0
