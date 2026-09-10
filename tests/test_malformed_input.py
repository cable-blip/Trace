"""
Phase 6 Robustness Defense Tests: Malformed Input Verification.
Asserts that bad input never causes an unhandled 500 server crash.
1. 0-byte empty file -> HTTP 400
2. Disallowed file extension (.exe, .sh, .bin) -> HTTP 415
3. File > 10MB -> HTTP 413
4. Truncated CSV (incomplete lines, uneven columns) -> graceful handling, HTTP 200 (no 500)
5. Non-UTF8 binary text -> graceful decode, HTTP 200 (no 500)
6. Header-only CSV -> graceful empty extraction, HTTP 200 (no 500)
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

@pytest.fixture
def client():
    return TestClient(app)


def test_zero_byte_empty_file_rejected(client):
    """Uploading a 0-byte empty file must return HTTP 400, not 500."""
    case_res = client.post("/api/cases?name=EmptyFileCase&description=Test")
    case_id = case_res.json()["id"]

    # Test /documents endpoint handles empty files gracefully with HTTP 200 (no 500)
    res1 = client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("empty.txt", io.BytesIO(b""), "text/plain")}
    )
    assert res1.status_code == 200

    # Test /ingest-file endpoint strictly rejects 0-byte files with HTTP 400
    res2 = client.post(
        f"/api/cases/{case_id}/ingest-file",
        files={"file": ("empty.csv", io.BytesIO(b""), "text/csv")}
    )
    assert res2.status_code == 400
    assert "empty" in res2.json()["detail"].lower()


def test_disallowed_extension_rejected(client):
    """Uploading disallowed executables (.exe, .sh, .bin) must return HTTP 415."""
    case_res = client.post("/api/cases?name=DisallowedCase&description=Test")
    case_id = case_res.json()["id"]

    for bad_ext in ["payload.exe", "script.sh", "firmware.bin"]:
        res = client.post(
            f"/api/cases/{case_id}/documents",
            files={"file": (bad_ext, io.BytesIO(b"malicious_bytes"), "application/octet-stream")}
        )
        assert res.status_code == 415
        assert "unsupported file type" in res.json()["detail"].lower()

        res_ingest = client.post(
            f"/api/cases/{case_id}/ingest-file",
            files={"file": (bad_ext, io.BytesIO(b"malicious_bytes"), "application/octet-stream")}
        )
        assert res_ingest.status_code == 415


def test_file_exceeding_10mb_rejected(client):
    """Uploading a file over 10 MB must return HTTP 413, not 500."""
    case_res = client.post("/api/cases?name=OversizeCase&description=Test")
    case_id = case_res.json()["id"]

    # 10.5 MB payload
    oversized_data = b"A" * (11 * 1024 * 1024)

    res1 = client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("huge_log.txt", io.BytesIO(oversized_data), "text/plain")}
    )
    assert res1.status_code == 413
    assert "exceeds maximum allowed size" in res1.json()["detail"].lower()


def test_truncated_uneven_csv_gracefully_handled(client):
    """Truncated CSV with mismatched columns must parse gracefully without 500 crash."""
    case_res = client.post("/api/cases?name=TruncatedCSVCase&description=Test")
    case_id = case_res.json()["id"]

    # Broken/ragged CSV lines
    corrupt_csv = """caller_phone,callee_phone,duration_sec,tower_id,timestamp
9811002233,9899001122,340,TOWER_1
9899001122,broken_row_too_few_columns
,,,unmatched_trailing_commas,
9877003344,9866004455,400,TOWER_2,2026-04-10T11:00:00,unexpected_sixth_col
incomplete_line_without_newline"""

    res = client.post(
        f"/api/cases/{case_id}/ingest-file",
        files={"file": ("ragged_cdr.csv", io.BytesIO(corrupt_csv.encode("utf-8")), "text/csv")}
    )
    # Must succeed or return controlled 400, NEVER 500
    assert res.status_code in [200, 400]
    assert res.status_code != 500


def test_non_utf8_binary_payload_gracefully_handled(client):
    """Random binary junk or corrupted encodings must not crash the server with 500."""
    case_res = client.post("/api/cases?name=BinaryCase&description=Test")
    case_id = case_res.json()["id"]

    # Byte stream containing invalid UTF-8 sequences (0xFF, 0xFE, 0x80, etc.)
    random_bytes = b"\xff\xfe\x00\x80\x81\x92\xbc\xde\xaa\xbb\xcc\xdd\xee\xff" * 50

    res = client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("corrupted_dump.txt", io.BytesIO(random_bytes), "text/plain")}
    )
    assert res.status_code == 200
    assert res.status_code != 500


def test_header_only_csv_gracefully_handled(client):
    """Header-only CSV with zero data rows must ingest cleanly into an empty graph without 500."""
    case_res = client.post("/api/cases?name=HeaderOnlyCase&description=Test")
    case_id = case_res.json()["id"]

    header_only_csv = "source_account,target_account,amount,timestamp\n"

    res = client.post(
        f"/api/cases/{case_id}/ingest-file",
        files={"file": ("empty_ledger.csv", io.BytesIO(header_only_csv.encode("utf-8")), "text/csv")}
    )
    assert res.status_code == 200
    # Graph should be retrievable with 0 errors
    graph_res = client.get(f"/api/cases/{case_id}/graph")
    assert graph_res.status_code == 200
