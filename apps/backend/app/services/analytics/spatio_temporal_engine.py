"""
Spatio-Temporal Intelligence Engine for Antigravity Criminal Intelligence Platform.
Computes Vehicle Convoy Trajectories, Silent-Hour Call Bursts, and Cell Tower Intersections.
"""

from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta
from app.models.schema import GraphData, Node, Edge

class SpatioTemporalEngine:
    @staticmethod
    def detect_convoys(graph_data: GraphData, max_time_gap_seconds: int = 120) -> List[Dict[str, Any]]:
        """
        Detects convoy behavior where two or more distinct vehicles/suspects passed through
        the same location (toll gate / checkpoint) within a small time window.
        """
        location_visits: Dict[str, List[Dict[str, Any]]] = {}

        for edge in graph_data.edges:
            if edge.type in ("TRAVELLED_TO", "LOCATED_AT", "INTERCEPTED_AT"):
                loc_id = edge.target
                entity_id = edge.source
                timestamp_str = edge.timestamp

                try:
                    dt = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
                except Exception:
                    continue

                if loc_id not in location_visits:
                    location_visits[loc_id] = []

                location_visits[loc_id].append({
                    "entity_id": entity_id,
                    "location_id": loc_id,
                    "timestamp": dt,
                    "evidence": edge.evidence,
                    "source_doc": edge.source_document
                })

        convoys = []
        for loc_id, visits in location_visits.items():
            visits.sort(key=lambda x: x["timestamp"])
            n = len(visits)
            for i in range(n):
                for j in range(i + 1, n):
                    v1, v2 = visits[i], visits[j]
                    if v1["entity_id"] == v2["entity_id"]:
                        continue

                    gap_seconds = abs((v2["timestamp"] - v1["timestamp"]).total_seconds())
                    if gap_seconds <= max_time_gap_seconds:
                        convoys.append({
                            "location": loc_id,
                            "leader_entity": v1["entity_id"],
                            "follower_entity": v2["entity_id"],
                            "time_gap_seconds": round(gap_seconds, 1),
                            "leader_time": v1["timestamp"].isoformat(),
                            "follower_time": v2["timestamp"].isoformat(),
                            "confidence": max(0.6, 1.0 - (gap_seconds / max_time_gap_seconds) * 0.4),
                            "evidence": f"Convoy Detected: {v1['entity_id']} and {v2['entity_id']} arrived within {int(gap_seconds)}s at {loc_id}"
                        })

        return convoys

    @staticmethod
    def detect_silent_hour_bursts(graph_data: GraphData) -> List[Dict[str, Any]]:
        """
        Detects suspicious telecommunication surges during silent hours (01:00 AM - 05:00 AM).
        """
        silent_bursts = []
        for edge in graph_data.edges:
            if edge.type in ("CALLED", "CONTACTED"):
                try:
                    dt = datetime.fromisoformat(edge.timestamp.replace("Z", "+00:00"))
                    if 1 <= dt.hour <= 5:
                        silent_bursts.append({
                            "caller": edge.source,
                            "callee": edge.target,
                            "timestamp": edge.timestamp,
                            "hour": dt.hour,
                            "suspicion_score": 0.92,
                            "evidence": f"Silent Hour Call ({dt.strftime('%H:%M:%S')}): {edge.evidence or 'Intercepted night call'}"
                        })
                except Exception:
                    continue

        return silent_bursts
