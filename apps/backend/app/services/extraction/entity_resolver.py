"""
Entity Resolution Engine with Strict Canonical Merging and 'Possible Duplicate' flagging.
"""

from typing import List, Dict, Tuple
from app.models.schema import Node, Edge

class EntityResolver:
    @staticmethod
    def resolve_entities(nodes: List[Node], edges: List[Edge]) -> Tuple[List[Node], List[Edge]]:
        unique_nodes: Dict[str, Node] = {}
        alias_map: Dict[str, str] = {} # maps duplicate id -> canonical id

        for node in nodes:
            # Check exact match by label and type
            match_found = False
            for existing_id, existing_node in list(unique_nodes.items()):
                if existing_node.type == node.type:
                    # 1. Exact label match
                    if existing_node.label.lower().strip() == node.label.lower().strip():
                        alias_map[node.id] = existing_id
                        match_found = True
                        break
                    
                    # 2. Fuzzy name match (e.g. "Devendra" vs "Devendra Sharma") -> Flag as possible duplicate
                    elif node.type == "PERSON" and (
                        node.label.lower() in existing_node.label.lower() or 
                        existing_node.label.lower() in node.label.lower()
                    ) and node.label != existing_node.label:
                        node.is_possible_duplicate = True
                        node.canonical_id = existing_id
                        # Keep node separate but set possible duplicate flag
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
