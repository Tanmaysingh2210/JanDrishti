import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
os.environ.setdefault("HF_HOME", str(ROOT / ".hf_cache"))

import numpy as np

MODEL_NAME = "intfloat/multilingual-e5-small"
INDEX_DIR = ROOT / "artifacts" / "models" / "e5_similar"
INDEX_FILE = INDEX_DIR / "complaint_embeddings.npz"
MAX_LEN = 128


def mean_pool(last_hidden, attention_mask):
    mask = attention_mask.unsqueeze(-1).expand(last_hidden.size()).float()
    return (last_hidden * mask).sum(1) / mask.clamp(min=1e-9).sum(1)


class SimilarityEngine:
    def __init__(self):
        self.tokenizer = None
        self.model = None
        self.embeddings = np.array([])
        self.ids = []
        self.texts = []
        self.categories = []

        if INDEX_FILE.exists():
            try:
                import torch
                from transformers import AutoModel, AutoTokenizer
                device = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")
                self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
                self.model = AutoModel.from_pretrained(MODEL_NAME).to(device).eval()
                data = np.load(INDEX_FILE, allow_pickle=True)
                self.embeddings = data["embeddings"]
                self.ids = data["ids"]
                self.texts = data["texts"]
                self.categories = data["categories"]
            except Exception as e:
                print(f"Similarity engine load warning: {e}")

    def embed(self, text, prefix="passage: "):
        if self.tokenizer is None or self.model is None:
            return None
        import torch
        device = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")
        inputs = self.tokenizer(prefix + text.strip(), return_tensors="pt", truncation=True, max_length=MAX_LEN).to(device)
        with torch.no_grad():
            emb = mean_pool(self.model(**inputs).last_hidden_state, inputs["attention_mask"])
        return torch.nn.functional.normalize(emb, p=2, dim=1).cpu().numpy()[0]

    def find_best(self, text, category=None):
        if len(self.embeddings) == 0:
            return None
        vec = self.embed(text, prefix="query: ")
        if vec is None:
            return None

        mask = np.ones(len(self.texts), dtype=bool)
        if category:
            mask = np.array([c.strip().lower() == category.strip().lower() for c in self.categories])

        if not mask.any():
            mask = np.ones(len(self.texts), dtype=bool)

        indices = np.where(mask)[0]
        scores = self.embeddings[indices] @ vec
        best_i = int(indices[np.argmax(scores)])
        return {
            "id": self.ids[best_i],
            "text": self.texts[best_i],
            "category": self.categories[best_i],
            "score": float(scores[np.argmax(scores)]),
        }

    def add_complaint(self, text, category, complaint_id=None):
        pass
