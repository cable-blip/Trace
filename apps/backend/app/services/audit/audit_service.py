"""
Investigative Action Audit Logger Service
Records immutable audit entries for document ingestion, AI queries, entity expansions, and exports.
"""

import re
from typing import List, Dict, Any
from datetime import datetime, timezone


def mask_pii(text: str) -> str:
    """Masks Aadhaar, PAN, and Phone numbers to prevent PII leakage into audit logs."""
    if not isinstance(text, str):
        return text
    # Mask 12-digit Aadhaar
    text = re.sub(r'\b(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})\b', r'XXXX-XXXX-\3', text)
    # Mask 10-char PAN
    text = re.sub(r'\b([A-Z]{5})([0-9]{4})([A-Z]{1})\b', r'XXXXX\2\3', text)
    # Mask 10-digit Phone
    text = re.sub(r'\b(\+?91[\-\s]?)?([6-9]\d{2})\d{4}(\d{3})\b', r'+91-\2-XXXX-\3', text)
    return text


class AuditLogService:
    _audit_logs: Dict[str, List[Dict[str, Any]]] = {}

    @classmethod
    def log_action(cls, case_id: str, action_type: str, details: str, user: str = "Investigator_01") -> Dict[str, Any]:
        if case_id not in cls._audit_logs:
            cls._audit_logs[case_id] = []
        
        sanitized_details = mask_pii(details)
        entry = {
            "id": f"AUDIT-{len(cls._audit_logs[case_id]) + 1:04d}",
            "case_id": case_id,
            "action_type": action_type,
            "details": sanitized_details,
            "user": user,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        cls._audit_logs[case_id].append(entry)
        return entry

    @classmethod
    def get_case_audit_logs(cls, case_id: str) -> List[Dict[str, Any]]:
        return cls._audit_logs.get(case_id, [])
