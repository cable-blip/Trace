"""
Central Training Data Generator (TRACE ML Architecture — Phase 1).
Provides unified, labeled synthetic datasets with guaranteed ground-truth
for all downstream models:
- Entity Resolution pairs (XGBoost binary classifier)
- Document Classification texts (TF-IDF + Logistic Regression)
- Investigative Priority benchmark graphs (XGBoost topological classifier)
- Transaction Anomaly detection (Isolation Forest)
- Threat Forecasting temporal sequences (Logistic Regression)
"""

import random
import re
import math
from typing import List, Dict, Any, Tuple
import networkx as nx

# ── Base Entities & Names Pool ─────────────────────────────────────────────
BASE_PERSON_NAMES = [
    "Devendra Sharma", "Victor Vance", "Tariq Ahmed", "Ramesh Kumar",
    "Suresh Patil", "Imran Mansoori", "Zaid Sheikh", "Kabir Singhania",
    "Sameer Merchant", "Rahul Varma", "Pooja Shah", "Vikram Malhotra",
    "Amit Verma", "Rajesh Sharma", "Sunil Deshmukh", "Farhan Qureshi",
    "Arjun Kapoor", "Mehul Choksi", "Nitin Gadve", "Sanjay Dutt"
]

SPELLING_MUTATIONS = [
    lambda n: n.replace("a", "e"),
    lambda n: n.replace("ee", "i"),
    lambda n: n.replace("i", "ee"),
    lambda n: n.replace("sh", "s"),
    lambda n: n.replace("v", "w"),
    lambda n: n.replace("ou", "u"),
    lambda n: n.split()[0] + " " + n.split()[-1][0] + "." if len(n.split()) > 1 else n,
    lambda n: n.split()[0][0] + ". " + n.split()[-1] if len(n.split()) > 1 else n,
    lambda n: n.replace("Kumar", "K.").replace("Sharma", "S.").replace("Patil", "P."),
    lambda n: n.lower(),
    lambda n: n.upper(),
    lambda n: n + " (Alias)"
]


# ── 1. Entity Resolution Dataset Generator ──────────────────────────────────
def generate_entity_resolution_data(n_samples: int = 240, seed: int = 42) -> List[Dict[str, Any]]:
    """
    Generates pairs of entity mentions with known binary ground truth:
    label=1: Same individual (varied spellings, nicknames, abbreviations, typos)
    label=0: Distinct individuals
    """
    rng = random.Random(seed)
    dataset = []

    half = n_samples // 2

    # Positive pairs (Same Person)
    for _ in range(half):
        base_name = rng.choice(BASE_PERSON_NAMES)
        mutator = rng.choice(SPELLING_MUTATIONS)
        mention_a = base_name
        mention_b = mutator(base_name)
        if mention_b == mention_a:
            mention_b = mention_a.replace("a", "aa")

        has_shared_phone = rng.random() > 0.4
        phone_a = f"+91-{rng.randint(90000, 99999)}-{rng.randint(10000, 99999)}"
        phone_b = phone_a if has_shared_phone else f"+91-{rng.randint(90000, 99999)}-{rng.randint(10000, 99999)}"

        has_shared_account = rng.random() > 0.5
        acc_a = f"ACC-{rng.randint(100000, 999999)}"
        acc_b = acc_a if has_shared_account else f"ACC-{rng.randint(100000, 999999)}"

        doc_co_occurrence = rng.randint(1, 5)

        dataset.append({
            "entity_a": mention_a,
            "entity_b": mention_b,
            "phone_a": phone_a,
            "phone_b": phone_b,
            "account_a": acc_a,
            "account_b": acc_b,
            "doc_co_occurrence": doc_co_occurrence,
            "label": 1
        })

    # Negative pairs (Different Persons)
    for _ in range(half):
        p1, p2 = rng.sample(BASE_PERSON_NAMES, 2)
        has_shared_phone = rng.random() < 0.05  # Rare false collision
        phone_a = f"+91-{rng.randint(90000, 99999)}-{rng.randint(10000, 99999)}"
        phone_b = phone_a if has_shared_phone else f"+91-{rng.randint(90000, 99999)}-{rng.randint(10000, 99999)}"

        has_shared_account = rng.random() < 0.05
        acc_a = f"ACC-{rng.randint(100000, 999999)}"
        acc_b = acc_a if has_shared_account else f"ACC-{rng.randint(100000, 999999)}"

        doc_co_occurrence = rng.randint(0, 2)

        dataset.append({
            "entity_a": p1,
            "entity_b": p2,
            "phone_a": phone_a,
            "phone_b": phone_b,
            "account_a": acc_a,
            "account_b": acc_b,
            "doc_co_occurrence": doc_co_occurrence,
            "label": 0
        })

    rng.shuffle(dataset)
    return dataset


# ── 2. Document Classification Dataset Generator ────────────────────────────
def generate_document_classification_data(n_samples: int = 300, seed: int = 42) -> List[Dict[str, str]]:
    """
    Generates realistic texts labeled by intelligence document category:
    - LEGAL_FIR_REPORT
    - CDR_TELECOM
    - FINANCIAL_LEDGER
    - SURVEILLANCE_LOG
    """
    rng = random.Random(seed)
    dataset = []

    samples_per_class = n_samples // 4

    # 1. LEGAL_FIR_REPORT
    for i in range(samples_per_class):
        fir_no = f"{rng.randint(10, 999)}/{rng.randint(2023, 2026)}"
        station = rng.choice(["Crime Branch Zone 4, Mumbai", "Special Cell, Lodhi Colony, New Delhi", "Cyber Police Station, BKC", "Anti-Terror Squad, Pune"])
        sections = rng.choice(["Section 120-B, 420 IPC and Section 66D IT Act", "Section 111 BNS, Section 302 IPC, Section 25 Arms Act", "Section 3 & 4 PMLA, Section 409, 467, 471 IPC"])
        accused = rng.choice(BASE_PERSON_NAMES)
        complainant = rng.choice(["Inspector S. R. Patil", "Sub-Inspector V. K. Deshmukh", "Nodal Officer RBI Cyber Cell", "Customs Preventive Commissionerate"])
        text = f"""FIRST INFORMATION REPORT (FIR) Under Section 154 CrPC / Sec 173 BNSS.
FIR No: {fir_no}
Police Station: {station}
Date & Time of Registration: 2026-04-12 10:30:00
Complainant / Informant: {complainant}
Accused Person: {accused}
Acts and Sections: {sections}
Subject: Investigation into syndicate activities, fraudulent identity proliferation and illegal procurement.
Brief Narrative of Incident: Intelligence surveillance intercepted illegal communications. Accused {accused} was found coordinating logistics and warrants were filed.
Chargesheet status: Preliminary investigation underway."""
        dataset.append({"text": text, "label": "LEGAL_FIR_REPORT"})

    # 2. CDR_TELECOM
    for i in range(samples_per_class):
        headers = rng.choice([
            "timestamp,caller_phone,receiver_phone,duration_sec,cell_tower,call_type",
            "call_date,calling_party,called_party,duration,tower_id,imei",
            "datetime,msisdn_a,msisdn_b,call_duration_seconds,site_id,first_cell"
        ])
        rows = []
        for _ in range(rng.randint(4, 8)):
            p1 = f"+9198{rng.randint(10000000, 99999999)}"
            p2 = f"+9198{rng.randint(10000000, 99999999)}"
            dur = rng.randint(10, 600)
            tower = rng.choice(["Tower_Docks_01", "Tower_Central_04", "Tower_Airport_09", "Tower_Highway_11"])
            rows.append(f"2026-04-10T12:{rng.randint(10, 59)}:00,{p1},{p2},{dur},{tower},VOICE")
        text = headers + "\n" + "\n".join(rows)
        dataset.append({"text": text, "label": "CDR_TELECOM"})

    # 3. FINANCIAL_LEDGER
    for i in range(samples_per_class):
        headers = rng.choice([
            "transaction_id,timestamp,source_account,target_account,amount,currency,remarks",
            "txn_ref,date,debit_acc,credit_acc,amount_inr,mode,narration",
            "tx_hash,datetime,from_account,to_account,val,currency,purpose"
        ])
        rows = []
        for _ in range(rng.randint(4, 7)):
            tx_id = f"TXN_{rng.randint(10000, 99999)}"
            src = f"ACC_{rng.randint(100000, 999999)}"
            tgt = f"ACC_{rng.randint(100000, 999999)}"
            amt = rng.randint(50000, 5000000)
            rem = rng.choice(["Consulting fee", "Vendor invoice settlement", "Hawala settlement", "Cash withdrawal layer", "Disbursement"])
            rows.append(f"{tx_id},2026-04-05T{rng.randint(10, 22)}:00:00,{src},{tgt},{amt},INR,{rem}")
        text = headers + "\n" + "\n".join(rows)
        dataset.append({"text": text, "label": "FINANCIAL_LEDGER"})

    # 4. SURVEILLANCE_LOG
    for i in range(samples_per_class):
        subject = rng.choice(BASE_PERSON_NAMES)
        loc = rng.choice(["Warehouse 17, Nhava Sheva", "Dockyard Road Safehouse", "Hotel Transit Terminal, Aerocity", "Panvel Toll Plaza"])
        vehicle = f"MH-{rng.randint(1, 14):02d}-AB-{rng.randint(1000, 9999)}"
        text = f"""SURVEILLANCE & SPOT OBSERVATION REPORT
Document ID: SURV-LOG-{rng.randint(100, 999)}
Location: {loc}
Date: 2026-04-08 17:30:00
Target Observed: {subject}
Vehicle Identified: {vehicle}
Field Operational Notes:
At 16:45 hours, field reconnaissance team spotted subject {subject} arriving at {loc} operating vehicle {vehicle}.
The target was observed entering the facility and holding a private meeting with undisclosed associates.
Visual surveillance confirms material handover of suspicious packages before exiting towards highway.
Recommended Action: Maintain physical tail and verify perimeter CCTV logs."""
        dataset.append({"text": text, "label": "SURVEILLANCE_LOG"})

    rng.shuffle(dataset)
    return dataset


# ── 3. Investigative Priority Network Generator ─────────────────────────────
def generate_priority_training_cases(n_cases: int = 15, seed: int = 42) -> List[Dict[str, Any]]:
    """
    Generates synthetic case graphs with known planted 'masterminds':
    The mastermind node:
    - Sits at the structural intersection of communication & financial layers (high betweenness).
    - Bridges 2+ distinct operational clusters.
    - Appears in multiple corroborating source documents.
    Mastermind = label 1 (High Priority Target)
    Peripheral suspects = label 0 (Standard/Low Priority)
    """
    rng = random.Random(seed)
    cases = []

    for c_idx in range(n_cases):
        G = nx.Graph()
        case_id = f"SYN-CASE-{c_idx+1:03d}"
        
        # Pick 5-8 persons
        case_persons = rng.sample(BASE_PERSON_NAMES, rng.randint(6, 9))
        mastermind = case_persons[0] # Planted mastermind

        # Cluster A & Cluster B
        mid = len(case_persons) // 2
        cluster_a = case_persons[1:mid]
        cluster_b = case_persons[mid:]

        # Add Person Nodes
        for p in case_persons:
            G.add_node(p, type="PERSON", label=p)

        # Internal edges within Cluster A
        for i in range(len(cluster_a) - 1):
            G.add_edge(cluster_a[i], cluster_a[i+1], type="CALLED", source_document="cdr_log_01.csv")

        # Internal edges within Cluster B
        for i in range(len(cluster_b) - 1):
            G.add_edge(cluster_b[i], cluster_b[i+1], type="CALLED", source_document="cdr_log_02.csv")

        # Mastermind bridges BOTH clusters and handles financial & communications
        for a in cluster_a:
            G.add_edge(mastermind, a, type="TRANSFERRED_TO", source_document="bank_ledger.csv")
        for b in cluster_b:
            G.add_edge(mastermind, b, type="CALLED", source_document="surveillance_rpt.txt")

        # Extra peripheral entities
        acc = f"ACC_{rng.randint(100, 999)}"
        phone = f"+9198{rng.randint(10000000, 99999999)}"
        G.add_node(acc, type="ACCOUNT", label=acc)
        G.add_node(phone, type="PHONE", label=phone)
        G.add_edge(mastermind, acc, type="OWNS", source_document="bank_ledger.csv")
        G.add_edge(mastermind, phone, type="USES", source_document="fir_complaint.txt")

        # Compute ground truth labels for persons
        person_labels = {p: (1 if p == mastermind else 0) for p in case_persons}

        cases.append({
            "case_id": case_id,
            "graph": G,
            "mastermind": mastermind,
            "person_labels": person_labels
        })

    return cases


# ── 4. Transaction Anomaly Data Generator ───────────────────────────────────
def generate_transaction_anomaly_data(n_samples: int = 200, seed: int = 42) -> List[Dict[str, Any]]:
    """
    Generates transaction feature vectors for training / testing Isolation Forest:
    Features: [amount, tx_hour, daily_frequency, velocity_z_score, is_off_hours]
    Label: -1 (anomaly), 1 (normal)
    """
    rng = random.Random(seed)
    data = []

    # 85% normal transactions
    normal_count = int(n_samples * 0.85)
    for _ in range(normal_count):
        amount = rng.gauss(50000, 15000)
        amount = max(500, min(amount, 150000))
        tx_hour = rng.randint(9, 18) # Business hours
        freq = rng.randint(1, 4)
        z_score = rng.uniform(-1.0, 1.0)
        is_off_hours = 0
        data.append({
            "features": [amount, tx_hour, freq, z_score, is_off_hours],
            "label": 1
        })

    # 15% anomalous transactions (Hawala smurfing, late-night high-value bursts)
    anomaly_count = n_samples - normal_count
    for _ in range(anomaly_count):
        amount = rng.choice([rng.uniform(2000000, 10000000), rng.uniform(49000, 49999)]) # Layered smurfs or huge wire
        tx_hour = rng.choice([1, 2, 3, 4, 23]) # Dead of night
        freq = rng.randint(12, 45) # Extreme velocity burst
        z_score = rng.uniform(3.5, 7.0)
        is_off_hours = 1
        data.append({
            "features": [amount, tx_hour, freq, z_score, is_off_hours],
            "label": -1
        })

    rng.shuffle(data)
    return data


# ── 5. Threat Forecasting Temporal Data Generator ───────────────────────────
def generate_threat_temporal_data(n_samples: int = 200, seed: int = 42) -> List[Dict[str, Any]]:
    """
    Generates temporal activity features and escalation danger labels:
    Features: [call_burst_freq, financial_surge_ratio, hours_since_last_action, cross_channel_hop_count]
    Label: 1 (Imminent flight / terminal evasion), 0 (Dormant / stable)
    """
    rng = random.Random(seed)
    data = []

    for _ in range(n_samples):
        is_threat = rng.random() > 0.5
        if is_threat:
            # Escalation signals: High call burst, sudden financial surge, recent activity, multiple channel hops
            call_burst = rng.uniform(10.0, 35.0)
            fin_surge = rng.uniform(2.5, 8.0)
            recency_hours = rng.uniform(0.5, 4.0)
            channel_hops = rng.randint(3, 7)
            label = 1
        else:
            # Low activity: low burst, normal finance, high elapsed time, single channel
            call_burst = rng.uniform(0.0, 4.0)
            fin_surge = rng.uniform(0.1, 1.2)
            recency_hours = rng.uniform(12.0, 72.0)
            channel_hops = rng.randint(0, 2)
            label = 0

        data.append({
            "features": [call_burst, fin_surge, recency_hours, channel_hops],
            "label": label
        })

    rng.shuffle(data)
    return data
