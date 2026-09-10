"""
Transaction & Syndicate Anomaly Model (TRACE ML Architecture — Phase 4).
Uses Scikit-Learn IsolationForest to detect unstructured laundering, smurfing bursts,
and impossible transaction velocity without requiring manual heuristic thresholds.
"""

from typing import List, Dict, Any
import numpy as np
from sklearn.ensemble import IsolationForest


class IsolationForestAnomalyDetector:
    @classmethod
    def detect_anomalies(cls, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Fits Isolation Forest on transactional features:
        [amount, hour_of_day, daily_frequency]
        Returns flagged anomalous transactions.
        """
        if len(transactions) < 4:
            return []

        X = []
        for tx in transactions:
            amt = float(tx.get("amount", 50000.0))
            hour = float(tx.get("hour", 12.0))
            freq = float(tx.get("frequency", 1.0))
            X.append([amt, hour, freq])

        X_mat = np.array(X, dtype=np.float32)
        contamination = min(max(1.0 / len(transactions), 0.15), 0.30)
        iso = IsolationForest(n_estimators=100, contamination=contamination, random_state=42)
        preds = iso.fit_predict(X_mat)
        scores = iso.decision_function(X_mat)

        anomalies = []
        for i, pred in enumerate(preds):
            if pred == -1:
                tx = transactions[i]
                anomalies.append({
                    "category": "ISOLATION_FOREST_ANOMALY",
                    "severity": "CRITICAL" if scores[i] < -0.15 else "HIGH",
                    "target_entity": tx.get("target_entity", "Unknown Account"),
                    "anomaly_score": round(float(-scores[i]), 4),
                    "description": f"Unsupervised ML flagged statistical outlier transaction of amount INR {tx.get('amount')}.",
                    "mitigation": "Review transaction counterparty KYC and freeze funds pending verification."
                })

        return anomalies
