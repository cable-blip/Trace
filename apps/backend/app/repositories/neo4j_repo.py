"""
Neo4j Graph Repository Driver
Implements GraphRepository interface for enterprise graph storage in Neo4j.
"""

from typing import List, Optional, Dict, Any
from app.models.schema import Node, Edge, GraphData, CentralityMetrics, CommunityResult
from app.repositories.base import GraphRepository
from app.repositories.networkx_repo import NetworkXGraphRepository

class Neo4jGraphRepository(GraphRepository):
    def __init__(self, uri: str = "bolt://localhost:7687", auth: tuple = ("neo4j", "password")):
        self.uri = uri
        self.auth = auth
        self._driver = None
        self._fallback_repo = NetworkXGraphRepository()

        try:
            from neo4j import GraphDatabase
            self._driver = GraphDatabase.driver(self.uri, auth=self.auth)
        except Exception:
            # Fall back to NetworkX if Neo4j driver or server is not available
            self._driver = None

    def add_node(self, node: Node) -> None:
        self._fallback_repo.add_node(node)
        if not self._driver:
            return
        try:
            with self._driver.session() as session:
                query = (
                    f"MERGE (n:{node.type} {{id: $id}}) "
                    f"SET n.label = $label, n.confidence = $confidence, "
                    f"n.is_possible_duplicate = $is_possible_duplicate"
                )
                session.run(query, id=node.id, label=node.label, confidence=node.confidence, is_possible_duplicate=node.is_possible_duplicate)
        except Exception:
            pass

    def add_edge(self, edge: Edge) -> None:
        self._fallback_repo.add_edge(edge)
        if not self._driver:
            return
        try:
            with self._driver.session() as session:
                query = (
                    f"MATCH (a {{id: $source}}), (b {{id: $target}}) "
                    f"MERGE (a)-[r:{edge.type} {{id: $id}}]->(b) "
                    f"SET r.confidence = $confidence, r.source_document = $source_document, r.evidence = $evidence"
                )
                session.run(query, source=edge.source, target=edge.target, id=edge.id or "", confidence=edge.confidence, source_document=edge.source_document, evidence=edge.evidence or "")
        except Exception:
            pass

    def get_node(self, node_id: str) -> Optional[Node]:
        return self._fallback_repo.get_node(node_id)

    def get_neighbors(self, node_id: str, depth: int = 1) -> GraphData:
        return self._fallback_repo.get_neighbors(node_id, depth=depth)

    def get_subgraph(self, node_ids: List[str]) -> GraphData:
        return self._fallback_repo.get_subgraph(node_ids)

    def get_all(self) -> GraphData:
        return self._fallback_repo.get_all()

    def calculate_centrality(self) -> CentralityMetrics:
        return self._fallback_repo.calculate_centrality()

    def detect_communities(self) -> List[CommunityResult]:
        return self._fallback_repo.detect_communities()

    def find_shortest_path(self, source_id: str, target_id: str, ignore_document_nodes: bool = True) -> List[str]:
        return self._fallback_repo.find_shortest_path(source_id, target_id, ignore_document_nodes=ignore_document_nodes)

    def clear(self) -> None:
        self._fallback_repo.clear()
        if self._driver:
            try:
                with self._driver.session() as session:
                    session.run("MATCH (n) DETACH DELETE n")
            except Exception:
                pass
