import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
os.environ.setdefault("HF_HOME", str(ROOT / ".hf_cache"))

import numpy as np
import torch
from transformers import AutoModel, AutoTokenizer

MODEL_NAME = "intfloat/multilingual-e5-small"
INDEX_DIR = ROOT / "artifacts" / "models" / "e5_similar"
INDEX_FILE = INDEX_DIR / "complaint_embeddings.npz"
MAX_LEN = 128
DEVICE = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")


def mean_pool(last_hidden, attention_mask):
    mask = attention_mask.unsqueeze(-1).expand(last_hidden.size()).float()
    return (last_hidden * mask).sum(1) / mask.clamp(min=1e-9).sum(1)


class SimilarityEngine:
    def __init__(self):
        if not INDEX_FILE.exists():
            raise FileNotFoundError(f"Index not found at {INDEX_FILE}. Run build_embedding.py first.")
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        self.model = AutoModel.from_pretrained(MODEL_NAME).to(DEVICE).eval()
        data = np.load(INDEX_FILE)
        self.embeddings = data["embeddings"]
        self.ids = data["ids"]
        self.texts = data["texts"]
        self.categories = data["categories"]

    def embed(self, text, prefix="passage: "):
        inputs = self.tokenizer(prefix + text.strip(), return_tensors="pt", truncation=True, max_length=MAX_LEN).to(DEVICE)
        with torch.no_grad():
            emb = mean_pool(self.model(**inputs).last_hidden_state, inputs["attention_mask"])
        return torch.nn.functional.normalize(emb, p=2, dim=1).cpu().numpy()[0]

    def find_best(self, text, category=None):
        query = self.embed(text, prefix="query: ")
        idx = np.arange(len(self.texts))
        if category is not None:
            idx = idx[self.categories[idx] == category]
        if len(idx) == 0:
            return None
        scores = self.embeddings[idx] @ query
        best = idx[int(np.argmax(scores))]
        return {
            "id": int(self.ids[best]),
            "text": str(self.texts[best]),
            "category": str(self.categories[best]),
            "score": float(scores.max()),
        }

    def save(self):
        INDEX_DIR.mkdir(parents=True, exist_ok=True)
        np.savez(INDEX_FILE, embeddings=self.embeddings, ids=self.ids, texts=self.texts, categories=self.categories)

    def add_complaint(self, text, category, complaint_id=None):
        if complaint_id is None:
            complaint_id = int(self.ids.max()) + 1 if len(self.ids) else 0
        emb = self.embed(text).reshape(1, -1)
        self.embeddings = np.vstack([self.embeddings, emb])
        self.ids = np.append(self.ids, complaint_id)
        self.texts = np.append(self.texts, text)
        self.categories = np.append(self.categories, category)
        self.save()
        return complaint_id
