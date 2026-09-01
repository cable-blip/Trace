"""
Investigative Action Audit Logger Service
Records immutable audit entries for document ingestion, AI queries, entity expansions, and exports.
"""

from typing import List, Dict, Any
from datetime import datetime, timezone

class AuditLogService:
    _audit_logs: Dict[str, List[Dict[str, Any]]] = {}

    @classmethod
    def log_action(cls, case_id: str, action_type: str, details: str, user: str = "Investigator_01") -> Dict[str, Any]:
        if case_id not in cls._audit_logs:
            cls._audit_logs[case_id] = []
        
        entry = {
            "id": f"AUDIT-{len(cls._audit_logs[case_id]) + 1:04d}",
            "case_id": case_id,
            "action_type": action_type,
            "details": details,
            "user": user,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        cls._audit_logs[case_id].append(entry)
        return entry

    @classmethod
    def get_case_audit_logs(cls, case_id: str) -> List[Dict[str, Any]]:
        return cls._audit_logs.get(case_id, [])
