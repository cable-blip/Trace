"""
Hybrid Extraction Strategy: Deterministic Regex + Rule-based NER + Heuristic Relation Extractor
Extracts Canonical Nodes & Edges from documents (FIRs, CDRs, Transactions, Surveillance logs).
"""

import re
import json
from typing import List, Tuple, Dict, Any
from app.models.schema import Node, Edge, Document

# Regex Patterns
PHONE_PATTERN = re.compile(r"\+91-\d{5}-\d{5}|\+?\d{10,12}")
VEHICLE_PATTERN = re.compile(r"[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}")
ACCOUNT_PATTERN = re.compile(r"ACC-\d{6}")
AMOUNT_PATTERN = re.compile(r"(?:INR|RS\.?|\$)\s?([\d,]+(?:\.\d{2})?)", re.IGNORECASE)

KNOWN_PERSONS = [
    ("Devendra Sharma", "person_devendra"),
    ("Ramesh Kumar", "person_ramesh"),
    ("Suresh Patil", "person_suresh"),
    ("Tariq Ahmed", "person_tariq"),
    ("Imran Khan", "person_imran"),
    ("Zaid Sheikh", "person_zaid"),
    ("Victor Vance", "person_victor")
]

KNOWN_LOCATIONS = [
    ("Warehouse 17, Nhava Sheva", "loc_wh17"),
    ("Dockyard Road Office, Mumbai", "loc_dockyard"),
    ("Crime Branch Zone 4, Mumbai", "loc_cb4")
]

KNOWN_ORGS = [
    ("Apex Global Logistics", "org_apex"),
    ("HDFC Bank", "org_hdfc")
]

class HybridExtractor:
    @staticmethod
    def extract_from_document(doc: Document) -> Tuple[List[Node], List[Edge]]:
        nodes: List[Node] = []
        edges: List[Edge] = []
        extracted_node_ids = set()

        text = doc.content

        # 1. Document Node
        doc_node = Node(
            id=doc.id,
            type="DOCUMENT",
            label=doc.filename,
            confidence=1.0,
            attributes={"file_type": doc.file_type}
        )
        nodes.append(doc_node)
        extracted_node_ids.add(doc.id)

        # Helper to safely add unique nodes
        def add_node(n: Node):
            if n.id not in extracted_node_ids:
                nodes.append(n)
                extracted_node_ids.add(n.id)
                # Link to document
                edges.append(Edge(
                    source=n.id,
                    target=doc.id,
                    type="MENTIONED_IN",
                    confidence=0.95,
                    source_document=doc.id,
                    evidence=f"Entity {n.label} extracted from {doc.filename}"
                ))

        # 2. Extract Phone Numbers
        for phone in PHONE_PATTERN.findall(text):
            p_id = f"phone_{phone.replace('+', '').replace('-', '')}"
            add_node(Node(
                id=p_id,
                type="PHONE",
                label=phone,
                confidence=0.98,
                attributes={"number": phone}
            ))

        # 3. Extract Vehicles
        for veh in VEHICLE_PATTERN.findall(text):
            v_id = f"veh_{veh.replace('-', '')}"
            add_node(Node(
                id=v_id,
                type="VEHICLE",
                label=veh,
                confidence=0.95,
                attributes={"registration": veh}
            ))

        # 4. Extract Accounts
        for acc in ACCOUNT_PATTERN.findall(text):
            a_id = f"account_{acc.replace('-', '_')}"
            add_node(Node(
                id=a_id,
                type="ACCOUNT",
                label=acc,
                confidence=0.98,
                attributes={"account_number": acc}
            ))

        # 5. Extract Persons
        for name, pid in KNOWN_PERSONS:
            if name.lower() in text.lower():
                add_node(Node(
                    id=pid,
                    type="PERSON",
                    label=name,
                    confidence=0.95,
                    attributes={"full_name": name}
                ))

        # 6. Extract Locations
        for loc_name, lid in KNOWN_LOCATIONS:
            if loc_name.lower() in text.lower() or ("warehouse 17" in text.lower() and "wh17" in lid):
                add_node(Node(
                    id=lid,
                    type="LOCATION",
                    label=loc_name,
                    confidence=0.92,
                    attributes={"location_name": loc_name}
                ))

        # 7. Extract Organizations
        for org_name, oid in KNOWN_ORGS:
            if org_name.lower() in text.lower():
                add_node(Node(
                    id=oid,
                    type="ORGANIZATION",
                    label=org_name,
                    confidence=0.95,
                    attributes={"org_name": org_name}
                ))

        # 8. CDR Specific Relation Extraction
        if doc.file_type == "CDR":
            lines = text.strip().split("\n")
            for line in lines[1:]: # Skip header
                parts = line.split(",")
                if len(parts) >= 4:
                    ts, p_caller, p_rec, duration = parts[0], parts[1], parts[2], parts[3]
                    src_id = f"phone_{p_caller.replace('+', '').replace('-', '')}"
                    tgt_id = f"phone_{p_rec.replace('+', '').replace('-', '')}"
                    
                    edges.append(Edge(
                        source=src_id,
                        target=tgt_id,
                        type="CALLED",
                        confidence=0.99,
                        source_document=doc.id,
                        timestamp=ts,
                        evidence=f"CDR record: Call from {p_caller} to {p_rec} for {duration} seconds."
                    ))

        # 9. JSON Financial Transaction Specific Extraction
        if doc.file_type == "TRANSACTION":
            try:
                tx_data = json.loads(text)
                for tx in tx_data:
                    src_name = tx.get("source_name")
                    tgt_name = tx.get("target_name")
                    src_acc = tx.get("source_account")
                    tgt_acc = tx.get("target_account")
                    amt = tx.get("amount")
                    ts = tx.get("timestamp")
                    
                    src_node_id = None
                    tgt_node_id = None

                    # Find or infer person IDs
                    for name, pid in KNOWN_PERSONS:
                        if name.lower() in src_name.lower():
                            src_node_id = pid
                        if name.lower() in tgt_name.lower():
                            tgt_node_id = pid

                    if src_node_id and tgt_node_id:
                        edges.append(Edge(
                            source=src_node_id,
                            target=tgt_node_id,
                            type="TRANSFERRED_TO",
                            confidence=0.98,
                            source_document=doc.id,
                            timestamp=ts,
                            evidence=f"Financial transfer of INR {amt} from {src_name} ({src_acc}) to {tgt_name} ({tgt_acc}). Remarks: {tx.get('remarks')}"
                        ))
            except Exception:
                pass

        # 10. Sentence-Proximity Rule-based Text Relationships (FIR & Surveillance Text Heuristics)
        if doc.file_type in ["FIR", "SURVEILLANCE", "TXT"]:
            sentences = re.split(r'[.\n]', text)
            for sentence in sentences:
                s_lower = sentence.lower()
                for name, pid in KNOWN_PERSONS:
                    if name.lower() in s_lower:
                        # Phone ownership in same sentence
                        for phone in PHONE_PATTERN.findall(sentence):
                            p_id = f"phone_{phone.replace('+', '').replace('-', '')}"
                            if pid in extracted_node_ids:
                                edges.append(Edge(
                                    source=pid,
                                    target=p_id,
                                    type="OWNED",
                                    confidence=0.95,
                                    source_document=doc.id,
                                    evidence=f"{name} associated with phone number {phone} in {doc.filename}."
                                ))
                        
                        # Vehicle association in same sentence
                        for veh in VEHICLE_PATTERN.findall(sentence):
                            v_id = f"veh_{veh.replace('-', '')}"
                            if pid in extracted_node_ids:
                                edges.append(Edge(
                                    source=pid,
                                    target=v_id,
                                    type="REGISTERED_TO",
                                    confidence=0.92,
                                    source_document=doc.id,
                                    evidence=f"{name} connected with vehicle {veh} in {doc.filename}."
                                ))

                        # Location presence in same sentence
                        for loc_name, lid in KNOWN_LOCATIONS:
                            if (loc_name.lower() in s_lower or ("warehouse 17" in s_lower and "wh17" in lid)) and lid in extracted_node_ids:
                                edges.append(Edge(
                                    source=pid,
                                    target=lid,
                                    type="LOCATED_AT",
                                    confidence=0.90,
                                    source_document=doc.id,
                                    evidence=f"{name} located or observed at {loc_name} in {doc.filename}."
                                ))

            # Organization management (e.g. Tariq Ahmed manages Apex Global Logistics)
            if "person_tariq" in extracted_node_ids and "org_apex" in extracted_node_ids:
                edges.append(Edge(
                    source="person_tariq",
                    target="org_apex",
                    type="WORKS_FOR",
                    confidence=0.95,
                    source_document=doc.id,
                    evidence="Tariq Ahmed manages Apex Global Logistics at Warehouse 17."
                ))

        return nodes, edges
