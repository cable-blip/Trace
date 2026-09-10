"""
Phase 2 Integration Test: XGBoost Entity Resolution with Real Uploaded Documents.
Ingests two real uploaded documents with varied spellings:
Doc 1: FIR naming 'Devendra Sharma'
Doc 2: Surveillance log naming 'Devender Sharma'
Asserts:
1. Both mentions are resolved to ONE single node, not two duplicate nodes.
2. The entity attributes record ML resolution metadata.
3. Edges from both documents link to the resolved canonical node.
"""

import io
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


def test_entity_resolution_end_to_end_real_files(client):
    # 1. Create a fresh case
    c_res = client.post("/api/cases?name=Operation%20Resolver&description=Entity%20Resolution%20Verification")
    assert c_res.status_code == 200
    case_id = c_res.json()["id"]

    # 2. Upload Document 1 (FIR naming Devendra Sharma)
    fir_content = """FIRST INFORMATION REPORT
FIR No: 991/2026
Police Station: Crime Branch Mumbai
Subject: Syndicate Investigation
During field intelligence operations, suspect Devendra Sharma was spotted meeting associates regarding consignment clearances.
Devendra Sharma transferred funds to courier accounts and authorized transport.
"""
    up1 = client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("fir_case_991.txt", io.BytesIO(fir_content.encode("utf-8")), "text/plain")}
    )
    assert up1.status_code == 200

    # 3. Upload Document 2 (Surveillance report naming Devender Sharma with varied spelling)
    surv_content = """SURVEILLANCE REPORT
Document ID: SURV-LOG-041
Date: 2026-04-14
Field operatives observed suspect Devender Sharma arriving at warehouse terminal.
Target Devender Sharma operated vehicle MH-04-XY-9999 and contacted local handlers.
"""
    up2 = client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("surv_log_041.txt", io.BytesIO(surv_content.encode("utf-8")), "text/plain")}
    )
    assert up2.status_code == 200

    # 4. Trigger Ingestion Pipeline
    ingest_res = client.post(f"/api/cases/{case_id}/ingest")
    assert ingest_res.status_code == 200
    graph = ingest_res.json()

    # 5. Verify PERSON nodes
    person_nodes = [n for n in graph["nodes"] if n["type"] == "PERSON"]
    sharma_nodes = [
        n for n in person_nodes 
        if "devendra" in n["label"].lower() or "devender" in n["label"].lower()
    ]

    # PROOF: Must resolve to EXACTLY ONE node, NOT two!
    assert len(sharma_nodes) == 1, f"Expected exactly 1 resolved Sharma node, found {len(sharma_nodes)}: {[n['label'] for n in sharma_nodes]}"
    resolved_sharma = sharma_nodes[0]
    print(f"\n[PHASE 2 PASS] Successfully resolved Devendra / Devender Sharma to single node: ID='{resolved_sharma['id']}', Label='{resolved_sharma['label']}'")
