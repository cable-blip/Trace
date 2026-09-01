"""
NetworkX Graph Repository Implementation with SQLite Dual-Layer Sync.
"""

import networkx as nx
from typing import List, Optional, Dict, Any
from app.models.schema import Node, Edge, GraphData, CentralityMetrics, CommunityResult
from app.repositories.base import GraphRepository
from app.repositories.sqlite_repo import SQLiteRepository

class NetworkXGraphRepository(GraphRepository):
    def __init__(self, case_id: Optional[str] = None):
        self.case_id = case_id
        self.graph = nx.MultiDiGraph()
        self._nodes_map: Dict[str, Node] = {}
        self._edges_list: List[Edge] = []
        self._sqlite = SQLiteRepository.get_instance()

    def add_node(self, node: Node) -> None:
        self._nodes_map[node.id] = node
        extra_attrs = {k: v for k, v in node.attributes.items() if k != "type"}
        self.graph.add_node(
            node.id,
            type=node.type,
            label=node.label,
            confidence=node.confidence,
            is_possible_duplicate=node.is_possible_duplicate,
            **extra_attrs
        )
        if self.case_id:
            self._sqlite.save_node(node, self.case_id)

    def add_edge(self, edge: Edge) -> None:
        if not edge.id:
            edge.id = f"edge_{len(self._edges_list) + 1}"
        self._edges_list.append(edge)
        self.graph.add_edge(
            edge.source,
            edge.target,
            key=edge.id,
            type=edge.type,
            confidence=edge.confidence,
            source_document=edge.source_document,
            timestamp=edge.timestamp,
            extraction_method=edge.extraction_method,
            evidence=edge.evidence,
            **edge.attributes
        )
        if self.case_id:
            self._sqlite.save_edge(edge, self.case_id)

    def get_node(self, node_id: str) -> Optional[Node]:
        return self._nodes_map.get(node_id)

    def get_neighbors(self, node_id: str, depth: int = 1) -> GraphData:
        if node_id not in self.graph:
            return GraphData(nodes=[], edges=[])

        visited_nodes = {node_id}
        current_layer = {node_id}

        for _ in range(depth):
            next_layer = set()
            for n in current_layer:
                neighbors = set(self.graph.successors(n)).union(set(self.graph.predecessors(n)))
                next_layer.update(neighbors)
            next_layer -= visited_nodes
            visited_nodes.update(next_layer)
            current_layer = next_layer

        return self.get_subgraph(list(visited_nodes))

    def get_subgraph(self, node_ids: List[str]) -> GraphData:
        nodes = [self._nodes_map[nid] for nid in node_ids if nid in self._nodes_map]
        node_set = set(node_ids)
        edges = [e for e in self._edges_list if e.source in node_set and e.target in node_set]
        return GraphData(nodes=nodes, edges=edges)

    def get_all(self) -> GraphData:
        return GraphData(
            nodes=list(self._nodes_map.values()),
            edges=self._edges_list
        )

    def calculate_centrality(self) -> CentralityMetrics:
        if len(self.graph) == 0:
            return CentralityMetrics(degree_centrality={}, betweenness_centrality={}, pagerank={})

        degree = nx.degree_centrality(self.graph)
        undirected_g = self.graph.to_undirected()
        betweenness = nx.betweenness_centrality(undirected_g)
        try:
            pr = nx.pagerank(self.graph, alpha=0.85)
        except Exception:
            pr = {n: 1.0 / len(self.graph) for n in self.graph.nodes()}

        return CentralityMetrics(
            degree_centrality=degree,
            betweenness_centrality=betweenness,
            pagerank=pr
        )

    def detect_communities(self) -> List[CommunityResult]:
        if len(self.graph) == 0:
            return []

        undirected_g = self.graph.to_undirected()
        try:
            import networkx.algorithms.community as nx_comm
            communities_gen = nx_comm.louvain_communities(undirected_g, seed=42)
            results = []
            for i, comm in enumerate(communities_gen):
                results.append(CommunityResult(community_id=i, members=list(comm)))
            return results
        except Exception:
            connected = nx.connected_components(undirected_g)
            results = []
            for i, comp in enumerate(connected):
                results.append(CommunityResult(community_id=i, members=list(comp)))
            return results

    def find_shortest_path(self, source_id: str, target_id: str, ignore_document_nodes: bool = True) -> List[str]:
        if source_id not in self.graph or target_id not in self.graph:
            return []

        undirected_g = self.graph.to_undirected()
        if ignore_document_nodes:
            doc_nodes = [n for n, d in self.graph.nodes(data=True) if d.get('type') == 'DOCUMENT']
            subgraph_nodes = [n for n in undirected_g.nodes() if n not in doc_nodes or n in (source_id, target_id)]
            undirected_g = undirected_g.subgraph(subgraph_nodes)

        try:
            return nx.shortest_path(undirected_g, source=source_id, target=target_id)
        except nx.NetworkXNoPath:
            return []

    def clear(self) -> None:
        self.graph.clear()
        self._nodes_map.clear()
        self._edges_list.clear()
