"""
Analytics Engine for Key Player Ranking, Centrality Scoring, Community Clusters, and Path Analysis
"""

from typing import List, Dict, Any
from app.models.schema import AnalyticsResponse, CentralityMetrics, CommunityResult
from app.repositories.base import GraphRepository

class AnalyticsEngine:
    def __init__(self, repo: GraphRepository):
        self.repo = repo

    def run_full_analytics(self) -> AnalyticsResponse:
        centrality = self.repo.calculate_centrality()
        communities = self.repo.detect_communities()
        
        # Calculate composite score for Key Player Ranking
        # Composite = 0.4 * degree + 0.4 * betweenness + 0.2 * pagerank
        top_players = []
        all_nodes = self.repo.get_all().nodes

        for node in all_nodes:
            d_score = centrality.degree_centrality.get(node.id, 0.0)
            b_score = centrality.betweenness_centrality.get(node.id, 0.0)
            p_score = centrality.pagerank.get(node.id, 0.0)
            
            composite_score = (0.4 * d_score) + (0.4 * b_score) + (0.2 * p_score)
            
            top_players.append({
                "id": node.id,
                "label": node.label,
                "type": node.type,
                "composite_score": round(composite_score, 4),
                "degree_centrality": round(d_score, 4),
                "betweenness_centrality": round(b_score, 4),
                "pagerank": round(p_score, 4)
            })

        # Sort descending by composite score
        top_players.sort(key=lambda x: x["composite_score"], reverse=True)

        return AnalyticsResponse(
            centrality=centrality,
            communities=communities,
            top_key_players=top_players
        )
