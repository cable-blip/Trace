"""
Inter-Agency Intelligence Sanitization & Redaction Gateway.
Enables controlled cross-agency data sharing by redacting classified informants (HUMINT)
and raw SIGINT wiretap frequencies based on clearance levels.
"""

import re
from typing import Dict, Any, List
from datetime import datetime, timezone
from app.models.schema import Case, GraphData, Node, Edge

CLEARANCE_LEVELS = {"TOP_SECRET", "SECRET", "CONFIDENTIAL", "RESTRICTED", "UNCLASSIFIED"}

class SanitizationGateway:
    @classmethod
    def sanitize_case_dossier(
        cls,
        case: Case,
        graph_data: GraphData,
        target_clearance: str = "CONFIDENTIAL",
        recipient_agency: str = "INTERPOL_NCB_MUMBAI"
    ) -> Dict[str, Any]:
        """
        Sanitizes graph entities, documents, and relationship evidence
        based on the recipient agency's clearance level.
        """
        target_clearance = target_clearance.upper().strip()
        if target_clearance not in CLEARANCE_LEVELS:
            target_clearance = "CONFIDENTIAL"

        sanitized_nodes = []
        sanitized_edges = []
        redaction_count = 0

        # Process Nodes
        for n in graph_data.nodes:
            is_sensitive = n.attributes.get("informant") or "source" in n.label.lower() or "informant" in n.label.lower()
            if is_sensitive and target_clearance not in ("TOP_SECRET", "SECRET"):
                redacted_label = f"[REDACTED_HUMINT_SOURCE_{n.id[:6].upper()}]"
                redacted_attrs = {"redacted": True, "classification": "TOP_SECRET_HUMINT"}
                sanitized_nodes.append(Node(
                    id=n.id,
                    type=n.type,
                    label=redacted_label,
                    confidence=n.confidence,
                    attributes=redacted_attrs
                ))
                redaction_count += 1
            else:
                sanitized_nodes.append(n)

        # Process Edges
        for e in graph_data.edges:
            ev = e.evidence or ""
            if target_clearance in ("UNCLASSIFIED", "RESTRICTED"):
                # Mask phone numbers and exact account balances in low-clearance exports
                ev_masked = re.sub(r'\+?\d{10,12}', '[MASKED_PHONE]', ev)
                ev_masked = re.sub(r'INR\s?[\d,]+', '[MASKED_AMOUNT]', ev_masked)
                sanitized_edges.append(Edge(
                    id=e.id,
                    source=e.source,
                    target=e.target,
                    type=e.type,
                    confidence=e.confidence,
                    source_document=e.source_document,
                    timestamp=e.timestamp,
                    evidence=ev_masked,
                    attributes=e.attributes
                ))
            else:
                sanitized_edges.append(e)

        return {
            "case_id": case.id,
            "case_name": case.name,
            "classification_level": target_clearance,
            "recipient_agency": recipient_agency,
            "sanitization_timestamp": datetime.now(timezone.utc).isoformat(),
            "total_entities_shared": len(sanitized_nodes),
            "total_relations_shared": len(sanitized_edges),
            "redacted_elements_count": redaction_count,
            "sanitized_graph": {
                "nodes": [n.model_dump() if hasattr(n, "model_dump") else n.dict() for n in sanitized_nodes],
                "edges": [e.model_dump() if hasattr(e, "model_dump") else e.dict() for e in sanitized_edges]
            },
            "disclaimer": f"This intelligence document is cleared for {recipient_agency} at {target_clearance} level only."
        }
