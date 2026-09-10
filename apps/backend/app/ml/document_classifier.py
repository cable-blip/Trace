"""
Document Classification Model (TRACE ML Architecture — Phase 4).
TF-IDF Vectorizer + Logistic Regression trained on central synthetic corpus.
Replaces keyword-sniffing heuristics in Universal ETL.
Saved safely as document_classifier.joblib.
"""

import os
from typing import Tuple, Optional
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from app.ml.training_data import generate_document_classification_data

SAVED_MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "saved_models"))
MODEL_PATH = os.path.join(SAVED_MODELS_DIR, "document_classifier.joblib")


def train_document_classifier() -> Pipeline:
    """Trains TF-IDF + LogisticRegression pipeline and saves via joblib."""
    dataset = generate_document_classification_data(n_samples=320, seed=42)
    X = [d["text"] for d in dataset]
    y = [d["label"] for d in dataset]

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=600, ngram_range=(1, 2), stop_words="english")),
        ("clf", LogisticRegression(max_iter=300, C=2.0, random_state=42))
    ])
    pipeline.fit(X, y)

    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    return pipeline


class DocumentClassifierEngine:
    _instance: Optional['DocumentClassifierEngine'] = None

    def __init__(self):
        self.pipeline: Optional[Pipeline] = None
        self._load_or_train()

    def _load_or_train(self):
        try:
            if os.path.exists(MODEL_PATH):
                self.pipeline = joblib.load(MODEL_PATH)
            else:
                self.pipeline = train_document_classifier()
        except Exception:
            self.pipeline = None

    @classmethod
    def get_instance(cls) -> 'DocumentClassifierEngine':
        if cls._instance is None:
            cls._instance = DocumentClassifierEngine()
        return cls._instance

    def predict_document_type(self, content: str, filename: str = "") -> Tuple[str, float]:
        """
        Classifies intelligence documents into:
        - LEGAL_FIR_REPORT
        - CDR_TELECOM
        - FINANCIAL_LEDGER
        - SURVEILLANCE_LOG
        - GENERIC_INTELLIGENCE
        """
        if not content.strip():
            return "GENERIC_INTELLIGENCE", 0.0

        # Fast structure checks for CSV headers
        lower_fn = filename.lower()
        if lower_fn.endswith(".csv"):
            c_head = content[:500].lower()
            if any(k in c_head for k in ["caller", "callee", "msisdn", "duration", "tower"]):
                return "CDR_TELECOM", 0.95
            if any(k in c_head for k in ["transaction", "amount", "source_account", "debit"]):
                return "FINANCIAL_LEDGER", 0.95

        if self.pipeline is not None:
            try:
                probs = self.pipeline.predict_proba([content[:4000]])[0]
                classes = self.pipeline.classes_
                max_idx = int(probs.argmax())
                pred_label = str(classes[max_idx])
                confidence = float(probs[max_idx])
                if confidence >= 0.35:
                    return pred_label, confidence
            except Exception:
                pass

        # Robust Fallback
        c_lower = content[:2000].lower()
        if "first information" in c_lower or "fir no" in c_lower or "police station" in c_lower:
            return "LEGAL_FIR_REPORT", 0.85
        elif "caller" in c_lower or "callee" in c_lower or "duration" in c_lower:
            return "CDR_TELECOM", 0.85
        elif "transaction" in c_lower or "account" in c_lower or "amount" in c_lower:
            return "FINANCIAL_LEDGER", 0.85
        elif "surveillance" in c_lower or "spotted" in c_lower or "target" in c_lower:
            return "SURVEILLANCE_LOG", 0.85

        return "GENERIC_INTELLIGENCE", 0.50

    predict_type = predict_document_type
