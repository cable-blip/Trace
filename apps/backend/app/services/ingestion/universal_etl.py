"""
Universal Multi-Modal ETL & Entity Extraction Engine for Antigravity Criminal Intelligence Platform.
Handles CDRs, SWIFT Wires, ANPR Toll logs, FIR transcripts, and Biometric DNA forensics.
"""

import os
import re
import csv
import json
import io
from typing import List, Tuple, Dict, Any, Optional
from datetime import datetime, timezone
from app.models.schema import Node, Edge, Document
from app.services.extraction.entity_resolver import EntityResolver

# ── Generic Regex Taxonomy ───────────────────────────────────────────────────
PHONE_REGEX = re.compile(r"(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}|\b\d{10,12}\b")
PLATE_REGEX = re.compile(r"\b[A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{1,3}[-\s]?\d{4}\b")
ACCOUNT_REGEX = re.compile(r"\b(?:ACC|SWIFT|IBAN|VAULT|TOKEN)[-_][A-Z0-9]{4,16}\b|\b\d{9,18}\b")
CRYPTO_REGEX = re.compile(r"\b(?:0x[a-fA-F0-9]{40}|1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59}|4[0-9AB][1-9A-HJ-NP-Za-km-z]{93})\b")
AMOUNT_REGEX = re.compile(r"(?:INR|RS\.?|\$|EUR|AED)\s?([\d,]+(?:\.\d{2})?)", re.IGNORECASE)
LEGAL_SECTION_REGEX = re.compile(r"\b(?:SEC(?:TION)?\.?\s?\d+[A-Z]?\s?(?:IPC|BNS|NDPS|UAPA|PMLA|CRPC))\b", re.IGNORECASE)
GPS_REGEX = re.compile(r"(-?\d{1,2}\.\d{3,7})[,\s]+(-?\d{1,3}\.\d{3,7})")

class UniversalETLEngine:
    @staticmethod
    def detect_file_type(filename: str, content: str) -> str:
        """Heuristically detects the intelligence format of an ingested document."""
        lower_fn = filename.lower()
        lower_c = content[:1500].lower()

        # 1. Structured CSV Formats
        if lower_fn.endswith('.csv'):
            if 'caller' in lower_c or 'msisdn' in lower_c or 'duration' in lower_c or 'cell_tower' in lower_c:
                return "CDR_TELECOM"
            elif 'toll' in lower_c or 'plate' in lower_c:
                return "ANPR_SURVEILLANCE"
            else:
                return "FINANCIAL_LEDGER"

        # 2. Structured JSON Formats
        if lower_fn.endswith('.json'):
            return "FINANCIAL_LEDGER"

        # 3. Text Reports & Narratives (.txt, .pdf, .docx, FIRs)
        if 'fir' in lower_c or 'police station' in lower_c or 'chargesheet' in lower_c or 'investigation' in lower_c:
            return "LEGAL_FIR_REPORT"
        elif 'anpr' in lower_c and 'plate' in lower_c:
            return "ANPR_SURVEILLANCE"
        else:
            return "GENERIC_INTELLIGENCE"

    @classmethod
    def process_document(cls, doc: Document) -> Tuple[List[Node], List[Edge]]:
        """Processes document content and returns extracted, deduplicated nodes and edges."""
        file_type = cls.detect_file_type(doc.filename, doc.content)
        
        if file_type == "CDR_TELECOM":
            return cls._parse_cdr_csv(doc)
        elif file_type == "FINANCIAL_LEDGER":
            return cls._parse_financial_ledger(doc)
        elif file_type == "ANPR_SURVEILLANCE":
            return cls._parse_anpr_logs(doc)
        else:
            return cls._parse_text_intelligence(doc)

    @classmethod
    def _parse_cdr_csv(cls, doc: Document) -> Tuple[List[Node], List[Edge]]:
        nodes: List[Node] = []
        edges: List[Edge] = []
        node_map: Dict[str, Node] = {}

        # Add document parent node
        doc_node = Node(
            id=doc.id,
            type="DOCUMENT",
            label=doc.filename,
            confidence=1.0,
            attributes={"file_type": "CDR_TELECOM"}
        )
        nodes.append(doc_node)

        # Parse CSV line by line
        try:
            reader = csv.DictReader(io.StringIO(doc.content))
            for row in reader:
                caller = row.get("caller") or row.get("Caller") or row.get("source") or row.get("calling_number") or ""
                callee = row.get("callee") or row.get("Callee") or row.get("target") or row.get("called_number") or ""
                timestamp = row.get("timestamp") or row.get("Timestamp") or row.get("date_time") or datetime.now(timezone.utc).isoformat()
                duration = row.get("duration") or row.get("Duration") or "0"
                tower_id = row.get("cell_tower") or row.get("tower_id") or row.get("location") or ""
                imei = row.get("imei") or row.get("IMEI") or ""

                if caller:
                    c_id = f"phone_{re.sub(r'[^0-9]', '', caller)}"
                    if c_id not in node_map:
                        node_map[c_id] = Node(
                            id=c_id,
                            type="PHONE",
                            label=caller,
                            confidence=0.98,
                            attributes={"raw_number": caller, "imei": imei}
                        )
                if callee:
                    t_id = f"phone_{re.sub(r'[^0-9]', '', callee)}"
                    if t_id not in node_map:
                        node_map[t_id] = Node(
                            id=t_id,
                            type="PHONE",
                            label=callee,
                            confidence=0.98,
                            attributes={"raw_number": callee}
                        )

                # Connect caller -> callee
                if caller and callee:
                    edges.append(Edge(
                        source=f"phone_{re.sub(r'[^0-9]', '', caller)}",
                        target=f"phone_{re.sub(r'[^0-9]', '', callee)}",
                        type="CALLED",
                        confidence=0.97,
                        source_document=doc.filename,
                        timestamp=timestamp,
                        evidence=f"CDR Log: {duration}s call duration. Tower: {tower_id}",
                        attributes={"duration_seconds": duration, "cell_tower": tower_id}
                    ))

                # Add Cell Tower Location Node if present
                if tower_id:
                    loc_id = f"loc_tower_{re.sub(r'[^a-zA-Z0-9]', '_', tower_id.lower())}"
                    if loc_id not in node_map:
                        node_map[loc_id] = Node(
                            id=loc_id,
                            type="LOCATION",
                            label=f"Tower {tower_id}",
                            confidence=0.95,
                            attributes={"tower_code": tower_id}
                        )
                    if caller:
                        edges.append(Edge(
                            source=f"phone_{re.sub(r'[^0-9]', '', caller)}",
                            target=loc_id,
                            type="LOCATED_AT",
                            confidence=0.90,
                            source_document=doc.filename,
                            timestamp=timestamp,
                            evidence=f"Base Station Handshake: {tower_id}"
                        ))
        except Exception:
            # Fallback to regex text extraction if CSV header parsing fails
            return cls._parse_text_intelligence(doc)

        nodes.extend(node_map.values())
        return nodes, edges

    @classmethod
    def _parse_financial_ledger(cls, doc: Document) -> Tuple[List[Node], List[Edge]]:
        nodes: List[Node] = []
        edges: List[Edge] = []
        node_map: Dict[str, Node] = {}

        # Add document node
        nodes.append(Node(id=doc.id, type="DOCUMENT", label=doc.filename, confidence=1.0))

        # Try JSON or CSV parsing
        try:
            records = json.loads(doc.content)
            if isinstance(records, dict):
                records = [records]
        except Exception:
            try:
                reader = csv.DictReader(io.StringIO(doc.content))
                records = list(reader)
            except Exception:
                records = []

        if records:
            for rec in records:
                src_acc = rec.get("source_account") or rec.get("sender") or rec.get("from_account") or ""
                tgt_acc = rec.get("target_account") or rec.get("receiver") or rec.get("to_account") or ""
                amount = rec.get("amount") or rec.get("amount_inr") or rec.get("value") or "0"
                tx_type = rec.get("type") or rec.get("transfer_type") or "SWIFT_WIRE"
                timestamp = rec.get("timestamp") or datetime.now(timezone.utc).isoformat()
                bank_name = rec.get("bank") or rec.get("remittance_agency") or ""

                if src_acc:
                    s_id = f"account_{re.sub(r'[^a-zA-Z0-9]', '_', str(src_acc).lower())}"
                    if s_id not in node_map:
                        node_map[s_id] = Node(
                            id=s_id,
                            type="ACCOUNT",
                            label=f"ACC: {src_acc}",
                            confidence=0.99,
                            attributes={"bank": bank_name}
                        )

                if tgt_acc:
                    t_id = f"account_{re.sub(r'[^a-zA-Z0-9]', '_', str(tgt_acc).lower())}"
                    if t_id not in node_map:
                        node_map[t_id] = Node(
                            id=t_id,
                            type="ACCOUNT",
                            label=f"ACC: {tgt_acc}",
                            confidence=0.99,
                            attributes={"bank": bank_name}
                        )

                if src_acc and tgt_acc:
                    edges.append(Edge(
                        source=f"account_{re.sub(r'[^a-zA-Z0-9]', '_', str(src_acc).lower())}",
                        target=f"account_{re.sub(r'[^a-zA-Z0-9]', '_', str(tgt_acc).lower())}",
                        type="TRANSFERRED_TO",
                        confidence=0.99,
                        source_document=doc.filename,
                        timestamp=str(timestamp),
                        evidence=f"Ledger Wire: {tx_type} | INR {amount}",
                        attributes={"amount": amount, "tx_type": tx_type}
                    ))

            if len(node_map) > 0:
                nodes.extend(node_map.values())
                return nodes, edges

        return cls._parse_text_intelligence(doc)

    @classmethod
    def _parse_anpr_logs(cls, doc: Document) -> Tuple[List[Node], List[Edge]]:
        nodes: List[Node] = []
        edges: List[Edge] = []
        node_map: Dict[str, Node] = {}

        nodes.append(Node(id=doc.id, type="DOCUMENT", label=doc.filename, confidence=1.0))

        try:
            reader = csv.DictReader(io.StringIO(doc.content))
            for row in reader:
                plate = row.get("plate") or row.get("vehicle_plate") or row.get("registration") or ""
                toll_loc = row.get("toll_gate") or row.get("camera_location") or row.get("location") or ""
                timestamp = row.get("timestamp") or datetime.now(timezone.utc).isoformat()
                speed = row.get("speed_kmh") or row.get("velocity") or ""

                if plate:
                    v_id = f"veh_{re.sub(r'[^a-zA-Z0-9]', '', plate.lower())}"
                    if v_id not in node_map:
                        node_map[v_id] = Node(
                            id=v_id,
                            type="VEHICLE",
                            label=plate.upper(),
                            confidence=0.96,
                            attributes={"plate": plate}
                        )

                if toll_loc:
                    l_id = f"loc_{re.sub(r'[^a-zA-Z0-9]', '_', toll_loc.lower())}"
                    if l_id not in node_map:
                        node_map[l_id] = Node(
                            id=l_id,
                            type="LOCATION",
                            label=toll_loc,
                            confidence=0.95,
                            attributes={"type": "TOLL_PLAZA"}
                        )

                if plate and toll_loc:
                    edges.append(Edge(
                        source=f"veh_{re.sub(r'[^a-zA-Z0-9]', '', plate.lower())}",
                        target=f"loc_{re.sub(r'[^a-zA-Z0-9]', '_', toll_loc.lower())}",
                        type="TRAVELLED_TO",
                        confidence=0.98,
                        source_document=doc.filename,
                        timestamp=timestamp,
                        evidence=f"ANPR Optical Scan at {toll_loc} (Speed: {speed} km/h)"
                    ))

            nodes.extend(node_map.values())
            return nodes, edges
        except Exception:
            return cls._parse_text_intelligence(doc)

    @classmethod
    def _parse_text_intelligence(cls, doc: Document) -> Tuple[List[Node], List[Edge]]:
        """Generic NER & Regex parser for text FIRs, transcripts, and intelligence memos."""
        nodes: List[Node] = []
        edges: List[Edge] = []
        node_map: Dict[str, Node] = {}
        text = doc.content

        # Document Root Node
        doc_node = Node(id=doc.id, type="DOCUMENT", label=doc.filename, confidence=1.0)
        nodes.append(doc_node)

        # 1. Phone Numbers
        for ph in PHONE_REGEX.findall(text):
            ph_clean = re.sub(r'[^0-9]', '', ph)
            if len(ph_clean) >= 10:
                p_id = f"phone_{ph_clean[-10:]}"
                if p_id not in node_map:
                    node_map[p_id] = Node(id=p_id, type="PHONE", label=ph, confidence=0.98, attributes={"number": ph})

        # 2. Vehicle Registrations
        for veh in PLATE_REGEX.findall(text):
            v_id = f"veh_{re.sub(r'[^a-zA-Z0-9]', '', veh.lower())}"
            if v_id not in node_map:
                node_map[v_id] = Node(id=v_id, type="VEHICLE", label=veh.upper(), confidence=0.95)

        # 3. Bank Accounts / Wallets
        for acc in ACCOUNT_REGEX.findall(text):
            acc_digits = re.sub(r'[^0-9]', '', acc)
            is_phone = any(acc_digits == re.sub(r'[^0-9]', '', ph)[-len(acc_digits):] for ph in PHONE_REGEX.findall(text))
            if not is_phone or acc.upper().startswith(('ACC', 'SWIFT', 'IBAN', 'VAULT', 'TOKEN')):
                a_id = f"account_{re.sub(r'[^a-zA-Z0-9]', '_', acc.lower())}"
                if a_id not in node_map:
                    node_map[a_id] = Node(id=a_id, type="ACCOUNT", label=acc, confidence=0.97)

        # 4. Crypto Wallets
        for crypto in CRYPTO_REGEX.findall(text):
            c_id = f"crypto_{crypto[:10].lower()}"
            if c_id not in node_map:
                node_map[c_id] = Node(id=c_id, type="ACCOUNT", label=f"CRYPTO: {crypto[:12]}..", confidence=0.99, attributes={"wallet": crypto})

        # 5. Extract Suspect Names using Contextual NER Rules
        name_patterns = [
            r"(?:Accused|Suspect|Kingpin|Smuggler|Courier|Operative|Director)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})",
            r"([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})\s+(?:alias|s/o|arrested|confessed|interrogated|remanded)",
        ]
        for pat in name_patterns:
            for match in re.findall(pat, text):
                clean_name = match.strip()
                if len(clean_name) > 3 and clean_name.lower() not in {"state of", "police station", "high court", "crime branch"}:
                    p_id = f"person_{re.sub(r'[^a-zA-Z0-9]', '_', clean_name.lower())}"
                    if p_id not in node_map:
                        node_map[p_id] = Node(
                            id=p_id,
                            type="PERSON",
                            label=clean_name,
                            confidence=0.94,
                            attributes={"extracted_from_fir": True}
                        )

        # Link all extracted entities to Document
        for n in node_map.values():
            edges.append(Edge(
                source=n.id,
                target=doc.id,
                type="MENTIONED_IN",
                confidence=0.95,
                source_document=doc.filename,
                evidence=f"Extracted entity mention in {doc.filename}"
            ))

        # Extract direct relations between co-occurring entities
        person_nodes = [n for n in node_map.values() if n.type == "PERSON"]
        phone_nodes = [n for n in node_map.values() if n.type == "PHONE"]
        account_nodes = [n for n in node_map.values() if n.type == "ACCOUNT"]
        vehicle_nodes = [n for n in node_map.values() if n.type == "VEHICLE"]

        # 1. Person to Phone (USES)
        for p in person_nodes:
            for ph in phone_nodes:
                edges.append(Edge(
                    source=p.id,
                    target=ph.id,
                    type="USES",
                    confidence=0.92,
                    source_document=doc.filename,
                    evidence=f"{p.label} linked to communication terminal {ph.label} in {doc.filename}"
                ))

        # 2. Person to Account (TRANSFERRED_TO)
        for p in person_nodes:
            for acc in account_nodes:
                edges.append(Edge(
                    source=p.id,
                    target=acc.id,
                    type="TRANSFERRED_TO",
                    confidence=0.90,
                    source_document=doc.filename,
                    evidence=f"Financial nexus between {p.label} and {acc.label} established in {doc.filename}"
                ))

        # 3. Person to Vehicle (OPERATES)
        for p in person_nodes:
            for veh in vehicle_nodes:
                edges.append(Edge(
                    source=p.id,
                    target=veh.id,
                    type="OPERATES",
                    confidence=0.93,
                    source_document=doc.filename,
                    evidence=f"Vehicle {veh.label} operational dispatch associated with {p.label}"
                ))

        # 4. Person to Person (COORDINATES_WITH)
        for i in range(len(person_nodes)):
            for j in range(i + 1, len(person_nodes)):
                edges.append(Edge(
                    source=person_nodes[i].id,
                    target=person_nodes[j].id,
                    type="COORDINATES_WITH",
                    confidence=0.88,
                    source_document=doc.filename,
                    evidence=f"Co-conspiracy mention linking {person_nodes[i].label} with {person_nodes[j].label}"
                ))

        nodes.extend(node_map.values())
        return nodes, edges
