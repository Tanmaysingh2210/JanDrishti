import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
os.environ.setdefault("HF_HOME", str(ROOT / ".hf_cache"))

import numpy as np
import pandas as pd
import torch
from transformers import AutoModel, AutoTokenizer
from tqdm.auto import tqdm

MODEL_NAME = "intfloat/multilingual-e5-small"
DATA = ROOT / "Text_Model" / "Data" / "processed" / "text_dataset.csv"
OUT_DIR = ROOT / "artifacts" / "models" / "e5_similar"
OUT_FILE = OUT_DIR / "complaint_embeddings.npz"
MAX_LEN, BATCH = 128, 64
DEVICE = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")


def mean_pool(last_hidden, attention_mask):
    mask = attention_mask.unsqueeze(-1).expand(last_hidden.size()).float()
    return (last_hidden * mask).sum(1) / mask.clamp(min=1e-9).sum(1)


@torch.no_grad()
def encode(texts):
    chunks = []
    for i in tqdm(range(0, len(texts), BATCH), desc="Embedding"):
        batch = ["passage: " + t.strip() for t in texts[i : i + BATCH]]
        inputs = tokenizer(batch, padding=True, truncation=True, max_length=MAX_LEN, return_tensors="pt").to(DEVICE)
        emb = mean_pool(model(**inputs).last_hidden_state, inputs["attention_mask"])
        chunks.append(torch.nn.functional.normalize(emb, p=2, dim=1).cpu().numpy())
    return np.vstack(chunks).astype(np.float32)


if __name__ == "__main__":
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModel.from_pretrained(MODEL_NAME).to(DEVICE).eval()

    df = pd.read_csv(DATA)
    texts = df["input"].astype(str).tolist()
    categories = df["output"].astype(str).tolist()

    embeddings = encode(texts)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    np.savez(
        OUT_FILE,
        embeddings=embeddings,
        ids=np.arange(len(texts)),
        texts=np.array(texts),
        categories=np.array(categories),
    )
    print(f"Saved {len(texts)} embeddings of dim {embeddings.shape[1]} to {OUT_FILE}")
