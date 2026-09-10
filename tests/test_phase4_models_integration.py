"""
Phase 4 Integration Test: Real Upload File Verification for:
1. Document Classifier (document_classifier.joblib)
2. Self-Supervised Link Predictor (link_prediction_model.py)
3. Isolation Forest Anomaly Detector (anomaly_model.py)
4. Threat Forecaster (threat_forecaster.joblib)
"""

import io
import os
import sys
import pytest
from fastapi.testclient import TestClient

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'apps', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app
from app.ml.document_classifier import DocumentClassifierEngine
from app.ml.threat_forecaster_model import ThreatForecasterMLModel

@pytest.fixture
def client():
    return TestClient(app)


def test_document_classifier_integration(client):
    """Tests document classification with real file payloads."""
    engine = DocumentClassifierEngine.get_instance()
    assert engine.pipeline is not None, "document_classifier.joblib must be loaded on disk"

    # Sample real text payloads
    bank_text = "Transaction Date, Value Date, Description, Ref No, Withdrawal, Deposit, Balance\n2026-04-01, 2026-04-01, NEFT Cr-MULE01-HDFC0001, TXN1001, 0, 500000, 500000"
    cdr_text = "caller_phone,callee_phone,duration_sec,tower_id,call_type,timestamp\n9811002233,9899001122,340,TOWER_PANVEL_01,VOICE,2026-04-10T10:00:00"
    fir_text = "FIRST INFORMATION REPORT FIR No 88/2026 Police Station Crime Branch. Complainant reports stolen vehicle and seized contraband."

    pred_bank, conf_bank = engine.predict_type(bank_text)
    pred_cdr, conf_cdr = engine.predict_type(cdr_text)
    pred_fir, conf_fir = engine.predict_type(fir_text)

    assert pred_bank in ["FINANCIAL_LEDGER", "bank_statement"]
    assert pred_cdr in ["CDR_TELECOM", "cdr"]
    assert pred_fir in ["LEGAL_FIR_REPORT", "fir"]
    assert conf_bank > 0.4
    assert conf_cdr > 0.4
    assert conf_fir > 0.4


def test_phase4_end_to_end_real_uploads(client):
    """Tests Link Prediction, Anomaly Detection, and Threat Forecaster on real uploaded files."""
    # 1. Create fresh case
    c_res = client.post("/api/cases?name=Phase4%20Syndicate%20Test&description=Phase%204%20Verification")
    assert c_res.status_code == 200
    case_id = c_res.json()["id"]

    # 2. Upload CDR file
    cdr_csv = """caller_phone,callee_phone,duration_sec,tower_id,timestamp
9811002233,9899001122,340,TOWER_PANVEL_01,2026-04-10T10:00:00
9899001122,9877003344,280,TOWER_SOUTH_02,2026-04-10T10:45:00
9899001122,9866004455,410,TOWER_SOUTH_02,2026-04-10T11:30:00
9877003344,9855005566,120,TOWER_PORT_05,2026-04-10T12:15:00
9866004455,9855005566,190,TOWER_PORT_05,2026-04-10T13:00:00
"""
    r1 = client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("cdr_logs.csv", io.BytesIO(cdr_csv.encode("utf-8")), "text/csv")}
    )
    assert r1.status_code == 200

    # 3. Upload Financial CSV with anomalous transactions
    fin_csv = """source_account,target_account,amount,timestamp,channel
ACC-1001,ACC-2002,1200000,2026-04-10T02:15:00,RTGS
ACC-2002,ACC-3003,450000,2026-04-10T02:30:00,IMPS
ACC-2002,ACC-4004,450000,2026-04-10T02:45:00,IMPS
ACC-2002,ACC-5005,450000,2026-04-10T03:00:00,IMPS
ACC-2002,ACC-6006,450000,2026-04-10T03:15:00,IMPS
ACC-2002,ACC-7007,9500000,2026-04-10T03:30:00,HAWALA
"""
    r2 = client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("financial_ledger.csv", io.BytesIO(fin_csv.encode("utf-8")), "text/csv")}
    )
    assert r2.status_code == 200

    # Ingest Case to populate graph from uploaded files
    ing_res = client.post(f"/api/cases/{case_id}/ingest")
    assert ing_res.status_code == 200

    # 4. Test Topological & ML Link Prediction endpoint
    lp_res = client.get(f"/api/cases/{case_id}/ml/link-predictions")
    assert lp_res.status_code == 200
    links = lp_res.json()
    assert isinstance(links, list)
    if len(links) > 0:
        for link in links:
            assert "link_probability" in link
            assert link["status"] == "predicted, not confirmed"
            assert "adamic_adar_score" in link

    # 5. Test Anomaly Detection (Isolation Forest) endpoint
    rf_res = client.get(f"/api/cases/{case_id}/red-flags")
    assert rf_res.status_code == 200
    flags = rf_res.json()
    assert isinstance(flags, list)
    assert len(flags) > 0

    # 6. Test Threat Forecaster (threat_forecaster.joblib) endpoint
    tf_res = client.get(f"/api/cases/{case_id}/threat-forecast")
    assert tf_res.status_code == 200
    tf_data = tf_res.json()
    assert tf_data["case_id"] == case_id
    assert "overall_syndicate_threat_score" in tf_data
    assert tf_data["ml_model_used"] == "threat_forecaster.joblib"
    assert "ml_escalation_risk" in tf_data
    assert 0.0 <= tf_data["ml_escalation_risk"] <= 1.0
    assert len(tf_data["forecasts"]) > 0
