import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
os.environ.setdefault("HF_HOME", str(ROOT / ".hf_cache"))

from predict import predict
from similarity import SimilarityEngine

DUPLICATE_THRESHOLD = 0.85
CATEGORY_FIX = {"electric / solar energy": "energy"}

engine = SimilarityEngine()


def process(text):
    category, confidence = predict(text)
    match = engine.find_best(text, CATEGORY_FIX.get(category, category))
    result = {
        "complaint": text,
        "category": category,
    }
    if match is not None and match["score"] >= DUPLICATE_THRESHOLD:
        result["similar_complaint"] = match["text"]
        result["similarity_score"] = round(match["score"], 4)
        result["original_complaint_index"] = int(match["id"])
    return result


if __name__ == "__main__":
    text = " ".join(sys.argv[1:]).strip()
    if not text:
        text = input("Enter a complaint: ")
    print(json.dumps(process(text), indent=2, ensure_ascii=False))
