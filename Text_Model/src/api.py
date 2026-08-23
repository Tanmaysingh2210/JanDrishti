import json
import os
import sys
import threading
from pathlib import Path

SRC_DIR = Path(__file__).resolve().parent
ROOT = SRC_DIR.parents[1]
os.environ.setdefault("HF_HOME", str(ROOT / ".hf_cache"))
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

import pipeline

DATA_FILE = ROOT / "Text_Model" / "Data" / "processed" / "text_dataset.csv"
MAPPINGS_FILE = ROOT / "Text_Model" / "Data" / "processed" / "label_mappings.json"

try:
    with open(MAPPINGS_FILE) as f:
        LABEL_MAP = json.load(f)["category"]
except FileNotFoundError:
    LABEL_MAP = {}

WRITE_LOCK = threading.Lock()

app = FastAPI(title="JanDrishti ML Service")


class ComplaintIn(BaseModel):
    text: str = Field(..., min_length=1)


def _search_duplicate(text: str) -> dict:
    category, _ = pipeline.predict(text)
    match = pipeline.engine.find_best(
        text, pipeline.CATEGORY_FIX.get(category, category)
    )
    result = {
        "complaint": text,
        "category": category,
        "similar_complaint_id": None,
        "similar_complaint": None,
        "similarity_score": None,
    }
    if match is not None and match["score"] >= pipeline.DUPLICATE_THRESHOLD:
        result["similar_complaint_id"] = int(match["id"])
        result["similar_complaint"] = match["text"]
        result["similarity_score"] = round(match["score"], 4)
    return result


@app.get("/health")
def health():
    return {
        "status": "ok",
        "indexed_complaints": int(len(pipeline.engine.texts)),
    }


@app.post("/analyze")
def analyze(complaint: ComplaintIn):
    text = complaint.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Complaint text is empty")
    return _search_duplicate(text)


@app.post("/complaints")
def add_complaint(complaint: ComplaintIn):
    text = complaint.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Complaint text is empty")

    with WRITE_LOCK:
        info = _search_duplicate(text)

        df = pd.read_csv(DATA_FILE)
        new_id = len(df)
        encoded = LABEL_MAP.get(info["category"])
        if encoded is None:
            encoded = int(df["category_encoded"].max()) + 1
        df.loc[new_id] = [text, info["category"], int(encoded)]
        df.to_csv(DATA_FILE, index=False)

        pipeline.engine.add_complaint(text, info["category"], complaint_id=new_id)

    return info
