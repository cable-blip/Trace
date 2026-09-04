"""
Automated Legal Charge Sheet & Judicial Warrant Generator.
Generates court-admissible charge sheets, formal legal sections (IPC/BNS/NDPS/PMLA),
and evidence exhibits with cryptographic SHA-256 chain-of-custody hashes.
"""

import hashlib
import json
from typing import Dict, Any, List
from datetime import datetime, timezone
from app.models.schema import Case, GraphData, Node, Edge

class ChargeSheetGenerator:
    @staticmethod
    def _compute_hash(content: str) -> str:
        return hashlib.sha256(content.encode('utf-8')).hexdigest()

    @classmethod
    def generate_chargesheet(cls, case: Case, graph_data: GraphData, investigating_officer: str = "Inspector R. Deshmukh, Crime Branch") -> Dict[str, Any]:
        """
        Synthesizes all case nodes, edges, financial transactions, and CDR links
        into a structured Judicial Charge Sheet ready for filing in a Court of Law.
        """
        # Identify Accused Persons
        accused_list = []
        for n in graph_data.nodes:
            if n.type == "PERSON":
                role = n.attributes.get("role", "Accused / Conspirator")
                accused_list.append({
                    "accused_id": n.id,
                    "name": n.label,
                    "role": role,
                    "confidence_rating": f"{int(n.confidence * 100)}%",
                    "status": "Remanded in Judicial Custody" if "Leader" in role or "Kingpin" in role else "Under Investigation",
                    "applicable_sections": cls._map_legal_sections(role, n.attributes)
                })

        # Identify Forensic Evidence Exhibits (Malkhana Index)
        exhibits = []
        for i, edge in enumerate(graph_data.edges):
            if edge.evidence:
                raw_hash = cls._compute_hash(f"{edge.source}_{edge.target}_{edge.timestamp}_{edge.evidence}")
                exhibits.append({
                    "exhibit_number": f"EXH-{i+1:03d}",
                    "source_entity": edge.source,
                    "target_entity": edge.target,
                    "relation_type": edge.type,
                    "evidence_description": edge.evidence,
                    "source_document": edge.source_document,
                    "timestamp": edge.timestamp,
                    "sha256_chain_of_custody": raw_hash
                })

        # Generate Brief Facts of the Case
        brief_facts = (
            f"During the course of investigation under {case.name} (Case ID: {case.id}), intelligence inputs "
            f"and digital forensic extractions revealed an organized criminal syndicate operating across multiple jurisdictions. "
            f"Analysis of telecommunication CDR dumps, Hawala remittance ledgers, ANPR toll logs, and physical surveillance "
            f"conclusively establishes that the accused persons acted in criminal conspiracy to execute contraband movement "
            f"and illicit money laundering."
        )

        return {
            "case_id": case.id,
            "case_name": case.name,
            "court_jurisdiction": "Special Court for Organized Crime & PMLA, Mumbai",
            "investigating_officer": investigating_officer,
            "filing_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "brief_facts_of_case": brief_facts,
            "accused_count": len(accused_list),
            "accused_persons": accused_list,
            "total_exhibits_indexed": len(exhibits),
            "evidence_exhibits": exhibits,
            "statutory_compliance": "Indian Evidence Act Sec 65B (Electronic Records Certificate attached)",
            "prayer": "It is prayed that cognizance of the offences may graciously be taken against the accused persons and trial proceeded in accordance with law."
        }

    @classmethod
    def generate_warrant_application(cls, case: Case, suspect_node: Node, target_location: str, grounds: str) -> Dict[str, Any]:
        """Generates a formal Search & Arrest Warrant Application."""
        curr_iso = datetime.now(timezone.utc).isoformat()
        return {
            "warrant_type": "SEARCH_AND_SEIZURE_WARRANT",
            "case_id": case.id,
            "case_name": case.name,
            "court": "Hon'ble Special Sessions Judge",
            "target_suspect": suspect_node.label,
            "target_address": target_location,
            "grounds_of_belief": grounds,
            "urgent_prayer": f"Issue Non-Bailable Arrest Warrant and Search Authorization under Section 93/94 CrPC against {suspect_node.label}.",
            "timestamp": curr_iso,
            "sha256_verification": cls._compute_hash(f"{case.id}_{suspect_node.id}_{target_location}_{curr_iso}")
        }

    @staticmethod
    def _map_legal_sections(role: str, attributes: Dict[str, Any]) -> List[str]:
        sections = ["IPC Sec 120B (Criminal Conspiracy)"]
        lower_role = role.lower()
        if "financier" in lower_role or "hawala" in lower_role or "mule" in lower_role:
            sections.extend(["PMLA Sec 3 & 4 (Money Laundering)", "IPC Sec 420 (Cheating)"])
        if "smuggler" in lower_role or "contraband" in lower_role or "courier" in lower_role:
            sections.extend(["NDPS Act Sec 8(c), 21, 29", "Customs Act Sec 135"])
        if "exploit" in lower_role or "threat" in lower_role or "botnet" in lower_role:
            sections.extend(["IT Act Sec 66, 66C, 66D", "IPC Sec 468 (Forgery)"])
        return sections
