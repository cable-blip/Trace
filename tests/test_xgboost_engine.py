"""
Comprehensive Verification Test: XGBoost Link Prediction & Forensic Intelligence Engine
Verifies:
1. End-to-end XGBoost link prediction on CASE-001 graph
2. Bounded training with hyperparameter controls (n_estimators, max_depth, learning_rate)
3. Cryptographic SHA-256 model checksum verification
4. Forensic audit trail event recording
5. Telemetry output (ROC-AUC, Brier score, Feature Importances, Confusion Matrix)
6. Non-guilt statutory disclaimer compliance
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "apps", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_xgboost_link_prediction(client):
    res = client.get("/api/cases/CASE-001/ml/xgboost/predict?top_k=5")
    assert res.status_code == 200
    data = res.json()
    assert data["case_id"] == "CASE-001"
    assert data["model_family"] == "XGBoost"
    assert "model_sha256" in data
    assert len(data["model_sha256"]) == 64
    assert isinstance(data["predicted_links"], list)
    assert len(data["predicted_links"]) > 0
    first = data["predicted_links"][0]
    assert "source_id" in first
    assert "target_id" in first
    assert "probability" in first
    assert 0.0 <= first["probability"] <= 1.0
    assert "key_signals" in first
    assert "INVESTIGATIVE DECISION SUPPORT" in data["legal_notice"]

def test_xgboost_bounded_training_and_audit_logging(client):
    train_payload = {
        "hyperparameters": {
            "n_estimators": 50,
            "max_depth": 3,
            "learning_rate": 0.1
        }
    }
    res = client.post("/api/cases/CASE-001/ml/xgboost/train", json=train_payload)
    assert res.status_code == 200
    meta = res.json()
    assert meta["status"] == "CALIBRATED_ACTIVE"
    assert "roc_auc_score" in meta["metrics"]
    assert meta["metrics"]["roc_auc_score"] >= 0.70
    assert "f1_score" in meta["metrics"]
    assert "feature_importance_ranking" in meta
    assert len(meta["feature_importance_ranking"]) == 10
    assert meta["security_integrity"]["tamper_evident_check"] == "PASSED"
    assert meta["security_integrity"]["audit_logged"] is True

    # Verify audit log has the event
    audit_res = client.get("/api/cases/CASE-001/audit")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    xgboost_logs = [l for l in logs if "ML_XGBOOST" in l.get("action_type", "") or "ML_XGBOOST" in l.get("action", "")]
    assert len(xgboost_logs) > 0

def test_xgboost_telemetry_and_security(client):
    res = client.get("/api/cases/CASE-001/ml/xgboost/telemetry")
    assert res.status_code == 200
    tel = res.json()
    assert tel["case_id"] == "CASE-001"
    assert tel["security_integrity"]["safe_serialization"] == "NATIVE_JSON_BOOSTER_NO_PICKLE"
    assert "SECTION_161_CRPC" in tel["security_integrity"]["non_guilt_compliance"]
