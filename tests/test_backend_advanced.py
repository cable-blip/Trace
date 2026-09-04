"""
Comprehensive Advanced Backend Intelligence Test Suite for Antigravity Platform.
Tests ChargeSheet Generation, Red-Flag Scanners, 4D Timeline, Sanitization Gateway, and Ego-Subgraphs.
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "backend"))

from app.models.schema import Case, GraphData, Node, Edge
from app.repositories.networkx_repo import NetworkXGraphRepository
from app.services.export.chargesheet_generator import ChargeSheetGenerator
from app.services.intelligence.red_flag_engine import RedFlagEngine
from app.services.analytics.timeline_engine import TimelineEngine
from app.services.intelligence.sanitization_gateway import SanitizationGateway
from app.services.analytics.subgraph_engine import SubgraphEngine

class TestBackendAdvanced(unittest.TestCase):
    def setUp(self):
        self.case = Case(
            id="CASE-001",
            name="Operation Nexus",
            description="Primary smuggling and Hawala investigation"
        )
        self.nodes = [
            Node(id="person_devendra", type="PERSON", label="Devendra Sharma", confidence=0.98, attributes={"role": "Syndicate Kingpin"}),
            Node(id="person_ramesh", type="PERSON", label="Ramesh Kumar", confidence=0.95, attributes={"role": "Port Customs Clearance Agent"}),
            Node(id="person_informant", type="PERSON", label="Source Alpha (Informant)", confidence=0.90, attributes={"informant": True}),
            Node(id="phone_burner1", type="PHONE", label="+91-98000-00001", confidence=0.95),
            Node(id="phone_burner2", type="PHONE", label="+91-98000-00002", confidence=0.95),
            Node(id="phone_burner3", type="PHONE", label="+91-98000-00003", confidence=0.95),
            Node(id="account_vault", type="ACCOUNT", label="ACC-HAWALA-99", confidence=0.99),
            Node(id="loc_warehouse", type="LOCATION", label="Warehouse 17, Nhava Sheva", confidence=0.99)
        ]
        self.edges = [
            Edge(source="person_devendra", target="person_ramesh", type="COORDINATES_WITH", timestamp="2026-05-10T02:30:00", source_document="fir_019.txt", evidence="Customs clearance bribe recorded INR 25,00,000 via phone +919811122233"),
            Edge(source="person_devendra", target="phone_burner1", type="USES", timestamp="2026-05-01T00:00:00", source_document="cdr_001.csv"),
            Edge(source="person_devendra", target="phone_burner2", type="USES", timestamp="2026-05-02T00:00:00", source_document="cdr_001.csv"),
            Edge(source="person_devendra", target="phone_burner3", type="USES", timestamp="2026-05-03T00:00:00", source_document="cdr_001.csv"),
            Edge(source="account_vault", target="person_ramesh", type="TRANSFERRED_TO", timestamp="2026-05-10T03:00:00", source_document="tx_ledger.json", evidence="Hawala wire transfer"),
            Edge(source="account_vault", target="person_devendra", type="PAID", timestamp="2026-05-10T04:00:00", source_document="tx_ledger.json", evidence="Cash disbursement"),
            Edge(source="person_ramesh", target="loc_warehouse", type="TRAVELLED_TO", timestamp="2026-05-10T04:30:00", source_document="anpr_toll.csv", evidence="CCTV entry log")
        ]
        self.gdata = GraphData(nodes=self.nodes, edges=self.edges)

        self.repo = NetworkXGraphRepository()
        for n in self.nodes:
            self.repo.add_node(n)
        for e in self.edges:
            self.repo.add_edge(e)

    def test_chargesheet_generation(self):
        """Tests automated court-ready charge sheet generation with SHA-256 custody hashes."""
        cs = ChargeSheetGenerator.generate_chargesheet(self.case, self.gdata)
        self.assertEqual(cs["case_id"], "CASE-001")
        self.assertGreater(cs["accused_count"], 0)
        self.assertGreater(cs["total_exhibits_indexed"], 0)
        self.assertTrue(any(len(ex["sha256_chain_of_custody"]) == 64 for ex in cs["evidence_exhibits"]))
        print("[PASS] ChargeSheet Generator Test Passed: Court-ready dossier with SHA-256 exhibits.")

    def test_red_flag_anomaly_scanner(self):
        """Tests automated tactical anomaly and red-flag detection."""
        anomalies = RedFlagEngine.scan_anomalies(self.gdata)
        self.assertGreater(len(anomalies), 0)
        categories = {a["category"] for a in anomalies}
        self.assertIn("BURNER_PHONE_CHURN", categories)
        self.assertIn("FINANCIAL_SMURFING_BURST", categories)
        print("[PASS] Red-Flag Anomaly Scanner Test Passed: Detected Burner Churn & Smurfing Bursts.")

    def test_timeline_engine(self):
        """Tests chronological 4D event timeline construction."""
        tl = TimelineEngine.build_case_timeline(self.gdata)
        self.assertEqual(tl["total_timeline_events"], len(self.edges))
        # Ensure chronological ordering
        for i in range(len(tl["events"]) - 1):
            self.assertLessEqual(tl["events"][i]["timestamp"], tl["events"][i+1]["timestamp"])
        print("[PASS] 4D Timeline Engine Test Passed: Chronologically sequenced operational event stream.")

    def test_sanitization_gateway(self):
        """Tests inter-agency clearance-based HUMINT redaction and SIGINT masking."""
        res_confidential = SanitizationGateway.sanitize_case_dossier(
            case=self.case,
            graph_data=self.gdata,
            target_clearance="CONFIDENTIAL",
            recipient_agency="INTERPOL"
        )
        # Informant name must be redacted
        informant_nodes = [n for n in res_confidential["sanitized_graph"]["nodes"] if n["id"] == "person_informant"]
        self.assertTrue("[REDACTED_HUMINT_SOURCE" in informant_nodes[0]["label"])

        res_unclass = SanitizationGateway.sanitize_case_dossier(
            case=self.case,
            graph_data=self.gdata,
            target_clearance="UNCLASSIFIED",
            recipient_agency="PUBLIC_MEDIA"
        )
        # Phone and money amount must be masked
        ev = res_unclass["sanitized_graph"]["edges"][0]["evidence"]
        self.assertIn("[MASKED_AMOUNT]", ev)
        self.assertIn("[MASKED_PHONE]", ev)
        print("[PASS] Sanitization Gateway Test Passed: HUMINT Redaction & SIGINT Masking Verified.")

    def test_subgraph_and_flow_engine(self):
        """Tests k-hop ego subgraphs and minimum cut bottleneck calculations."""
        ego = SubgraphEngine.extract_ego_graph(self.repo, "person_devendra", radius=1)
        self.assertGreater(len(ego.nodes), 1)

        flow = SubgraphEngine.compute_max_flow_bottlenecks(self.repo, "account_vault", "loc_warehouse")
        self.assertEqual(flow["source"], "account_vault")
        self.assertEqual(flow["sink"], "loc_warehouse")
        self.assertIn("min_cut_capacity", flow)
        print("[PASS] Subgraph & Flow Engine Test Passed: Ego-networks and Min-Cut Bottlenecks computed.")

if __name__ == "__main__":
    unittest.main()
