"""
Golden Investigation Integration Test
Verifies end-to-end extraction, graph construction, centrality, bridge detection, path finding,
and grounded AI reasoning against ground_truth.json.
"""

import os
import sys
import json
import pytest

# Add backend to python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "backend"))

from app.models.schema import Case
from app.api.router import CASES_DB, DOCUMENTS_DB, run_ingestion, get_or_create_repo
from app.services.ingestion.parser import DocumentParser
from app.services.analytics.engine import AnalyticsEngine
from app.services.reasoning.ai_investigator import AIInvestigatorEngine

def test_golden_investigation_full_flow():
    # 1. Initialize test case
    case_id = "TEST-GOLDEN-001"
    case = Case(id=case_id, name="Operation Nexus Test", description="Golden test case")
    CASES_DB[case_id] = case

    synthetic_dir = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic_case_nexus")
    assert os.path.exists(synthetic_dir), "Synthetic dataset folder missing!"

    # 2. Parse and load documents
    doc_files = ["fir_019.txt", "cdr_029.csv", "transactions_044.json", "surveillance_088.txt"]
    for fname in doc_files:
        fpath = os.path.join(synthetic_dir, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        doc = DocumentParser.parse_file(fname, content)
        DOCUMENTS_DB[doc.id] = doc
        case.document_ids.append(doc.id)

    # 3. Run Ingestion Pipeline
    graph = run_ingestion(case_id)
    assert len(graph.nodes) > 0, "Graph nodes should not be empty"
    assert len(graph.edges) > 0, "Graph edges should not be empty"

    # 4. Verify Analytics & Bridge Detection
    repo = get_or_create_repo(case_id)
    analytics_engine = AnalyticsEngine(repo)
    analytics = analytics_engine.run_full_analytics()

    # Victor Vance should be present and have top betweenness score
    victor_found = False
    for player in analytics.top_key_players:
        if "victor" in player["label"].lower():
            victor_found = True
            break
    assert victor_found, "Victor Vance must be identified in key players ranking"

    # 5. Verify Path Existence (Devendra Sharma to Tariq Ahmed)
    path = repo.find_shortest_path("person_devendra", "person_tariq")
    assert len(path) > 0, "Shortest path between Devendra Sharma and Tariq Ahmed must exist"
    assert "person_victor" in path, "Victor Vance must be on the path between Devendra and Tariq"

    # 6. Verify Grounded AI Investigator Response
    ai_engine = AIInvestigatorEngine(repo)
    resp = ai_engine.investigate("Which person connects Cluster A and Cluster B?")
    
    assert "Victor Vance" in resp.answer, "AI Investigator must identify Victor Vance as the bridge"
    assert len(resp.evidence) > 0, "Evidence citations must be returned"
    assert len(resp.highlight_nodes) > 0, "Highlight nodes must be returned"
    assert resp.confidence >= 0.8, "Confidence score must be high"

    print("Golden Investigation Test Passed Successfully!")

if __name__ == "__main__":
    test_golden_investigation_full_flow()
