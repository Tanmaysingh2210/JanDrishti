import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
os.environ.setdefault("HF_HOME", str(ROOT / ".hf_cache"))

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import torch
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.model_selection import train_test_split
from torch.utils.data import Dataset, DataLoader
from transformers import AutoTokenizer, AutoModelForSequenceClassification, get_linear_schedule_with_warmup
from tqdm.auto import tqdm

DATA = ROOT / "Text_Model" / "Data" / "processed"
TRAIN = DATA / "text_train.csv"
TEST = DATA / "text_test.csv"
OUT = ROOT / "artifacts/models/muril"
FIG = ROOT / "reports/figures"
OUT.mkdir(parents=True, exist_ok=True)
FIG.mkdir(parents=True, exist_ok=True)

MODEL_NAME = "google/muril-base-cased"
MAX_LEN, BATCH, EPOCHS, LR = 128, 8, 4, 2e-5
DEVICE = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")

train_df = pd.read_csv(TRAIN)
test_df = pd.read_csv(TEST)
train_df, val_df = train_test_split(train_df, test_size=0.1, stratify=train_df["output"], random_state=42)

classes = sorted(train_df["output"].unique())
label2id = {x: i for i, x in enumerate(classes)}
id2label = {i: x for x, i in label2id.items()}

for df in [train_df, val_df, test_df]:
    df["label"] = df["output"].map(label2id)

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

class Complaints(Dataset):
    def __init__(self, df):
        self.labels = df["label"].tolist()
        self.encodings = tokenizer(df["input"].astype(str).tolist(), padding="max_length", truncation=True, max_length=MAX_LEN)
    def __len__(self):
        return len(self.labels)
    def __getitem__(self, i):
        x = {k: torch.tensor(v[i]) for k, v in self.encodings.items()}
        x["labels"] = torch.tensor(self.labels[i])
        return x

train_loader = DataLoader(Complaints(train_df), batch_size=BATCH, shuffle=True)
val_loader = DataLoader(Complaints(val_df), batch_size=BATCH * 2)
test_loader = DataLoader(Complaints(test_df), batch_size=BATCH * 2)

model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME, num_labels=len(classes), id2label=id2label, label2id=label2id
).to(DEVICE)

optimizer = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=0.01)
steps = len(train_loader) * EPOCHS
scheduler = get_linear_schedule_with_warmup(optimizer, int(steps * 0.1), steps)

def evaluate(loader):
    model.eval()
    preds, labels = [], []
    loss = 0
    with torch.no_grad():
        for batch in loader:
            batch = {k: v.to(DEVICE) for k, v in batch.items()}
            out = model(**batch)
            loss += out.loss.item()
            preds.extend(torch.argmax(out.logits, 1).cpu().numpy())
            labels.extend(batch["labels"].cpu().numpy())
    return labels, preds, loss / len(loader)

best_f1 = 0
history = {"train": [], "val": []}

for epoch in range(EPOCHS):
    model.train()
    total_loss = 0

    for batch in tqdm(train_loader, desc=f"Epoch {epoch + 1}/{EPOCHS}"):
        batch = {k: v.to(DEVICE) for k, v in batch.items()}
        optimizer.zero_grad()
        loss = model(**batch).loss
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        scheduler.step()
        total_loss += loss.item()

    val_labels, val_preds, val_loss = evaluate(val_loader)
    val_f1 = f1_score(val_labels, val_preds, average="macro", zero_division=0)

    history["train"].append(total_loss / len(train_loader))
    history["val"].append(val_loss)

    print(f"Epoch {epoch + 1}: train_loss={history['train'][-1]:.4f}, val_loss={val_loss:.4f}, val_f1={val_f1:.4f}")

    if val_f1 > best_f1:
        best_f1 = val_f1
        model.save_pretrained(OUT)
        tokenizer.save_pretrained(OUT)

model = AutoModelForSequenceClassification.from_pretrained(OUT).to(DEVICE)
labels, preds, test_loss = evaluate(test_loader)

accuracy = accuracy_score(labels, preds)
f1 = f1_score(labels, preds, average="macro", zero_division=0)

print(f"\nAccuracy: {accuracy:.4f}")
print(f"Macro F1: {f1:.4f}")
print("\nClassification Report:\n", classification_report(labels, preds, target_names=classes, zero_division=0))

with open(OUT / "metrics.json", "w") as f:
    json.dump({"accuracy": accuracy, "macro_f1": f1, "best_val_f1": best_f1}, f, indent=2)

with open(OUT / "label_mapping.json", "w") as f:
    json.dump({"label2id": label2id, "id2label": id2label}, f, indent=2)

plt.figure(figsize=(10, 8))
sns.heatmap(confusion_matrix(labels, preds), annot=True, fmt="d", cmap="Blues", xticklabels=classes, yticklabels=classes)
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.tight_layout()
plt.savefig(FIG / "confusion_matrix.png")
plt.close()

plt.figure(figsize=(8, 5))
plt.plot(history["train"], label="Train Loss")
plt.plot(history["val"], label="Validation Loss")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.legend()
plt.tight_layout()
plt.savefig(FIG / "training_history.png")
plt.close()

print(f"\nModel saved at: {OUT}")