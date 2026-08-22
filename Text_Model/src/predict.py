import re
import sys
from pathlib import Path

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = ROOT / "artifacts/models/muril"
MAX_LEN = 128
DEVICE = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")

DIGITAL_INFRA = re.compile(r"\b(internet|net|5g|4g|3g|2g|wireless|broadband|wifi)\b", re.IGNORECASE)

tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR).to(DEVICE)
model.eval()


def predict(text):
    if DIGITAL_INFRA.search(text):
        return "digital infrastructure", 1.0
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=MAX_LEN).to(DEVICE)
    with torch.no_grad():
        logits = model(**inputs).logits
    probs = torch.softmax(logits, dim=-1)[0]
    idx = probs.argmax().item()
    label = model.config.id2label[idx]
    if label == "energy":
        label = "electric / solar energy"
    return label, probs[idx].item()


if __name__ == "__main__":
    text = " ".join(sys.argv[1:]).strip()
    if not text:
        text = input("Enter a sentence: ")
    label, confidence = predict(text)
    print(f"Category: {label}")