"""
model.py — AquaLoop Water Quality Classifier
---------------------------------------------
Trains a Gradient Boosting + Random Forest ensemble on water_quality_dataset.csv
Matches exact field names from the Arduino WebSocket bridge:
  turbidity, tds, temp, ph, inFlowLpm, outFlowLpm → class (min/med/max)

Run:
    python3 model.py

To use live data from bridge later, call predict_single() directly.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import (
    RandomForestClassifier,
    GradientBoostingClassifier,
)
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
import pickle
import os
import json

# ─────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────
DATASET_PATH = "water_potability_adapted.csv"
MODEL_PATH   = "aqualoop_model.pkl"
RAW_FEATURES = ["turbidity", "tds", "temp", "ph", "inFlowLpm", "outFlowLpm"]
TARGET       = "label"

# ─────────────────────────────────────────
# 1. LOAD DATA
# ─────────────────────────────────────────
print("=" * 55)
print("  AquaLoop Water Quality Model Trainer  v2")
print("=" * 55)

df = pd.read_csv(DATASET_PATH)
print(f"\n✓ Loaded {len(df)} samples from {DATASET_PATH}")
print(f"  Classes: {df[TARGET].value_counts().to_dict()}")

# ─────────────────────────────────────────
# 2. FEATURE ENGINEERING
# ─────────────────────────────────────────
print("\n  Engineering features...")

df["tds_turb_ratio"] = df["tds"] / (df["turbidity"] + 0.01)
df["flow_diff"]      = df["inFlowLpm"] - df["outFlowLpm"]
df["ph_deviation"]   = (df["ph"] - 7.0).abs()
df["temp_deviation"] = (df["temp"] - 25.0).abs()

FEATURES = RAW_FEATURES + ["tds_turb_ratio", "flow_diff", "ph_deviation", "temp_deviation"]
print(f"  Features ({len(FEATURES)}): {FEATURES}")

X = df[FEATURES]
y = df[TARGET]

# ─────────────────────────────────────────
# 3. ENCODE LABELS  max=0  med=1  min=2
# ─────────────────────────────────────────
le = LabelEncoder()
le.classes_ = np.array(["max", "med", "min"])  # fix alphabetical → logical order
y_encoded = le.transform(y)

LABEL_MAP = {i: c for i, c in enumerate(le.classes_)}
print(f"\n  Label encoding: {LABEL_MAP}")

# ─────────────────────────────────────────
# 4. TRAIN / TEST SPLIT
# ─────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)
print(f"\n  Train: {len(X_train)} samples")
print(f"  Test:  {len(X_test)} samples")

# ─────────────────────────────────────────
# 5. TRAIN MODEL
# ─────────────────────────────────────────
print("\n  Training Random Forest (accuracy-optimized + engineered features)...")

model = RandomForestClassifier(
    n_estimators=500,
    max_depth=None,
    min_samples_split=2,
    random_state=42,
    n_jobs=-1,
)
model.fit(X_train, y_train)
print("  ✓ Training complete")

# ─────────────────────────────────────────
# 6. CROSS-VALIDATION
# ─────────────────────────────────────────
print("\n  Running 5-fold cross-validation...")
cv_scores = cross_val_score(
    RandomForestClassifier(
        n_estimators=200, class_weight="balanced", random_state=42, n_jobs=-1
    ),
    X, y_encoded, cv=5, scoring="accuracy"
)
print(f"  CV Accuracy: {cv_scores.mean()*100:.1f}% ± {cv_scores.std()*100:.1f}%")

# ─────────────────────────────────────────
# 7. EVALUATE
# ─────────────────────────────────────────
y_pred = model.predict(X_test)
accuracy = (y_pred == y_test).mean()

print(f"\n{'─'*55}")
print(f"  Test Accuracy: {accuracy*100:.1f}%")
print(f"{'─'*55}")

print("\n  Classification Report:")
print(classification_report(
    y_test, y_pred,
    target_names=le.classes_
))

print("  Confusion Matrix (rows=actual, cols=predicted):")
cm = confusion_matrix(y_test, y_pred)
cm_df = pd.DataFrame(
    cm,
    index=[f"actual_{c}" for c in le.classes_],
    columns=[f"pred_{c}" for c in le.classes_]
)
print(cm_df.to_string())

# ─────────────────────────────────────────
# 8. FEATURE IMPORTANCE (from RF sub-model)
# ─────────────────────────────────────────
print(f"\n  Feature Importance (what drives the decision):")
rf_fitted = model
importances = sorted(
    zip(FEATURES, rf_fitted.feature_importances_),
    key=lambda x: x[1], reverse=True
)
for feat, imp in importances:
    bar = "█" * int(imp * 40)
    print(f"    {feat:<16} {imp:.4f}  {bar}")

# ─────────────────────────────────────────
# 9. SAVE MODEL
# ─────────────────────────────────────────
with open(MODEL_PATH, "wb") as f:
    pickle.dump({
        "model": model,
        "label_encoder": le,
        "features": FEATURES,
        "raw_features": RAW_FEATURES,
    }, f)
print(f"\n  ✓ Model saved → {MODEL_PATH}")

# ─────────────────────────────────────────
# 9b. EXPORT DASHBOARD JSON
# ─────────────────────────────────────────
print("\n  Exporting dashboard JSON...")

# Test predictions with per-sample detail
test_predictions = []
probas = model.predict_proba(X_test)
for i in range(len(X_test)):
    row = X_test.iloc[i]
    test_predictions.append({
        "turbidity": round(float(row["turbidity"]), 2),
        "tds": round(float(row["tds"]), 1),
        "temp": round(float(row["temp"]), 1),
        "ph": round(float(row["ph"]), 2),
        "inFlowLpm": round(float(row["inFlowLpm"]), 3),
        "outFlowLpm": round(float(row["outFlowLpm"]), 3),
        "actual": le.classes_[y_test[i]],
        "predicted": le.classes_[y_pred[i]],
        "confidence": round(float(max(probas[i])) * 100, 1),
        "probMax": round(float(probas[i][0]) * 100, 1),
        "probMed": round(float(probas[i][1]) * 100, 1),
        "probMin": round(float(probas[i][2]) * 100, 1),
    })

# Classification report as dict
report = classification_report(y_test, y_pred, target_names=le.classes_, output_dict=True)
class_report = []
for cls in le.classes_:
    class_report.append({
        "class": cls,
        "precision": round(report[cls]["precision"] * 100, 1),
        "recall": round(report[cls]["recall"] * 100, 1),
        "f1Score": round(report[cls]["f1-score"] * 100, 1),
        "support": int(report[cls]["support"]),
    })

# Confusion matrix
cm_list = confusion_matrix(y_test, y_pred).tolist()

# Feature importances
feat_imp = [
    {"feature": f, "importance": round(float(imp), 4)}
    for f, imp in sorted(
        zip(FEATURES, rf_fitted.feature_importances_),
        key=lambda x: x[1], reverse=True
    )
]

# Class distribution of full dataset
class_dist = [
    {"class": cls, "count": int(count)}
    for cls, count in df[TARGET].value_counts().items()
]

dashboard_data = {
    "modelName": "Random Forest (n=500, 10 features)",
    "datasetPath": DATASET_PATH,
    "totalSamples": len(df),
    "trainSamples": len(X_train),
    "testSamples": len(X_test),
    "accuracy": round(float(accuracy) * 100, 1),
    "cvAccuracy": round(float(cv_scores.mean()) * 100, 1),
    "cvStd": round(float(cv_scores.std()) * 100, 1),
    "features": FEATURES,
    "classLabels": list(le.classes_),
    "classificationReport": class_report,
    "confusionMatrix": cm_list,
    "featureImortances": feat_imp,
    "featureImportances": feat_imp,
    "classDistribution": class_dist,
    "testPredictions": test_predictions,
}

json_path = os.path.join("src", "data", "modelResults.json")
os.makedirs(os.path.dirname(json_path), exist_ok=True)
with open(json_path, "w") as f:
    json.dump(dashboard_data, f, indent=2)
print(f"  ✓ Dashboard data → {json_path}")

# ─────────────────────────────────────────
# 10. PREDICT SINGLE SAMPLE
#    (matches exact payload from bridge.py)
# ─────────────────────────────────────────
def predict_single(payload: dict) -> dict:
    """
    Pass in the raw JSON payload from the WebSocket bridge.
    Returns the payload with 'class' and 'confidence' added.

    Example:
        payload = {
            "turbidity": 0.8,
            "tds": 42,
            "temp": 22.5,
            "ph": 7.1,
            "inFlowLpm": 0.95,
            "outFlowLpm": 0.90
        }
        result = predict_single(payload)
        print(result["class"])       # "min"
        print(result["confidence"])  # 97.5
    """
    with open(MODEL_PATH, "rb") as f:
        saved = pickle.load(f)

    m  = saved["model"]
    le = saved["label_encoder"]
    feats = saved["features"]

    # Engineer features on the fly
    payload["tds_turb_ratio"] = payload["tds"] / (payload["turbidity"] + 0.01)
    payload["flow_diff"] = payload["inFlowLpm"] - payload["outFlowLpm"]
    payload["ph_deviation"] = abs(payload["ph"] - 7.0)
    payload["temp_deviation"] = abs(payload["temp"] - 25.0)

    X  = pd.DataFrame([[payload[f] for f in feats]], columns=feats)
    pred_idx  = m.predict(X)[0]
    pred_prob = m.predict_proba(X)[0]
    label     = le.classes_[pred_idx]
    confidence = round(float(max(pred_prob)) * 100, 1)

    # Clean up added keys
    for k in ["tds_turb_ratio", "flow_diff", "ph_deviation", "temp_deviation"]:
        payload.pop(k, None)

    return {**payload, "class": label, "confidence": confidence}


# ─────────────────────────────────────────
# 11. QUICK DEMO — 3 SAMPLE PREDICTIONS
# ─────────────────────────────────────────
print(f"\n{'─'*55}")
print("  Sample Predictions:")
print(f"{'─'*55}")

samples = [
    {"turbidity": 0.5,  "tds": 30,  "temp": 22.0, "ph": 7.1, "inFlowLpm": 1.0,  "outFlowLpm": 0.95, "expected": "min"},
    {"turbidity": 2.5,  "tds": 120, "temp": 28.0, "ph": 6.8, "inFlowLpm": 0.7,  "outFlowLpm": 0.65, "expected": "med"},
    {"turbidity": 12.0, "tds": 380, "temp": 44.0, "ph": 4.2, "inFlowLpm": 0.25, "outFlowLpm": 0.20, "expected": "max"},
]

for s in samples:
    expected = s.pop("expected")
    result   = predict_single(s)
    match    = "✓" if result["class"] == expected else "✗"
    print(
        f"  {match} TDS:{s['tds']:>4}  Turb:{s['turbidity']:>5}  "
        f"pH:{s['ph']}  → {result['class'].upper():<4} "
        f"({result['confidence']}% confidence)  expected:{expected}"
    )

print(f"\n{'='*55}")
print("  Done. Model ready for bridge.py integration.")
print(f"{'='*55}\n")