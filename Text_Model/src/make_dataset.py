from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DATA_DIR = BASE_DIR / "Data" / "raw" / "Text dataset"
PROCESSED_DIR = BASE_DIR / "Data" / "processed"

TARGET_ROWS = 5000


def load_all_csvs() -> list[pd.DataFrame]:
    if not RAW_DATA_DIR.exists():
        raise FileNotFoundError(f"Raw dataset folder not found at {RAW_DATA_DIR}")

    csv_files = sorted(RAW_DATA_DIR.glob("*.csv"))
    if not csv_files:
        raise ValueError(f"No CSV files found in {RAW_DATA_DIR}")

    frames = []
    for path in csv_files:
        df = pd.read_csv(path)
        print(f"Loaded {path.name}: {len(df)} rows")
        frames.append(df)

    return frames


def build_text_dataset(test_size: float, seed: int) -> None:
    frames = load_all_csvs()

    df = pd.concat(frames, ignore_index=True)

    required_cols = {"input", "output"}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"Combined dataset is missing columns: {missing}")

    df = df.dropna(subset=["input", "output"])
    df["input"] = df["input"].astype(str).str.strip()
    df["output"] = df["output"].astype(str).str.strip()
    df = df[df["input"] != ""].reset_index(drop=True)

    if len(df) < TARGET_ROWS:
        print(f"Warning: only {len(df)} rows available (target was {TARGET_ROWS}).")
    else:
        df = df.head(TARGET_ROWS)

    df = df.sample(frac=1, random_state=seed).reset_index(drop=True)

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    labels = sorted(df["output"].unique())
    mapping = {label: i for i, label in enumerate(labels)}
    df["category_encoded"] = df["output"].map(mapping).astype(int)

    with open(PROCESSED_DIR / "label_mappings.json", "w") as f:
        json.dump({"category": mapping}, f, indent=2)

    df.to_csv(PROCESSED_DIR / "text_dataset.csv", index=False)

    stratify = df["output"] if df["output"].value_counts().min() >= 2 else None
    train_df, test_df = train_test_split(df, test_size=test_size, random_state=seed, stratify=stratify)
    train_df.to_csv(PROCESSED_DIR / "text_train.csv", index=False)
    test_df.to_csv(PROCESSED_DIR / "text_test.csv", index=False)

    print(f"\nProcessed {len(df)} rows.")
    print("Saved outputs to", PROCESSED_DIR)
    print(f"  text_dataset.csv : {len(df)} rows")
    print(f"  text_train.csv   : {len(train_df)} rows")
    print(f"  text_test.csv    : {len(test_df)} rows")
    print("\nText category distribution:")
    print(df["output"].value_counts().to_string())


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the JanDrishti text dataset.")
    parser.add_argument("--test-size", type=float, default=0.2, help="Fraction of data held out for testing.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility.")
    args = parser.parse_args()

    build_text_dataset(args.test_size, args.seed)


if __name__ == "__main__":
    main()
