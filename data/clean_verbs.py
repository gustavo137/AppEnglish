# This script reads a CSV file containing verb forms, normalizes the data, and writes it to a JSON file.
# Run from project root: python data/clean_verbs.py

import pandas as pd
import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent      # .../AppEnglish/data
ROOT = BASE.parent                         # .../AppEnglish

# <-- aquí asume que el CSV está en data/
INPUT_CSV = BASE / "verbs_short.csv"
OUT = ROOT / "public" / "verbs.json"       # <-- salida final para la app


def norm(s):
    if pd.isna(s):
        return ""
    s = str(s).replace("\u00a0", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s


df = pd.read_csv(INPUT_CSV, encoding="utf-8")

# Text normalization
for col in df.columns:
    df[col] = df[col].apply(norm)

# Verb forms normalization
df["infinitive"] = df["infinitive"].str.lower(
).str.replace(r"^(to)\s+", "", regex=True)
df["simple_past"] = df["simple_past"].str.lower()
df["past_participle"] = df["past_participle"].str.lower()
df["gerund"] = df["gerund"].str.lower()

# Removal of invalid entries
df = df[df["infinitive"] != ""]
df = df.drop_duplicates(subset=["infinitive"])

records = []

for _, row in df.iterrows():
    infinitive = row["infinitive"]
    record = {
        "id": f"to_{infinitive.replace(' ', '_')}",
        "spanish": row.get("spanish", ""),
        "pronunciation": row.get("pronunciation", ""),
        "infinitive": infinitive,
        "past": row.get("simple_past", ""),
        "past_participle": row.get("past_participle", ""),
        "gerund": row.get("gerund", ""),
        "image": row.get("image_url", "")
    }
    records.append(record)

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(records, f, ensure_ascii=False, indent=2)

print(f"OK → {len(records)} verbs written to {OUT}")
