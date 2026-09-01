"""
Abstract GraphRepository interface for Antigravity Network Analysis.
Enables fast hackathon prototyping with NetworkX while remaining Neo4j ready.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.models.schema import Node, Edge, GraphData, CentralityMetrics, CommunityResult

class GraphRepository(ABC):

    @abstractmethod
    def add_node(self, node: Node) -> None:
        pass

    @abstractmethod
    def add_edge(self, edge: Edge) -> None:
        pass

    @abstractmethod
    def get_node(self, node_id: str) -> Optional[Node]:
        pass

    @abstractmethod
    def get_neighbors(self, node_id: str, depth: int = 1) -> GraphData:
        pass

    @abstractmethod
    def get_subgraph(self, node_ids: List[str]) -> GraphData:
        pass

    @abstractmethod
    def get_all(self) -> GraphData:
        pass

    @abstractmethod
    def calculate_centrality(self) -> CentralityMetrics:
        pass

    @abstractmethod
    def detect_communities(self) -> List[CommunityResult]:
        pass

    @abstractmethod
    def find_shortest_path(self, source_id: str, target_id: str, ignore_document_nodes: bool = True) -> List[str]:
        pass

    @abstractmethod
    def clear(self) -> None:
        pass
