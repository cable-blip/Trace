"""
Automated Pattern Alert Engine for Antigravity Criminal Intelligence Platform
Detects: burner phone clusters, money laundering chains, communication hubs, isolated cells
"""

import networkx as nx
from typing import List, Dict, Any
from app.repositories.networkx_repo import NetworkXGraphRepository


SEVERITY_ORDER = {"CRITICAL": 1, "HIGH": 2, "MEDIUM": 3, "LOW": 4}


class AlertEngine:
    """Runs graph-structural pattern analysis to surface actionable intelligence alerts."""

    @staticmethod
    def generate_alerts(repo: NetworkXGraphRepository) -> List[Dict[str, Any]]:
        alerts: List[Dict[str, Any]] = []
        g = repo.graph

        if g.number_of_nodes() == 0:
            return alerts

        undirected = nx.Graph(g)

        # ── 1. Communication Hubs ─────────────────────────────────────────
        # Top 10% betweenness centrality PERSON nodes = critical network connectors
        if g.number_of_nodes() > 2:
            betweenness = nx.betweenness_centrality(undirected)
            sorted_bc = sorted(betweenness.values(), reverse=True)
            top_threshold = sorted_bc[max(0, len(sorted_bc) // 10 - 1)]

            for node_id, bc in betweenness.items():
                node_attrs = g.nodes.get(node_id, {})
                if bc >= top_threshold and node_attrs.get("type") == "PERSON" and bc > 0.05:
                    label = node_attrs.get("label", node_id)
                    alerts.append({
                        "id": f"ALERT-HUB-{node_id}",
                        "severity": "CRITICAL",
                        "type": "COMMUNICATION_HUB",
                        "title": "Key Network Hub Identified",
                        "description": (
                            f"'{label}' is a critical network broker (betweenness centrality: {bc:.2f}). "
                            f"Removing this individual would fragment the criminal network. "
                            f"High-priority surveillance target."
                        ),
                        "affected_nodes": [node_id],
                        "affected_edges": [],
                        "evidence": f"Betweenness centrality score: {bc:.4f}",
                    })

        # ── 2. Burner Phone Clusters ─────────────────────────────────────
        # PHONE nodes connected to ≥ 3 unique entities
        for node_id, attrs in g.nodes(data=True):
            if attrs.get("type") == "PHONE":
                neighbors = list(undirected.neighbors(node_id))
                degree = len(neighbors)
                if degree >= 3:
                    label = attrs.get("label", node_id)
                    alerts.append({
                        "id": f"ALERT-BURNER-{node_id}",
                        "severity": "HIGH",
                        "type": "BURNER_PHONE_CLUSTER",
                        "title": "Burner Phone Coordination Hub",
                        "description": (
                            f"Phone identifier '{label}' is connected to {degree} distinct entities. "
                            f"Multi-contact phone pattern is consistent with a coordination/burner device "
                            f"used to avoid direct communication traces."
                        ),
                        "affected_nodes": [node_id] + neighbors,
                        "affected_edges": [],
                        "evidence": f"Degree: {degree} connections to unique entities",
                    })

        # ── 3. Money Laundering Chains ───────────────────────────────────
        # ACCOUNT nodes involved in ≥ 2 TRANSACTION/TRANSFERRED_TO edges
        MONEY_EDGE_TYPES = {"TRANSFERRED_TO", "PAID", "RECEIVED", "TRANSACTION"}
        for node_id, attrs in g.nodes(data=True):
            if attrs.get("type") == "ACCOUNT":
                money_edges = [
                    (u, v, k, d) for u, v, k, d in g.edges(node_id, keys=True, data=True)
                    if d.get("type", "").upper() in MONEY_EDGE_TYPES
                ]
                if len(money_edges) >= 2:
                    label = attrs.get("label", node_id)
                    target_nodes = [v for _, v, _, _ in money_edges if v != node_id]
                    alerts.append({
                        "id": f"ALERT-LAUNDER-{node_id}",
                        "severity": "CRITICAL",
                        "type": "MONEY_LAUNDERING_CHAIN",
                        "title": "Suspected Money Laundering Pattern",
                        "description": (
                            f"Account '{label}' participates in {len(money_edges)} financial transactions. "
                            f"Multi-layered transaction pattern is consistent with value transfer obfuscation "
                            f"(layering stage of money laundering)."
                        ),
                        "affected_nodes": [node_id] + target_nodes,
                        "affected_edges": [k for _, _, k, _ in money_edges],
                        "evidence": f"{len(money_edges)} financial transfer edges detected",
                    })

        # ── 4. Isolated Criminal Cells ──────────────────────────────────
        # Connected components disconnected from the main network (≥ 2 members)
        components = sorted(nx.connected_components(undirected), key=len, reverse=True)
        if len(components) > 1:
            main_component = components[0]
            for i, comp in enumerate(components[1:], start=1):
                if len(comp) >= 2:
                    member_labels = [
                        g.nodes[n].get("label", n) for n in list(comp)[:5]
                    ]
                    alerts.append({
                        "id": f"ALERT-CELL-{i}",
                        "severity": "MEDIUM",
                        "type": "ISOLATED_CRIMINAL_CELL",
                        "title": f"Isolated Cell Detected ({len(comp)} members)",
                        "description": (
                            f"A cluster of {len(comp)} entities operates with NO connection to the main network. "
                            f"Members include: {', '.join(member_labels)}. "
                            f"This may indicate a sleeper cell or separate operational unit."
                        ),
                        "affected_nodes": list(comp),
                        "affected_edges": [],
                        "evidence": f"Zero edges connecting to main component of {len(main_component)} nodes",
                    })

        # ── 5. High-Frequency Location Activity ─────────────────────────
        # LOCATION nodes connected to ≥ 4 entities = operational base
        for node_id, attrs in g.nodes(data=True):
            if attrs.get("type") == "LOCATION":
                neighbors = list(undirected.neighbors(node_id))
                if len(neighbors) >= 4:
                    label = attrs.get("label", node_id)
                    alerts.append({
                        "id": f"ALERT-LOC-{node_id}",
                        "severity": "MEDIUM",
                        "type": "HIGH_ACTIVITY_LOCATION",
                        "title": "High-Activity Location",
                        "description": (
                            f"Location '{label}' is linked to {len(neighbors)} entities. "
                            f"High-density activity at a single location suggests an operational base, "
                            f"meeting point, or safe house."
                        ),
                        "affected_nodes": [node_id] + neighbors,
                        "affected_edges": [],
                        "evidence": f"Connected to {len(neighbors)} unique entities",
                    })

        # Sort by severity
        return sorted(alerts, key=lambda a: SEVERITY_ORDER.get(a["severity"], 9))
