"""
Threat Forecasting Model (TRACE ML Architecture — Phase 4).
Logistic Regression trained on temporal activity features (burst frequency, recency, cross-channel hops).
Saved safely as threat_forecaster.joblib.
"""

import os
from typing import List, Dict, Any, Optional
import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

from app.ml.training_data import generate_threat_temporal_data

SAVED_MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "saved_models"))
MODEL_PATH = os.path.join(SAVED_MODELS_DIR, "threat_forecaster.joblib")


def train_threat_forecaster() -> Pipeline:
    """Trains StandardScaler + LogisticRegression on synthetic temporal threat data."""
    dataset = generate_threat_temporal_data(n_samples=250, seed=42)
    X = [d["features"] for d in dataset]
    y = [d["label"] for d in dataset]

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=200, C=1.5, random_state=42))
    ])
    pipeline.fit(np.array(X, dtype=np.float32), np.array(y, dtype=np.int32))

    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    return pipeline


class ThreatForecasterMLModel:
    _instance: Optional['ThreatForecasterMLModel'] = None

    def __init__(self):
        self.pipeline: Optional[Pipeline] = None
        self._load_or_train()

    def _load_or_train(self):
        try:
            if os.path.exists(MODEL_PATH):
                self.pipeline = joblib.load(MODEL_PATH)
            else:
                self.pipeline = train_threat_forecaster()
        except Exception:
            self.pipeline = None

    @classmethod
    def get_instance(cls) -> 'ThreatForecasterMLModel':
        if cls._instance is None:
            cls._instance = ThreatForecasterMLModel()
        return cls._instance

    def predict_escalation_risk(self, call_burst: float, fin_surge: float, recency_hours: float, channel_hops: int) -> float:
        """Computes escalation probability using trained model."""
        feats = [call_burst, fin_surge, recency_hours, float(channel_hops)]
        if self.pipeline is not None:
            try:
                prob = float(self.pipeline.predict_proba(np.array([feats], dtype=np.float32))[0][1])
                return round(prob, 4)
            except Exception:
                pass
        # Fallback
        score = min(max((call_burst * 0.03) + (fin_surge * 0.05) + (channel_hops * 0.08) + 0.35, 0.20), 0.95)
        return round(score, 4)
