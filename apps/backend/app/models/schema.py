"""
Canonical Pydantic Data Models for TRACE Criminal Network Analysis System
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

# Node Types & Relationship Types taxonomy — strict allowlists
NODE_TYPES = {
    "PERSON", "PHONE", "EMAIL", "VEHICLE", "LOCATION",
    "ORGANIZATION", "ACCOUNT", "TRANSACTION", "CASE",
    "EVENT", "DOCUMENT", "SOCIAL_ACCOUNT"
}

RELATIONSHIP_TYPES = {
    "CALLED", "CONTACTED", "LOCATED_AT", "TRAVELLED_TO", "OWNED", "OWNS",
    "REGISTERED_TO", "TRANSFERRED_TO", "WORKS_FOR", "ASSOCIATED_WITH",
    "RELATED_TO", "PARTICIPATED_IN", "MENTIONED_IN", "PAID",
    "RECEIVED", "CONNECTED_TO", "USES", "OPERATES", "OPERATES_FROM",
    "DISPATCHED", "INTERCEPTED_AT", "COORDINATES_WITH", "CONSIGNED_TO", "DEPOSITED_TO"
}

class Node(BaseModel):
    id: str = Field(max_length=256)
    type: str = Field(max_length=64)
    label: str = Field(max_length=512)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    attributes: Dict[str, Any] = Field(default_factory=dict)
    is_possible_duplicate: bool = False
    canonical_id: Optional[str] = Field(default=None, max_length=256)
    created_at: str = Field(default_factory=utc_now_iso)

    @field_validator("type")
    @classmethod
    def validate_node_type(cls, v: str) -> str:
        """Enforce node type against the canonical taxonomy allowlist."""
        upper_v = v.upper().strip()
        if upper_v not in NODE_TYPES:
            # Accept gracefully for flexibility but normalise to UNKNOWN
            return "UNKNOWN"
        return upper_v

class Edge(BaseModel):
    id: Optional[str] = Field(default=None, max_length=256)
    source: str = Field(max_length=256)
    target: str = Field(max_length=256)
    type: str = Field(max_length=64)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    source_document: str = Field(max_length=512)
    timestamp: str = Field(default_factory=utc_now_iso)
    extraction_method: str = Field(default="ner+rule", max_length=64)
    evidence: str = Field(default="", max_length=2048)
    attributes: Dict[str, Any] = Field(default_factory=dict)

    @field_validator("type")
    @classmethod
    def validate_edge_type(cls, v: str) -> str:
        """Enforce edge type against the canonical taxonomy allowlist."""
        upper_v = v.upper().strip()
        if upper_v not in RELATIONSHIP_TYPES:
            return "RELATED_TO"
        return upper_v

class Document(BaseModel):
    id: str
    filename: str
    file_type: str
    content: str
    uploaded_at: str = Field(default_factory=utc_now_iso)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class Case(BaseModel):
    id: str
    name: str
    description: str
    created_at: str = Field(default_factory=utc_now_iso)
    document_ids: List[str] = Field(default_factory=list)
    node_count: int = 0
    edge_count: int = 0

class GraphData(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class CentralityMetrics(BaseModel):
    degree_centrality: Dict[str, float]
    betweenness_centrality: Dict[str, float]
    pagerank: Dict[str, float]

class CommunityResult(BaseModel):
    community_id: int
    members: List[str]

class AnalyticsResponse(BaseModel):
    centrality: CentralityMetrics
    communities: List[CommunityResult]
    top_key_players: List[Dict[str, Any]]

class InvestigatorQueryRequest(BaseModel):
    case_id: str = Field(max_length=32)
    question: str = Field(max_length=1000)

class InvestigatorResponse(BaseModel):
    answer: str
    query: Dict[str, Any]
    results: List[Dict[str, Any]]
    evidence: List[str]
    highlight_nodes: List[str]
    highlight_edges: List[str]
    confidence: float
