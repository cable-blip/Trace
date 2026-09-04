"""
Synthetic Data Generator for Antigravity Criminal Network Analysis System
Generates realistic fictional FIRs, CDRs, financial records, surveillance logs,
and a ground_truth.json file with planted network patterns.
"""

import json
import os
import random
from datetime import datetime, timedelta

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DOCS_DIR = os.path.join(DATA_DIR, "synthetic_case_nexus")
GROUND_TRUTH_FILE = os.path.join(DATA_DIR, "ground_truth.json")

os.makedirs(OUT_DOCS_DIR, exist_ok=True)

# Planted Ground Truth Entities & Connections
PLANTED_ENTITIES = {
    "cluster_a": ["Devendra Sharma (devendra_001)", "Ramesh Kumar (ramesh_002)", "Suresh Patil (suresh_003)"],
    "cluster_b": ["Tariq Ahmed (tariq_201)", "Imran Khan (imran_202)", "Zaid Sheikh (zaid_203)"],
    "bridge_entity": "Victor Vance (victor_999)",
    "key_location": "Warehouse 17, Nhava Sheva (warehouse_17)",
    "bridge_phone": "+91-98200-99999",
    "key_vehicle": "MH-04-AB-1234"
}

def generate_synthetic_dataset():
    random.seed(42)
    timestamp_base = datetime(2026, 4, 1, 10, 0, 0)

    documents = []

    # 1. FIR 019 - Operation Nexus Primary Complaint
    fir_019 = f"""
FIRST INFORMATION REPORT (FIR)
FIR No: 019/2026
Station: Crime Branch Zone 4, Mumbai
Date: 2026-04-02 11:30:00

Subject: Illegal Goods Smuggling & Money Laundering Network

Summary:
During intelligence surveillance under Operation Nexus, suspect Devendra Sharma (Phone: +91-98200-11111) was observed contacting Ramesh Kumar (Phone: +91-98200-22222) regarding contraband shipments. Devendra Sharma operates out of Location: Dockyard Road Office, Mumbai. Suspect Ramesh Kumar registered Vehicle: MH-04-AB-1234 to transport goods to Suresh Patil (Phone: +91-98200-33333).

Financial intelligence indicates Devendra Sharma transferred INR 15,00,000 to Account: ACC-987654 (HDFC Bank).
"""
    documents.append(("fir_019.txt", fir_019, "FIR"))

    # 2. CDR 029 - Call Detail Log
    cdr_rows = [
        "timestamp,caller_phone,receiver_phone,duration_sec,cell_tower",
        f"{(timestamp_base + timedelta(hours=2)).isoformat()},+91-98200-11111,+91-98200-22222,185,Tower_Dockyard_01",
        f"{(timestamp_base + timedelta(hours=5)).isoformat()},+91-98200-22222,+91-98200-33333,94,Tower_Dockyard_02",
        f"{(timestamp_base + timedelta(hours=14)).isoformat()},+91-98200-11111,+91-98200-99999,312,Tower_Central_09",
        f"{(timestamp_base + timedelta(hours=24)).isoformat()},+91-98200-99999,+91-98200-88888,205,Tower_NhavaSheva_17",
        f"{(timestamp_base + timedelta(hours=28)).isoformat()},+91-98200-88888,+91-98200-77777,140,Tower_NhavaSheva_17",
    ]
    documents.append(("cdr_029.csv", "\n".join(cdr_rows), "CDR"))

    # 3. Bank Transactions 044
    trx_json = [
        {
            "transaction_id": "TXN_1001",
            "timestamp": (timestamp_base + timedelta(hours=10)).isoformat(),
            "source_account": "ACC-987654",
            "source_name": "Devendra Sharma",
            "target_account": "ACC-555999",
            "target_name": "Victor Vance",
            "amount": 2500000.0,
            "currency": "INR",
            "remarks": "Consulting Fee - Nexus Clearance"
        },
        {
            "transaction_id": "TXN_1002",
            "timestamp": (timestamp_base + timedelta(hours=30)).isoformat(),
            "source_account": "ACC-555999",
            "source_name": "Victor Vance",
            "target_account": "ACC-777201",
            "target_name": "Tariq Ahmed",
            "amount": 1800000.0,
            "currency": "INR",
            "remarks": "Logistics Disbursement"
        }
    ]
    documents.append(("transactions_044.json", json.dumps(trx_json, indent=2), "TRANSACTION"))

    # 4. Surveillance Report 088
    surveillance_088 = f"""
SURVEILLANCE INTELLIGENCE REPORT
Doc ID: SURV-088
Date: 2026-04-04 18:45:00

Field Agent Notes:
On 2026-04-04 at 16:00 hrs, subject Victor Vance (Phone: +91-98200-99999) arrived at Warehouse 17, Nhava Sheva driving vehicle MH-04-AB-1234. 
At 16:30 hrs, Victor Vance held a meeting inside Warehouse 17 with Tariq Ahmed (Phone: +91-98200-88888) and Imran Khan (Phone: +91-98200-77777). 
Tariq Ahmed manages Organization: Apex Global Logistics operating out of Warehouse 17, Nhava Sheva. 

Conclusion:
Victor Vance acts as the key coordinating node (bridge) linking Devendra Sharma's syndicate with Tariq Ahmed's distribution group.
"""
    documents.append(("surveillance_088.txt", surveillance_088, "SURVEILLANCE"))

    # Write documents to output folder
    for filename, content, doc_type in documents:
        filepath = os.path.join(OUT_DOCS_DIR, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Generated synthetic document: {filename} ({doc_type})")

    # Generate Ground Truth File
    ground_truth = {
        "case_id": "CASE-NEXUS-001",
        "case_name": "Operation Nexus",
        "planted_findings": {
            "cluster_a": ["Devendra Sharma", "Ramesh Kumar", "Suresh Patil"],
            "cluster_b": ["Tariq Ahmed", "Imran Khan", "Zaid Sheikh"],
            "bridge_entity": {
                "name": "Victor Vance",
                "phone": "+91-98200-99999",
                "role": "Bridge node connecting Cluster A and Cluster B"
            },
            "key_location": "Warehouse 17, Nhava Sheva",
            "multi_hop_path": [
                "Devendra Sharma",
                "Victor Vance",
                "Warehouse 17, Nhava Sheva",
                "Tariq Ahmed"
            ],
            "key_vehicle": "MH-04-AB-1234"
        },
        "documents": [d[0] for d in documents]
    }

    with open(GROUND_TRUTH_FILE, "w", encoding="utf-8") as f:
        json.dump(ground_truth, f, indent=2)
    print(f"Generated ground truth specification at: {GROUND_TRUTH_FILE}")

if __name__ == "__main__":
    generate_synthetic_dataset()
