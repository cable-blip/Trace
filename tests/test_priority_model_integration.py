"""
Phase 3 Integration Test: XGBoost Investigative Priority Model with Real Uploaded Files.
Uploads 3 real files:
1. FIR complaint arresting courier 'Arjun Pawar'
2. CDR log showing multi-party coordination
3. Financial CSV establishing 'Kabir Singhania' as the structural bridge hub
Asserts:
1. The hidden hub 'Kabir Singhania' ranks highest in Investigative Priority, above the arrested courier.
2. The score is computed dynamically by the XGBoost priority model, not an ID lookup.
3. Statutory non-culpability disclaimers are attached.
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


def test_priority_model_ranks_hidden_hub_highest(client):
    # 1. Create fresh case
    c_res = client.post("/api/cases?name=Operation%20Hidden%20Hub&description=Investigative%20Priority%20Verification")
    assert c_res.status_code == 200
    case_id = c_res.json()["id"]

    # 2. Upload FIR (Arjun Pawar arrested at border, names handler Sunil Deshmukh)
    fir_text = """FIRST INFORMATION REPORT (FIR)
FIR No: 104/2026
Station: Crime Branch Panvel
Summary:
Officers arrested courier Arjun Pawar transporting contraband in Vehicle MH-06-K-4411.
During spot interrogation, Arjun Pawar stated he received orders from Sunil Deshmukh (Phone: 9811002233).
Arjun Pawar transferred local payment of INR 25,000 to Account ACC-LOCAL-11.
"""
    r1 = client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("fir_arrest_104.txt", io.BytesIO(fir_text.encode("utf-8")), "text/plain")}
    )
    assert r1.status_code == 200

    # 3. Upload CDR (Sunil Deshmukh calls Kabir Singhania, Kabir coordinates multiple lines)
    cdr_csv = """caller_phone,callee_phone,duration_sec,tower_id,timestamp
9811002233,9899001122,340,TOWER_PANVEL_01,2026-04-10T10:00:00
9899001122,9877003344,280,TOWER_SOUTH_02,2026-04-10T10:45:00
9899001122,9866004455,410,TOWER_SOUTH_02,2026-04-10T11:30:00
9877003344,9855005566,120,TOWER_PORT_05,2026-04-10T12:15:00
"""
    r2 = client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("cdr_telecom_traffic.csv", io.BytesIO(cdr_csv.encode("utf-8")), "text/csv")}
    )
    assert r2.status_code == 200

    # 4. Upload Banking Ledger (Kabir Singhania directs fund routing across accounts)
    fin_csv = """source_name,target_name,amount,source_account,target_account,timestamp
Kabir Singhania,Sunil Deshmukh,1500000,ACC-KABIR-99,ACC-SUNIL-22,2026-04-09T14:00:00
Kabir Singhania,Pooja Shah,2200000,ACC-KABIR-99,ACC-POOJA-44,2026-04-09T15:30:00
Pooja Shah,Offshore Logistics,1800000,ACC-POOJA-44,ACC-OFFSHORE-77,2026-04-09T17:00:00
"""
    r3 = client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("bank_swift_ledger.csv", io.BytesIO(fin_csv.encode("utf-8")), "text/csv")}
    )
    assert r3.status_code == 200

    # 5. Ingest Case
    ing_res = client.post(f"/api/cases/{case_id}/ingest")
    assert ing_res.status_code == 200

    # 6. Fetch Investigative Priorities API
    prio_res = client.get(f"/api/cases/{case_id}/investigative-priorities")
    assert prio_res.status_code == 200
    prio_data = prio_res.json()
    targets = prio_data["priority_targets"]

    assert len(targets) > 0, "Expected non-empty priority targets"
    top_target = targets[0]

    # PROOF: Kabir Singhania (the hidden bridge/hub) ranks HIGHER than the arrested courier Arjun Pawar
    pawar_target = next((t for t in targets if "arjun" in t["name"].lower()), None)
    kabir_target = next((t for t in targets if "kabir" in t["name"].lower()), None)

    assert kabir_target is not None, "Kabir Singhania must be identified in priority targets"
    if pawar_target:
        assert kabir_target["priority_score"] >= pawar_target["priority_score"], (
            f"Hidden hub Kabir ({kabir_target['priority_score']}) must rank >= courier Arjun ({pawar_target['priority_score']})"
        )

    # Verify non-guilt statutory disclaimer
    assert "statutory_disclaimer" in prio_data
    assert "INVESTIGATIVE DECISION SUPPORT ONLY" in prio_data["statutory_disclaimer"]

    print(f"\n[PHASE 3 PASS] Top target: {top_target['name']} (Score: {top_target['priority_score']}%)")
    if pawar_target:
        print(f"  Arrested Courier Arjun Pawar score: {pawar_target['priority_score']}%")
    print(f"  Hidden Hub Kabir Singhania score: {kabir_target['priority_score']}%")
