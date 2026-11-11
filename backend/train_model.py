"""
PhishGuard - Machine Learning Training & Evaluation Pipeline
Trains TF-IDF Vectorizer and Logistic Regression Classifier on labeled email data.
Evaluates model on held-out test split, computing Accuracy, Precision, Recall,
F1 Score, Confusion Matrix, and feature importances.
"""

import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from dataset import get_full_dataset

def train_and_evaluate():
    print("=" * 60)
    print("  PHISHGUARD MACHINE LEARNING TRAINING PIPELINE")
    print("=" * 60)

    # 1. Load dataset
    raw_data = get_full_dataset()
    df = pd.DataFrame(raw_data)
    
    # Save CSV and JSON for audit & inspection
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    df.to_csv(os.path.join(backend_dir, "dataset.csv"), index=False)
    with open(os.path.join(backend_dir, "dataset.json"), "w") as f:
        json.dump(raw_data, f, indent=2)

    print(f"Loaded {len(df)} total labeled emails.")
    print(f" - Phishing emails (label=1): {(df['label'] == 1).sum()}")
    print(f" - Legitimate emails (label=0): {(df['label'] == 0).sum()}")

    # 2. Text feature preprocessing
    # Combine subject, body, and sender domain for comprehensive context
    df["full_text"] = df["subject"] + " " + df["body"] + " " + df["sender"]

    X = df["full_text"]
    y = df["label"]

    # 3. Train/Test Split (stratified 75/25 split)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    print(f"\nTraining set size: {len(X_train)} emails")
    print(f"Test set size: {len(X_test)} emails")

    # 4. TF-IDF Vectorization
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=1200,
        stop_words="english",
        sublinear_tf=True,
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # 5. Logistic Regression Model
    model = LogisticRegression(C=2.0, max_iter=300, random_state=42)
    model.fit(X_train_vec, y_train)

    # Benchmark: Multinomial Naive Bayes
    nb_model = MultinomialNB(alpha=0.5)
    nb_model.fit(X_train_vec, y_train)
    nb_preds = nb_model.predict(X_test_vec)
    nb_accuracy = float(accuracy_score(y_test, nb_preds))
    nb_f1 = float(f1_score(y_test, nb_preds, zero_division=0))

    # 6. Evaluation on Test Set
    y_pred = model.predict(X_test_vec)
    y_prob = model.predict_proba(X_test_vec)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    auc = float(roc_auc_score(y_test, y_prob))

    # Confusion matrix on real test set: [[TN, FP], [FN, TP]]
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = [int(v) for v in cm.ravel()]

    print("\n--- MODEL EVALUATION METRICS (TEST SET) ---")
    print(f"Accuracy:        {acc * 100:.2f}%")
    print(f"Precision:       {prec * 100:.2f}%")
    print(f"Recall:          {rec * 100:.2f}%")
    print(f"F1 Score:        {f1 * 100:.2f}%")
    print(f"ROC-AUC:         {auc * 100:.2f}%")
    print("\nConfusion Matrix:")
    print(f"  TN: {tn:2d} | FP: {fp:2d}")
    print(f"  FN: {fn:2d} | TP: {tp:2d}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=["Legitimate", "Phishing"]))

    # 7. Feature Importance (Top TF-IDF coefficients)
    feature_names = vectorizer.get_feature_names_out()
    coefs = model.coef_[0]
    
    top_phish_idx = np.argsort(coefs)[-15:][::-1]
    top_safe_idx = np.argsort(coefs)[:15]

    top_phishing_features = [
        {"feature": str(feature_names[i]), "weight": round(float(coefs[i]), 4)}
        for i in top_phish_idx
    ]
    top_legitimate_features = [
        {"feature": str(feature_names[i]), "weight": round(float(abs(coefs[i])), 4)}
        for i in top_safe_idx
    ]

    # 8. Save Model and Vectorizer Artifacts
    joblib.dump(model, os.path.join(backend_dir, "phishguard_model.pkl"))
    joblib.dump(vectorizer, os.path.join(backend_dir, "phishguard_vectorizer.pkl"))

    metrics_output = {
        "model_type": "Logistic Regression with TF-IDF Vectorizer",
        "benchmark_model": "Multinomial Naive Bayes",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "total_dataset_size": len(df),
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(auc, 4),
            "benchmark_nb_accuracy": round(nb_accuracy, 4),
            "benchmark_nb_f1": round(nb_f1, 4),
        },
        "confusion_matrix": {
            "true_negatives": tn,
            "false_positives": fp,
            "false_negatives": fn,
            "true_positives": tp,
            "total_tested": int(len(y_test)),
        },
        "top_phishing_features": top_phishing_features,
        "top_legitimate_features": top_legitimate_features,
        "vocabulary_size": len(feature_names),
        "generated_at": pd.Timestamp.now().isoformat(),
    }

    with open(os.path.join(backend_dir, "model_metrics.json"), "w") as f:
        json.dump(metrics_output, f, indent=2)

    print(f"\nArtifacts saved successfully in {backend_dir}")
    return metrics_output

if __name__ == "__main__":
    train_and_evaluate()
