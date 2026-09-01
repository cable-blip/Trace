"""
Temporal 4D Timeline Sequence Builder & Operational Chronology Engine.
Aggregates heterogeneous time-stamped intelligence into a unified interactive event stream.
"""

from typing import List, Dict, Any
from datetime import datetime, timezone
from app.models.schema import GraphData, Node, Edge

class TimelineEngine:
    @staticmethod
    def build_case_timeline(graph_data: GraphData) -> Dict[str, Any]:
        """
        Builds a chronological timeline of all actionable events in the criminal network.
        """
        events = []
        node_label_map = {n.id: n.label for n in graph_data.nodes}

        for edge in graph_data.edges:
            timestamp_str = edge.timestamp or datetime.now(timezone.utc).isoformat()
            try:
                dt = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
                formatted_time = dt.strftime("%Y-%m-%d %H:%M:%S")
            except Exception:
                formatted_time = timestamp_str

            src_label = node_label_map.get(edge.source, edge.source)
            tgt_label = node_label_map.get(edge.target, edge.target)

            events.append({
                "id": edge.id or f"evt_{edge.source}_{edge.target}",
                "timestamp": timestamp_str,
                "formatted_time": formatted_time,
                "source_id": edge.source,
                "source_label": src_label,
                "target_id": edge.target,
                "target_label": tgt_label,
                "event_type": edge.type,
                "evidence": edge.evidence or f"{src_label} {edge.type.lower().replace('_', ' ')} {tgt_label}",
                "source_document": edge.source_document,
                "confidence": edge.confidence
            })

        # Sort chronologically
        events.sort(key=lambda x: x["timestamp"])

        # Compute Operational Phase Metrics
        if events:
            first_event = events[0]["timestamp"]
            last_event = events[-1]["timestamp"]
        else:
            first_event = datetime.now(timezone.utc).isoformat()
            last_event = first_event

        return {
            "total_timeline_events": len(events),
            "operation_start_time": first_event,
            "operation_end_time": last_event,
            "events": events
        }
