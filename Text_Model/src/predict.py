import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = ROOT / "artifacts/models/muril"
MAX_LEN = 128

DIGITAL_INFRA = re.compile(r"(internet|net|5g|4g|3g|2g|wireless|broadband|wifi)", re.IGNORECASE)

# Comprehensive category matcher mapping directly to the 10 trained model labels
CATEGORY_PATTERNS = {
    "agriculture": [
        r"(agriculture|farm|farmer|farmers|crop|crops|harvest|irrigation|seed|seeds|pesticide|pesticides|fertilizer|fertilizers|kisan|soil|cultivation|field|fields|procurement)",
    ],
    "healthcare": [
        r"(hospital|doctor|clinic|medical|patient|medicine|pharma|surgery|disease|sick|illness|eye|vision|health|harm|radiative|injury|nurse|ambulance|treatment|bed|health care)",
    ],
    "energy": [
        r"(energy|electricity|electric|power|solar|light|streetlight|transformer|voltage|wire|blackout|outage|current|pole|meter|bill|grid|watt|kw|kwh|bulb|lamp|generator)",
    ],
    "urban development": [
        r"(pothole|road|street|highway|traffic|signal|jam|car|vehicle|bus|lane|bridge|asphalt|accident|speed|path|footpath|divider|flyover|overbridge|pavement|urban)",
    ],
    "water related": [
        r"(water|pipe|pipeline|leak|drain|drainage|supply|tank|tap|flood|drinking|borewell|handpump|waterlog)",
    ],
    "environment": [
        r"(pollution|dust|smoke|emission|tree|forest|air|green|plant|nature|chemical|noise|plastic|smog|deforestation|wildlife|ecosystem)",
    ],
    "accessibility": [
        r"(accessibility|disabled|wheelchair|blind|handicap|pedestrian|ramp|braille|disability)",
    ],
    "education": [
        r"(school|college|university|student|teacher|class|classroom|exam|books|education|study|degree|coaching|library)",
    ],
    "public administration": [
        r"(governance|scheme|pension|ration|certificate|bribe|corruption|social welfare|officer|dept|department|bureaucracy)",
    ],
    "rural livelihood": [
        r"(rural|employment|wages|mgnrega|nrega|livelihood|job|labor|labour|worker|village|craftsman)",
    ],
}

_model = None
_tokenizer = None
_device = None

def _get_model():
    global _model, _tokenizer, _device
    if _model is not None:
        return _model, _tokenizer, _device
    if MODEL_DIR.exists():
        try:
            import torch
            from transformers import AutoTokenizer, AutoModelForSequenceClassification
            _device = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")
            _tokenizer = AutoTokenizer.from_pretrained(str(MODEL_DIR))
            _model = AutoModelForSequenceClassification.from_pretrained(str(MODEL_DIR)).to(_device)
            _model.eval()
            return _model, _tokenizer, _device
        except Exception as e:
            print(f"Warning: Failed to load local model from {MODEL_DIR}: {e}")
    return None, None, None

def predict_fallback(text):
    text_lower = text.lower()
    scores = {}
    for cat, patterns in CATEGORY_PATTERNS.items():
        score = 0
        for pat in patterns:
            matches = re.findall(pat, text_lower)
            score += len(matches)
        if score > 0:
            scores[cat] = score

    if scores:
        best_cat = max(scores, key=scores.get)
        return best_cat, min(0.7 + scores[best_cat] * 0.1, 0.98)
    return "other", 0.5

def predict(text):
    if not text or not text.strip():
        return "other", 0.0

    if DIGITAL_INFRA.search(text):
        return "accessibility", 1.0

    model, tokenizer, device = _get_model()
    if model is not None and tokenizer is not None:
        try:
            import torch
            inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=MAX_LEN).to(device)
            with torch.no_grad():
                logits = model(**inputs).logits
            probs = torch.softmax(logits, dim=-1)[0]
            idx = probs.argmax().item()
            label = model.config.id2label[idx]
            return label, float(probs[idx].item())
        except Exception as e:
            print(f"Prediction error: {e}")

    return predict_fallback(text)


if __name__ == "__main__":
    text = " ".join(sys.argv[1:]).strip()
    if not text:
        text = input("Enter a sentence: ")
    label, confidence = predict(text)
    print(f"Category: {label}")