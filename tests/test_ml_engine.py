"""
Unit & Mathematical Validation Test Suite for Graph Machine Learning & Bayesian Prediction Models
"""

import os
import sys
import pytest
import numpy as np
import networkx as nx

# Add backend to python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "backend"))

from app.models.schema import Case, Node, Edge
from app.repositories.networkx_repo import NetworkXGraphRepository
from app.services.analytics.graph_ml_engine import GraphMLEngine
from app.services.reasoning.bayesian_culprit_model import BayesianCulpritModel
from app.services.reasoning.predictive_threat_engine import PredictiveThreatEngine
from app.services.analytics.ml_dataset_trainer import MLDatasetTrainer

def create_mock_criminal_network():
    repo = NetworkXGraphRepository()
    
    # Add nodes
    nodes = [
        Node(id="p1", label="Kingpin Alpha", type="PERSON", confidence=0.98),
        Node(id="p2", label="Financier Beta", type="PERSON", confidence=0.95),
        Node(id="p3", label="Courier Gamma", type="PERSON", confidence=0.92),
        Node(id="p4", label="Mule Delta", type="PERSON", confidence=0.90),
        Node(id="acc1", label="Escrow Acc 101", type="ACCOUNT", confidence=0.99),
        Node(id="acc2", label="Shell Acc 202", type="ACCOUNT", confidence=0.99),
        Node(id="loc1", label="Dockyard WH", type="LOCATION", confidence=0.95),
    ]
    for n in nodes:
        repo.add_node(n)

    # Add edges forming a triangle & a Hawala financial cycle (acc1 -> acc2 -> p4 -> acc1)
    edges = [
        Edge(id="e1", source="p1", target="p2", type="CALLS", confidence=0.95, source_document="doc_1"),
        Edge(id="e2", source="p2", target="p3", type="COORDINATES", confidence=0.90, source_document="doc_1"),
        Edge(id="e3", source="p2", target="acc1", type="TRANSFERRED_TO", confidence=0.98, source_document="doc_1"),
        Edge(id="e4", source="acc1", target="acc2", type="TRANSFERRED_TO", confidence=0.98, source_document="doc_1"),
        Edge(id="e5", source="acc2", target="p4", type="PAID", confidence=0.95, source_document="doc_1"),
        Edge(id="e6", source="p4", target="acc1", type="TRANSFERRED_TO", confidence=0.95, source_document="doc_1"), # Cycle!
        Edge(id="e7", source="p3", target="loc1", type="LOCATED_AT", confidence=0.92, source_document="doc_1"),
    ]
    for e in edges:
        repo.add_edge(e)

    return repo

def test_adamic_adar_link_prediction():
    repo = create_mock_criminal_network()
    engine = GraphMLEngine(repo)
    
    predictions = engine.predict_missing_links(top_k=5)
    assert len(predictions) > 0, "Link prediction should find missing candidate links"
    
    # Check that p1 and p3 (sharing p2) or similar pairs have positive scores
    top_pred = predictions[0]
    assert "link_probability" in top_pred
    assert "adamic_adar_score" in top_pred
    assert top_pred["link_probability"] >= 0.15
    assert top_pred["adamic_adar_score"] >= 0.0
    print("Adamic-Adar Link Prediction Test Passed:", top_pred["source_label"], "<->", top_pred["target_label"], f"(Prob: {top_pred['link_probability']})")

def test_money_laundering_cycle_detection():
    repo = create_mock_criminal_network()
    engine = GraphMLEngine(repo)
    
    cycles = engine.detect_money_laundering_cycles()
    assert len(cycles) > 0, "Should detect circular Hawala money laundering loops"
    
    cycle = cycles[0]
    assert cycle["length"] >= 3
    assert cycle["risk_score"] >= 70.0
    print("Money Laundering Cycle Test Passed:", cycle["pattern_type"], f"(Length: {cycle['length']}, Risk: {cycle['risk_score']})")

def test_network_articulation_points():
    repo = create_mock_criminal_network()
    engine = GraphMLEngine(repo)
    
    vuln = engine.analyze_network_vulnerability()
    assert "network_resilience_index" in vuln
    assert "critical_articulation_targets" in vuln
    print("Network Vulnerability Test Passed: Total Cut Vertices =", vuln["total_cut_vertices"])

def test_bayesian_culpability_model():
    repo = create_mock_criminal_network()
    res = BayesianCulpritModel.calculate_culpability(repo)
    
    assert "suspects" in res
    assert len(res["suspects"]) == 4 # 4 persons in mock network
    
    for s in res["suspects"]:
        assert 0.0 <= s["guilt_probability"] <= 99.2
        assert "prior_probability" in s
        assert "evidence_breakdown" in s
        
    print("Bayesian Culpability Model Test Passed: Top Suspect =", res["suspects"][0]["name"], f"({res['suspects'][0]['guilt_probability']}%)")

def test_markov_threat_forecasting():
    repo = create_mock_criminal_network()
    forecast = PredictiveThreatEngine.forecast_case_threats("CASE-001", repo)
    
    assert "overall_syndicate_threat_score" in forecast
    assert "current_operational_state" in forecast
    assert "projected_next_state" in forecast
    assert len(forecast["forecasts"]) > 0
    print("Markov Threat Forecasting Test Passed: Current State =", forecast["current_operational_state"], "-> Next State =", forecast["projected_next_state"])

def test_ml_dataset_trainer_evaluation():
    repo = create_mock_criminal_network()
    metrics = MLDatasetTrainer.evaluate_model_performance(repo)
    
    assert metrics["model_status"] == "OPTIMAL_CONVERGENCE"
    d_metrics = metrics["dataset_validation_metrics"]
    assert 0.0 <= d_metrics["roc_auc_score"] <= 1.0
    assert 0.0 <= d_metrics["brier_calibration_loss"] <= 1.0
    print("ML Dataset Trainer Test Passed: ROC-AUC =", d_metrics["roc_auc_score"], "Brier Loss =", d_metrics["brier_calibration_loss"])

if __name__ == "__main__":
    test_adamic_adar_link_prediction()
    test_money_laundering_cycle_detection()
    test_network_articulation_points()
    test_bayesian_culpability_model()
    test_markov_threat_forecasting()
    test_ml_dataset_trainer_evaluation()
    print("\nAll Graph ML & Bayesian Prediction Tests Passed Successfully!")
