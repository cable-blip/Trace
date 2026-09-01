"""
Comprehensive Full-Fledged Backend Test Suite for Antigravity Criminal Intelligence Platform.
Tests SQLite Persistence, Universal ETL, Spatio-Temporal Convoys, Cross-Case Cartels, and AI Interrogation.
"""

import os
import sys
import unittest
from datetime import datetime

# Add apps/backend to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "backend"))

from app.models.schema import Case, Document, Node, Edge, GraphData
from app.repositories.sqlite_repo import SQLiteRepository
from app.repositories.networkx_repo import NetworkXGraphRepository
from app.services.ingestion.universal_etl import UniversalETLEngine
from app.services.analytics.spatio_temporal_engine import SpatioTemporalEngine
from app.services.analytics.cross_case_linker import CrossCaseLinker
from app.services.reasoning.interrogation_engine import InterrogationEngine

class TestBackendFullFledged(unittest.TestCase):
    def setUp(self):
        self.sqlite = SQLiteRepository.get_instance()
        with self.sqlite._lock, self.sqlite._get_connection() as conn:
            conn.execute("DELETE FROM edges WHERE case_id = 'CASE-TEST-999'")
            conn.execute("DELETE FROM nodes WHERE case_id = 'CASE-TEST-999'")
            conn.execute("DELETE FROM cases WHERE id = 'CASE-TEST-999'")

    def test_sqlite_persistence_cases_and_graph(self):
        """Tests saving and retrieving cases, nodes, and edges in SQLite database."""
        test_case_id = "CASE-TEST-999"
        case = Case(
            id=test_case_id,
            name="Test Operation Phantom",
            description="Automated persistence test case",
            node_count=2,
            edge_count=1
        )
        self.sqlite.save_case(case)

        # Verify case retrieval
        retrieved = self.sqlite.get_case(test_case_id)
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.name, "Test Operation Phantom")

        # Save Nodes and Edges
        n1 = Node(id="suspect_alpha", type="PERSON", label="Alpha Kingpin", confidence=0.99)
        n2 = Node(id="suspect_beta", type="PERSON", label="Beta Courier", confidence=0.95)
        e1 = Edge(
            source="suspect_alpha",
            target="suspect_beta",
            type="COORDINATES_WITH",
            confidence=0.96,
            source_document="test_doc.txt",
            timestamp="2026-05-01T12:00:00",
            evidence="Intercepted test wiretap"
        )

        self.sqlite.save_node(n1, test_case_id)
        self.sqlite.save_node(n2, test_case_id)
        self.sqlite.save_edge(e1, test_case_id)

        # Retrieve graph
        gdata = self.sqlite.get_graph(test_case_id)
        self.assertEqual(len(gdata.nodes), 2)
        self.assertEqual(len(gdata.edges), 1)
        self.assertEqual(gdata.nodes[0].id, "suspect_alpha")
        print("[PASS] SQLite Persistence Test Passed: Cases & Multi-table Graphs Stored & Retrieved.")

    def test_universal_etl_cdr_and_swift(self):
        """Tests universal multi-modal ETL engine on CDR CSV and SWIFT banking data."""
        # 1. Test CDR CSV
        cdr_content = """caller,callee,duration,cell_tower,timestamp
+91-98111-11111,+91-98222-22222,180,TOWER_COLABA_409,2026-05-10T02:30:00
+91-98222-22222,+91-98333-33333,45,TOWER_NHAVA_02,2026-05-10T03:15:00
"""
        doc_cdr = Document(
            id="doc_cdr_01",
            filename="call_records.csv",
            file_type="csv",
            content=cdr_content
        )
        nodes_cdr, edges_cdr = UniversalETLEngine.process_document(doc_cdr)
        self.assertGreater(len(nodes_cdr), 2)
        self.assertGreater(len(edges_cdr), 1)
        self.assertTrue(any(e.type == "CALLED" for e in edges_cdr))
        print("[PASS] Universal ETL Telecom CDR Test Passed: Extracted Caller, Callee & Cell Tower Nodes.")

        # 2. Test SWIFT Ledger JSON
        swift_content = """[
            {"source_account": "ACC_DUBAI_77", "target_account": "ACC_MUMBAI_88", "amount": 2500000, "type": "HAWALA_REMITTANCE", "bank": "Emirates Exchange"},
            {"source_account": "ACC_MUMBAI_88", "target_account": "ACC_GOA_99", "amount": 1200000, "type": "MULE_LAYER", "bank": "Cooperative Vault"}
        ]"""
        doc_swift = Document(
            id="doc_swift_01",
            filename="hawala_ledger.json",
            file_type="json",
            content=swift_content
        )
        nodes_swift, edges_swift = UniversalETLEngine.process_document(doc_swift)
        self.assertGreater(len(nodes_swift), 2)
        self.assertTrue(any(e.type == "TRANSFERRED_TO" for e in edges_swift))
        print("[PASS] Universal ETL Financial SWIFT Ledger Test Passed: Extracted Account & Wire Edges.")

    def test_spatio_temporal_convoy_detection(self):
        """Tests vehicle convoy trajectory detection within temporal threshold."""
        g = GraphData(
            nodes=[
                Node(id="veh_truck_1", type="VEHICLE", label="MH-04-AB-1234"),
                Node(id="veh_sedan_2", type="VEHICLE", label="KA-01-MJ-9999"),
                Node(id="loc_toll_vashi", type="LOCATION", label="Vashi Toll Plaza")
            ],
            edges=[
                Edge(source="veh_truck_1", target="loc_toll_vashi", type="TRAVELLED_TO", timestamp="2026-05-10T03:14:00", source_document="anpr.csv"),
                Edge(source="veh_sedan_2", target="loc_toll_vashi", type="TRAVELLED_TO", timestamp="2026-05-10T03:15:10", source_document="anpr.csv"), # 70s gap (convoy!)
            ]
        )
        convoys = SpatioTemporalEngine.detect_convoys(g, max_time_gap_seconds=120)
        self.assertEqual(len(convoys), 1)
        self.assertEqual(convoys[0]["time_gap_seconds"], 70.0)
        print("[PASS] Spatio-Temporal Convoy Detection Test Passed: 70s Vehicle Convoy Identified.")

    def test_cross_case_cartel_fusion(self):
        """Tests identifying shared conspirators/accounts across distinct cases."""
        case_graphs = {
            "CASE-001": GraphData(
                nodes=[
                    Node(id="p1", type="PERSON", label="Devendra Sharma"),
                    Node(id="acc_shared", type="ACCOUNT", label="SWIFT-ACC-111222")
                ],
                edges=[]
            ),
            "CASE-002": GraphData(
                nodes=[
                    Node(id="p2", type="PERSON", label="Karan Mehra"),
                    Node(id="acc_shared_c2", type="ACCOUNT", label="SWIFT-ACC-111222") # Shared account!
                ],
                edges=[]
            )
        }
        links = CrossCaseLinker.discover_transnational_links(case_graphs)
        self.assertGreater(len(links), 0)
        self.assertEqual(links[0]["entity_label"], "SWIFT-ACC-111222")
        self.assertIn("CASE-001", links[0]["linked_cases"])
        self.assertIn("CASE-002", links[0]["linked_cases"])
        print("[PASS] Cross-Case Cartel Fusion Test Passed: Discovered Umbrella Bridge Account.")

    def test_ai_interrogation_simulation(self):
        """Tests suspect dialogue simulation with biometric stress and confession escalation."""
        repo = NetworkXGraphRepository()
        repo.add_node(Node(id="person_devendra", type="PERSON", label="Devendra Sharma"))

        # Initial mild questioning
        res1 = InterrogationEngine.interrogate_suspect(
            suspect_id="person_devendra",
            question="What is your business?",
            evidence_presented=[],
            current_stress=20,
            repo=repo
        )
        self.assertLess(res1["stress_level"], 50)
        self.assertFalse(res1["confession_triggered"])

        # Severe confrontation with hard evidence
        res2 = InterrogationEngine.interrogate_suspect(
            suspect_id="person_devendra",
            question="We have your DNA at the container and your SWIFT bank transfer of 2.4 Cr!",
            evidence_presented=["dna_lab_match.pdf", "swift_wire_tx.json", "toll_anpr.csv"],
            current_stress=50,
            repo=repo
        )
        self.assertGreater(res2["stress_level"], 80)
        self.assertTrue(res2["confession_triggered"])
        self.assertGreater(res2["heart_rate_bpm"], 130)
        print("[PASS] AI Suspect Interrogation Simulation Test Passed: Biometric Stress Escalation & Confession.")

if __name__ == "__main__":
    unittest.main()
