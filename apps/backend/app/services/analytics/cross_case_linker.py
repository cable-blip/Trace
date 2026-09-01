"""
Cross-Case Syndicate Intelligence & Cartel Fusion Linker.
Discovers hidden multi-jurisdiction umbrella cartels connecting distinct operational cases.
"""

from typing import List, Dict, Any, Set
from collections import defaultdict
from app.models.schema import Case, GraphData

class CrossCaseLinker:
    @staticmethod
    def discover_transnational_links(all_cases_graphs: Dict[str, GraphData]) -> List[Dict[str, Any]]:
        """
        Scans across all case graphs to detect overlapping nodes (e.g. shared phones,
        bank accounts, shell companies, vehicles) linking seemingly isolated syndicates.
        """
        entity_case_map: Dict[str, Set[str]] = defaultdict(set)
        entity_obj_map: Dict[str, Any] = {}

        for case_id, gdata in all_cases_graphs.items():
            for node in gdata.nodes:
                # Group by normalized label or ID for cross-case matching
                norm_key = node.label.strip().lower()
                if len(norm_key) >= 3 and node.type != "DOCUMENT":
                    entity_case_map[norm_key].add(case_id)
                    entity_obj_map[norm_key] = node

        cross_case_links = []
        for norm_key, case_ids in entity_case_map.items():
            if len(case_ids) > 1:
                node = entity_obj_map[norm_key]
                cross_case_links.append({
                    "entity_id": node.id,
                    "entity_label": node.label,
                    "entity_type": node.type,
                    "linked_cases": list(case_ids),
                    "syndicate_fusion_score": min(1.0, 0.70 + (len(case_ids) * 0.15)),
                    "evidence": f"Transnational Bridge Detected: Entity '{node.label}' operates across cases {', '.join(sorted(case_ids))}"
                })

        cross_case_links.sort(key=lambda x: x["syndicate_fusion_score"], reverse=True)
        return cross_case_links
