export type NodeType = 
  | 'PERSON' 
  | 'PHONE' 
  | 'EMAIL' 
  | 'VEHICLE' 
  | 'LOCATION' 
  | 'ORGANIZATION' 
  | 'ACCOUNT' 
  | 'TRANSACTION' 
  | 'CASE' 
  | 'EVENT' 
  | 'DOCUMENT' 
  | 'SOCIAL_ACCOUNT';

export type RelationshipType = 
  | 'CALLED' 
  | 'CONTACTED' 
  | 'LOCATED_AT' 
  | 'TRAVELLED_TO' 
  | 'OWNED' 
  | 'OWNS'
  | 'REGISTERED_TO' 
  | 'TRANSFERRED_TO' 
  | 'WORKS_FOR' 
  | 'ASSOCIATED_WITH' 
  | 'RELATED_TO' 
  | 'PARTICIPATED_IN' 
  | 'MENTIONED_IN' 
  | 'PAID' 
  | 'RECEIVED' 
  | 'CONNECTED_TO'
  | 'USES'
  | 'OPERATES'
  | 'OPERATES_FROM'
  | 'DISPATCHED'
  | 'INTERCEPTED_AT'
  | 'COORDINATES_WITH'
  | 'DEPOSITED_TO'
  | string;

export interface Node {
  id: string;
  type: NodeType;
  label: string;
  confidence: number;
  attributes?: Record<string, any>;
  is_possible_duplicate?: boolean;
  canonical_id?: string;
  created_at?: string;
}

export interface Edge {
  id?: string;
  source: string;
  target: string;
  type: RelationshipType;
  confidence: number;
  source_document: string;
  timestamp?: string;
  extraction_method?: string;
  evidence?: string;
  attributes?: Record<string, any>;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export interface Case {
  id: string;
  name: string;
  description: string;
  created_at: string;
  document_ids: string[];
  node_count: number;
  edge_count: number;
}

export interface KeyPlayer {
  id: string;
  label: string;
  type: NodeType;
  composite_score: number;
  degree_centrality: number;
  betweenness_centrality: number;
  pagerank: number;
}

export interface AnalyticsResponse {
  centrality: {
    degree_centrality: Record<string, number>;
    betweenness_centrality: Record<string, number>;
    pagerank: Record<string, number>;
  };
  communities: Array<{
    community_id: number;
    members: string[];
  }>;
  top_key_players: KeyPlayer[];
}

export interface InvestigatorResponse {
  answer: string;
  query: Record<string, any>;
  results: Array<Record<string, any>>;
  evidence: string[];
  highlight_nodes: string[];
  highlight_edges: string[];
  confidence: number;
}

export interface EvidenceDocument {
  id: string;
  filename: string;
  file_type: string;
  content: string;
  uploaded_at: string;
}
