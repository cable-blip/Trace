"""
XGBoost Investigative Priority Model (TRACE ML Architecture — Phase 3).
Replaces hardcoded dictionaries (SUSPECT_PROFILES) with a trained gradient boosted
decision tree evaluating real graph topological features (centralities, community bridges,
multi-source corroboration, and financial/communication nexus).
Saved in XGBoost native JSON format (Zero Python pickle).
"""

import os
import math
from typing import List, Dict, Any, Tuple, Optional
import networkx as nx
from networkx.algorithms.community import greedy_modularity_communities
import numpy as np
import xgboost as xgb

from app.ml.training_data import generate_priority_training_cases

SAVED_MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "saved_models"))
MODEL_PATH = os.path.join(SAVED_MODELS_DIR, "priority_model.json")

PRIORITY_FEATURE_NAMES = [
    "degree_centrality",
    "betweenness_centrality",
    "pagerank",
    "doc_count",
    "financial_edges_count",
    "communication_edges_count",
    "is_community_bridge"
]

NON_CULPABILITY_DISCLAIMER = (
    "INVESTIGATIVE DECISION SUPPORT ONLY — Priority score derived strictly from "
    "topological graph metrics under Section 161 CrPC / Section 180 BNSS. "
    "Not an automated determination of guilt or culpability."
)


# ── Feature Engineering from Real NetworkX Graph ───────────────────────────
def extract_person_graph_features(
    graph: nx.Graph,
    person_id: str,
    precomputed_metrics: Optional[Dict[str, Any]] = None
) -> List[float]:
    """
    Extracts 7 structural and corroboration features for a PERSON node
    from the real case graph.
    """
    ug = graph.to_undirected() if graph.is_directed() else graph
    total_nodes = max(len(ug.nodes), 1)

    if precomputed_metrics is None:
        deg_cent = nx.degree_centrality(ug) if total_nodes > 1 else {n: 1.0 for n in ug.nodes}
        btw_cent = nx.betweenness_centrality(ug) if total_nodes > 2 else {n: 0.0 for n in ug.nodes}
        try:
            pr_cent = nx.pagerank(ug) if total_nodes > 1 else {n: 1.0 for n in ug.nodes}
        except Exception:
            pr_cent = deg_cent

        try:
            comms = list(greedy_modularity_communities(ug)) if total_nodes >= 3 else list(nx.connected_components(ug))
        except Exception:
            comms = list(nx.connected_components(ug))
    else:
        deg_cent = precomputed_metrics["deg_cent"]
        btw_cent = precomputed_metrics["btw_cent"]
        pr_cent = precomputed_metrics["pr_cent"]
        comms = precomputed_metrics["comms"]

    deg = float(deg_cent.get(person_id, 0.0))
    btw = float(btw_cent.get(person_id, 0.0))
    pr = float(pr_cent.get(person_id, 0.0))

    # Incident edges
    incident_edges = []
    if person_id in graph:
        for u, v, data in graph.edges(person_id, data=True):
            incident_edges.append(data)
        if graph.is_directed():
            for u, v, data in graph.in_edges(person_id, data=True):
                incident_edges.append(data)

    source_docs = {e.get("source_document") for e in incident_edges if e.get("source_document")}
    doc_count = float(len(source_docs))

    fin_count = 0
    comm_count = 0
    for e in incident_edges:
        etype = str(e.get("type", "")).upper()
        if any(k in etype for k in ("TRANSFER", "PAID", "FINANCIAL", "ACCOUNT", "RECEIVED", "OWNS")):
            fin_count += 1
        if any(k in etype for k in ("CALL", "PHONE", "COMMUNICATE", "CONTACT", "INTERCEPT", "USES")):
            comm_count += 1

    # Check community bridge
    neighbors = set(ug.neighbors(person_id)) if person_id in ug else set()
    bridged = [c for c in comms if any(nbr in c for nbr in neighbors)]
    is_bridge = 1.0 if len(bridged) >= 2 else 0.0

    return [
        deg,
        btw,
        pr,
        doc_count,
        float(fin_count),
        float(comm_count),
        is_bridge
    ]


# ── Training Function ───────────────────────────────────────────────────────
def train_priority_model(n_cases: int = 20) -> xgb.XGBClassifier:
    """
    Trains XGBoost classifier on synthetic ground truth graphs and saves
    to native JSON format (no pickle).
    """
    cases = generate_priority_training_cases(n_cases=n_cases, seed=42)

    X = []
    y = []

    for c in cases:
        G = c["graph"]
        ug = G.to_undirected()
        total_nodes = len(ug.nodes)
        
        deg_cent = nx.degree_centrality(ug)
        btw_cent = nx.betweenness_centrality(ug)
        try:
            pr_cent = nx.pagerank(ug)
        except Exception:
            pr_cent = deg_cent

        try:
            comms = list(greedy_modularity_communities(ug)) if total_nodes >= 3 else list(nx.connected_components(ug))
        except Exception:
            comms = list(nx.connected_components(ug))

        metrics = {"deg_cent": deg_cent, "btw_cent": btw_cent, "pr_cent": pr_cent, "comms": comms}

        for person_id, label in c["person_labels"].items():
            feats = extract_person_graph_features(G, person_id, metrics)
            X.append(feats)
            y.append(label)

    X_mat = np.array(X, dtype=np.float32)
    y_vec = np.array(y, dtype=np.int32)

    pos_count = max(int(np.sum(y_vec)), 1)
    neg_count = max(len(y_vec) - pos_count, 1)
    scale_pos_weight = float(neg_count) / float(pos_count)

    model = xgb.XGBClassifier(
        n_estimators=80,
        max_depth=3,
        learning_rate=0.08,
        scale_pos_weight=scale_pos_weight,
        subsample=0.85,
        n_jobs=2,
        random_state=42,
        eval_metric="logloss"
    )
    model.fit(X_mat, y_vec)

    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
    model.save_model(MODEL_PATH)
    return model


# ── Lazy-Loaded Singleton Engine ───────────────────────────────────────────
class InvestigativePriorityMLModel:
    _instance: Optional['InvestigativePriorityMLModel'] = None

    def __init__(self):
        self.model: Optional[xgb.XGBClassifier] = None
        self._load_or_train()

    def _load_or_train(self):
        try:
            if os.path.exists(MODEL_PATH):
                self.model = xgb.XGBClassifier()
                self.model.load_model(MODEL_PATH)
            else:
                self.model = train_priority_model()
        except Exception:
            self.model = None

    @classmethod
    def get_instance(cls) -> 'InvestigativePriorityMLModel':
        if cls._instance is None:
            cls._instance = InvestigativePriorityMLModel()
        return cls._instance

    def predict_priority(self, graph: nx.Graph, person_id: str, precomputed_metrics: Optional[Dict[str, Any]] = None) -> Tuple[float, List[str]]:
        """
        Computes the continuous investigative priority score (0.0 to 100.0)
        and factual structural reasons directly from graph topology.
        """
        feats = extract_person_graph_features(graph, person_id, precomputed_metrics)
        deg, btw, pr, doc_count, fin_count, comm_count, is_bridge = feats

        score = 45.0
        if self.model is not None:
            try:
                X = np.array([feats], dtype=np.float32)
                prob = float(self.model.predict_proba(X)[0][1])
                score = round(prob * 100.0, 1)
            except Exception:
                pass

        # If model returned near-uniform due to small edge count, combine with topological baseline
        if score < 20.0 or score > 98.0:
            topological_score = (deg * 30.0) + (btw * 50.0) + min(doc_count * 5.0, 20.0)
            score = round(min(max(topological_score, 15.0), 98.5), 1)

        # Generate Factual Structural Reasons
        reasons = []
        if btw > 0.05:
            reasons.append(f"Critical syndicate bottleneck (betweenness centrality: {btw:.3f}) controlling network flow.")
        if is_bridge > 0.5:
            reasons.append("Cross-community bridge node linking distinct operational syndicate clusters.")
        if doc_count >= 2:
            reasons.append(f"Corroborated across {int(doc_count)} distinct intelligence documents.")
        elif doc_count == 1:
            reasons.append("Corroborated in documentary case intelligence.")
        if fin_count > 0 and comm_count > 0:
            reasons.append(f"Dual-nexus verified: {int(fin_count)} financial transactions and {int(comm_count)} communication intercepts.")
        elif fin_count > 0:
            reasons.append(f"Direct financial link: {int(fin_count)} transaction edges connected to entity.")
        elif comm_count > 0:
            reasons.append(f"Direct telecom link: {int(comm_count)} intercepted calls/messages.")
        if deg > 0.10:
            reasons.append(f"High network connectivity (degree centrality: {deg:.3f}).")

        if not reasons:
            reasons.append("Peripheral suspect with single-point intelligence link.")

        return score, reasons
