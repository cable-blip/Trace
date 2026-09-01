"""
Advanced Subgraph & Ego-Network Extraction Engine.
Extracts localized k-hop ego subgraphs, maximum-flow min-cut bottlenecks, and backbone networks.
"""

import networkx as nx
from typing import List, Dict, Any, Optional
from app.models.schema import GraphData, Node, Edge
from app.repositories.base import GraphRepository

class SubgraphEngine:
    @staticmethod
    def extract_ego_graph(repo: GraphRepository, central_node_id: str, radius: int = 2) -> GraphData:
        """
        Extracts an ego network centered around a specific suspect/node up to radius k hops.
        """
        return repo.get_neighbors(central_node_id, depth=radius)

    @staticmethod
    def compute_max_flow_bottlenecks(repo: GraphRepository, source_id: str, sink_id: str) -> Dict[str, Any]:
        """
        Computes maximum flow capacity and minimum cut edges between a source kingpin and sink money vault.
        """
        if not hasattr(repo, "graph"):
            return {"status": "unavailable", "message": "Graph repository does not support flow analytics"}

        # Construct simple undirected graph with unit capacities
        simple_g = nx.Graph()
        for u, v in repo.graph.edges():
            simple_g.add_edge(u, v, capacity=1.0)

        if source_id not in simple_g or sink_id not in simple_g:
            return {"status": "error", "message": "Source or Sink node not connected in case network"}

        try:
            cut_value, partition = nx.minimum_cut(simple_g, source_id, sink_id)
            reachable, non_reachable = partition
            cutset = set()
            for u in reachable:
                for v in simple_g.neighbors(u):
                    if v in non_reachable:
                        cutset.add((u, v))

            return {
                "source": source_id,
                "sink": sink_id,
                "min_cut_capacity": cut_value,
                "bottleneck_cut_edges": [{"source": u, "target": v} for u, v in cutset],
                "partition_sizes": {"source_cluster_size": len(reachable), "sink_cluster_size": len(non_reachable)}
            }
        except Exception as ex:
            return {"status": "error", "message": str(ex)}
