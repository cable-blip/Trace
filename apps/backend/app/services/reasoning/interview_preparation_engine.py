"""
Genuine Evidence-Led Interview Preparation Engine (TRACE v2.0).
Generates neutral, objective, non-leading interview plans grounded strictly in primary case exhibits.
Strict Operating Standard:
- Applicable to ANY person entity in the active graph.
- Non-coercive, non-leading inquiry formulation citing evidence IDs.
- Zero simulated biometrics, stress percentages, or confession mechanics.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.repositories.base import GraphRepository
from app.models.schema import GraphData, Node, Edge


class InterviewPreparationEngine:
    @classmethod
    def generate_interview_plan(cls, case_id: str, person_id: str, repo: GraphRepository) -> Dict[str, Any]:
        node = repo.get_node(person_id)
        if not node:
            # Fallback search by label or partial id
            all_nodes = repo.get_all().nodes
            for n in all_nodes:
                if n.id.lower() == person_id.lower() or person_id.lower() in n.id.lower() or person_id.lower() in n.label.lower():
                    node = n
                    person_id = n.id
                    break

        person_name = node.label if node else person_id.replace("person_", "").replace("_", " ").title()

        all_edges = repo.get_all().edges
        incident_edges = [e for e in all_edges if e.source == person_id or e.target == person_id]

        fin_edges = [e for e in incident_edges if any(k in e.type for k in ("TRANSFER", "PAID", "ACCOUNT", "OWNS", "LAUNDER", "FINANCIAL"))]
        call_edges = [e for e in incident_edges if any(k in e.type for k in ("CALL", "PHONE", "USES", "CONTACT"))]
        loc_edges = [e for e in incident_edges if any(k in e.type for k in ("TRAVEL", "LOCATED", "SPOTTED"))]

        # Determine objective operational role hypothesis
        if len(fin_edges) > 0 and len(call_edges) > 0:
            role_hypothesis = "Identified Financial and Operational Associate"
        elif len(fin_edges) > 0:
            role_hypothesis = "Financial Transaction Counterparty"
        elif len(call_edges) > 0:
            role_hypothesis = "Telecom Communication Contact"
        else:
            role_hypothesis = "Case Material Witness / Associate"

        objectives = [
            f"Clarify factual circumstances regarding documented interactions with case entities.",
            f"Establish timeline of events based on primary communication and financial records.",
            f"Verify or refute potential alibi explanations with independent documentary evidence."
        ]

        questions = []
        q_idx = 1

        # 1. Financial Inquiries
        for fe in fin_edges[:3]:
            other_id = fe.target if fe.source == person_id else fe.source
            other_node = repo.get_node(other_id)
            other_label = other_node.label if other_node else other_id
            doc_ref = fe.source_document or "Financial Ledger Exhibit"
            questions.append({
                "question_id": f"Q-{q_idx:02d}",
                "topic": "Financial Transactions",
                "question_text": f"What was the business purpose of the transaction involving '{other_label}' documented in '{doc_ref}'?",
                "evidence_citations": [doc_ref, fe.id or f"{fe.source}->{fe.target}"],
                "neutrality_rating": "NON_LEADING"
            })
            q_idx += 1

        # 2. Telecom Inquiries
        for ce in call_edges[:3]:
            other_id = ce.target if ce.source == person_id else ce.source
            other_node = repo.get_node(other_id)
            other_label = other_node.label if other_node else other_id
            doc_ref = ce.source_document or "Telecom Call Detail Record"
            time_str = ce.timestamp or "recorded timestamp"
            questions.append({
                "question_id": f"Q-{q_idx:02d}",
                "topic": "Telecom Logs",
                "question_text": f"Please clarify the context of the communication logged with terminal '{other_label}' around {time_str} referenced in '{doc_ref}'.",
                "evidence_citations": [doc_ref, ce.id or f"{ce.source}->{ce.target}"],
                "neutrality_rating": "NON_LEADING"
            })
            q_idx += 1

        # 3. Location / Alibi Inquiries
        for le in loc_edges[:2]:
            other_id = le.target if le.source == person_id else le.source
            other_node = repo.get_node(other_id)
            other_label = other_node.label if other_node else other_id
            doc_ref = le.source_document or "Surveillance Sighting Log"
            questions.append({
                "question_id": f"Q-{q_idx:02d}",
                "topic": "Spatio-Temporal Presence",
                "question_text": f"Were you present in the vicinity of '{other_label}' on the date referenced in record '{doc_ref}', and if so, what was the nature of your visit?",
                "evidence_citations": [doc_ref, le.id or f"{le.source}->{le.target}"],
                "neutrality_rating": "NON_LEADING"
            })
            q_idx += 1

        # Fallback question if minimal edges exist
        if not questions:
            questions.append({
                "question_id": "Q-01",
                "topic": "General Background",
                "question_text": f"Please describe your professional association and interactions with the entities identified in Case {case_id}.",
                "evidence_citations": [f"Case Dossier {case_id}"],
                "neutrality_rating": "NON_LEADING"
            })

        alibi_verification_points = [
            "Request documentary alibi evidence (tickets, electronic receipts, third-party witness statements).",
            "Cross-verify claimed physical location against mobile tower registration data (Section 65B compliance).",
            "Verify employment or travel logs covering relevant incident time intervals."
        ]

        return {
            "case_id": case_id,
            "person_id": person_id,
            "person_name": person_name,
            "role_hypothesis": role_hypothesis,
            "interview_objectives": objectives,
            "non_leading_questions": questions,
            "alibi_verification_points": alibi_verification_points,
            "total_questions": len(questions),
            "total_connected_exhibits": len(incident_edges),
            "statutory_compliance_notice": (
                "Mandatory non-coercion compliance under Section 161 CrPC / Section 180 BNSS. "
                "The interviewee holds the constitutional right against self-incrimination (Article 20(3), Constitution of India). "
                "Questions must remain objective, non-threatening, and strictly evidence-grounded."
            ),
            "non_coercion_notice": (
                "Mandatory non-coercion compliance under Section 161 CrPC / Section 180 BNSS. "
                "The interviewee holds the constitutional right against self-incrimination (Article 20(3), Constitution of India). "
                "Questions must remain objective, non-threatening, and strictly evidence-grounded."
            )
        }
