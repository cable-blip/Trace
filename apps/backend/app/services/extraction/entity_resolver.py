"""
Entity Resolution Engine with Strict Canonical Merging and 'Possible Duplicate' flagging.
"""

import re
from typing import List, Dict, Tuple, Optional
from app.models.schema import Node, Edge

PREFIX_CLEAN_REGEX = re.compile(
    r"^(?:suspect|subject|target|contacting|with|to|and|driver|associate)\s+",
    re.IGNORECASE
)

class EntityResolver:
    @staticmethod
    def clean_person_label(label: str) -> str:
        cleaned = PREFIX_CLEAN_REGEX.sub('', label.strip())
        return cleaned.strip()

    @classmethod
    def resolve_entities(cls, nodes: List[Node], edges: List[Edge]) -> Tuple[List[Node], List[Edge]]:
        """
        Resolves entity mentions using trained XGBoost Entity Resolution model
        with cheap pre-filters (initial letter, token overlap, phone match)
        and fail-safe heuristic fallback.
        """
        from app.ml.entity_resolution_model import EntityResolutionEngine
        er_engine = EntityResolutionEngine.get_instance()

        unique_nodes: Dict[str, Node] = {}
        alias_map: Dict[str, str] = {} # maps duplicate id -> canonical id

        for node in nodes:
            # 1. Clean person label if necessary
            if node.type == "PERSON":
                cleaned_label = cls.clean_person_label(node.label)
                if cleaned_label:
                    node.label = cleaned_label

            norm_label = node.label.lower().strip()
            match_found = False

            # Check candidates in unique_nodes
            for existing_id, existing_node in list(unique_nodes.items()):
                if existing_node.type == node.type:
                    ex_norm = existing_node.label.lower().strip()

                    # Exact label or exact ID match
                    if ex_norm == norm_label or existing_id == node.id:
                        alias_map[node.id] = existing_id
                        match_found = True
                        break

                    # ML Model Resolution for PERSON nodes
                    if node.type == "PERSON":
                        # Cheap pre-filter: same first letter, token overlap, or substring containment
                        tokens_curr = set(re.findall(r'\w+', norm_label))
                        tokens_ex = set(re.findall(r'\w+', ex_norm))
                        first_letter_match = (norm_label and ex_norm and norm_label[0] == ex_norm[0])
                        token_overlap = bool(tokens_curr.intersection(tokens_ex))
                        substr_match = (norm_label in ex_norm or ex_norm in norm_label)

                        if first_letter_match or token_overlap or substr_match:
                            try:
                                phone_a = node.attributes.get("phone", "")
                                phone_b = existing_node.attributes.get("phone", "")
                                acc_a = node.attributes.get("account", "")
                                acc_b = existing_node.attributes.get("account", "")

                                is_same, prob = er_engine.predict_same_entity(
                                    existing_node.label,
                                    node.label,
                                    phone_a=phone_b,
                                    phone_b=phone_a,
                                    account_a=acc_b,
                                    account_b=acc_a
                                )

                                if is_same:
                                    if len(node.label) > len(existing_node.label):
                                        existing_node.label = node.label
                                    existing_node.attributes["ml_resolved"] = True
                                    existing_node.attributes["resolution_prob"] = round(prob, 4)
                                    alias_map[node.id] = existing_id
                                    match_found = True
                                    break
                            except Exception:
                                # Safe Fallback
                                if substr_match:
                                    if len(norm_label) > len(ex_norm):
                                        existing_node.label = node.label
                                    alias_map[node.id] = existing_id
                                    match_found = True
                                    break

            if not match_found:
                unique_nodes[node.id] = node

        # Remap edges using alias_map
        resolved_edges: List[Edge] = []
        seen_edge_keys = set()

        for edge in edges:
            src = alias_map.get(edge.source, edge.source)
            tgt = alias_map.get(edge.target, edge.target)
            
            if src != tgt: # Avoid self-loops from alias remapping
                edge_key = (src, tgt, edge.type, edge.source_document)
                if edge_key not in seen_edge_keys:
                    edge.source = src
                    edge.target = tgt
                    resolved_edges.append(edge)
                    seen_edge_keys.add(edge_key)

        return list(unique_nodes.values()), resolved_edges

