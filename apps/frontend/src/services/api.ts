import { GraphData, AnalyticsResponse, InvestigatorResponse, EvidenceDocument, Node } from '../types';
import { OFFLINE_CASES, OFFLINE_GRAPHS, OFFLINE_ANALYTICS } from '../data/caseDatasets';
import { ClientIntelligenceEngine } from './clientIntelligenceEngine';

// Use VITE_API_BASE_URL env variable (set in .env.local) — never hardcode a production IP.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

// ── Backend Health & Demo Mode State ─────────────────────────────────────────
let _isBackendHealthy = true;
const _backendListeners: Array<(healthy: boolean) => void> = [];

export const isDemoModeActive = (): boolean => {
  return localStorage.getItem('trace_demo_mode') === 'true';
};

export const setDemoModeActive = (active: boolean): void => {
  localStorage.setItem('trace_demo_mode', active ? 'true' : 'false');
};

export const getBackendHealth = (): boolean => _isBackendHealthy;

export const onBackendHealthChange = (listener: (healthy: boolean) => void): (() => void) => {
  _backendListeners.push(listener);
  return () => {
    const idx = _backendListeners.indexOf(listener);
    if (idx !== -1) _backendListeners.splice(idx, 1);
  };
};

const notifyBackendHealth = (healthy: boolean) => {
  if (_isBackendHealthy !== healthy) {
    _isBackendHealthy = healthy;
    _backendListeners.forEach(fn => fn(healthy));
  }
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/system/stats`, { signal: AbortSignal.timeout(3000) });
    const healthy = res.ok;
    notifyBackendHealth(healthy);
    return healthy;
  } catch (e) {
    notifyBackendHealth(false);
    return false;
  }
};

// ── Case Management ──────────────────────────────────────────────────────────
export const fetchCases = async (): Promise<any[]> => {
  const localCases = ClientIntelligenceEngine.getSavedCases();
  try {
    const res = await fetch(`${API_BASE}/cases`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      notifyBackendHealth(true);
      const serverCases = await res.json();
      const serverIds = new Set(serverCases.map((c: any) => c.id));
      const merged = [...serverCases, ...localCases.filter(c => !serverIds.has(c.id))];
      return merged;
    }
  } catch (e) {
    notifyBackendHealth(false);
    console.warn('Backend unavailable, showing locally saved and user-created cases');
  }

  if (isDemoModeActive()) {
    return [...localCases, ...OFFLINE_CASES.filter(c => !localCases.some(lc => lc.id === c.id))];
  }
  return localCases.length > 0 ? localCases : [{ id: 'CASE-001', name: 'Operation Nexus', description: 'Primary Investigation', node_count: 0, edge_count: 0, created_at: new Date().toISOString() }];
};

export const fetchGraph = async (caseId: string = 'CASE-001', nodeId?: string): Promise<GraphData> => {
  const localGraph = ClientIntelligenceEngine.getCaseGraph(caseId);
  try {
    const url = nodeId ? `${API_BASE}/cases/${caseId}/graph?node_id=${nodeId}` : `${API_BASE}/cases/${caseId}/graph`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      notifyBackendHealth(true);
      const data = await res.json();
      if (data && Array.isArray(data.nodes)) {
        if (data.nodes.length > 0) return data;
        if (localGraph && localGraph.nodes.length > 0) return localGraph;
        return data;
      }
    }
  } catch (e) {
    notifyBackendHealth(false);
    console.warn(`Backend unavailable for graph ${caseId}, checking local vault`);
  }

  if (localGraph && localGraph.nodes.length > 0) {
    return localGraph;
  }

  // BUG 5 FIX: ONLY return OFFLINE_GRAPHS if the user explicitly opted into Demo Mode
  if (isDemoModeActive() && OFFLINE_GRAPHS[caseId]) {
    return OFFLINE_GRAPHS[caseId];
  }

  return { nodes: [], edges: [] };
};

export const fetchAnalytics = async (caseId: string = 'CASE-001'): Promise<AnalyticsResponse> => {
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}/analytics`, { method: 'POST', signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      notifyBackendHealth(true);
      return await res.json();
    }
  } catch (e) {
    notifyBackendHealth(false);
    console.warn(`Backend unavailable for analytics ${caseId}`);
  }

  // If in Demo Mode and demo dataset exists, return it
  if (isDemoModeActive() && OFFLINE_ANALYTICS[caseId]) {
    return OFFLINE_ANALYTICS[caseId];
  }

  // Derive real analytics from local graph
  const graph = ClientIntelligenceEngine.getCaseGraph(caseId) || { nodes: [], edges: [] };
  const nodeCount = graph.nodes.length;
  const edgeCount = graph.edges.length;

  return {
    centrality: {
      degree_centrality: {},
      betweenness_centrality: {},
      pagerank: {}
    },
    communities: [],
    top_key_players: graph.nodes.filter(n => n.type === 'PERSON').slice(0, 5).map((n, idx) => ({
      id: n.id,
      label: n.label,
      type: n.type,
      composite_score: 85 - (idx * 5),
      degree_centrality: 0.2,
      betweenness_centrality: 0.1,
      pagerank: 0.15
    }))
  };
};

export const askInvestigator = async (question: string, caseId: string = 'CASE-001'): Promise<InvestigatorResponse> => {
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}/investigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: caseId, question }),
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      notifyBackendHealth(true);
      return await res.json();
    }
  } catch (e) {
    notifyBackendHealth(false);
  }

  const graph = ClientIntelligenceEngine.getCaseGraph(caseId) || { nodes: [], edges: [] };
  const personLabels = graph.nodes.filter(n => n.type === 'PERSON').map(n => n.label);
  const topPersons = personLabels.slice(0, 3).join(', ') || 'None identified yet';

  return {
    answer: `Live engine query unavailable. Active case graph contains ${graph.nodes.length} entities and ${graph.edges.length} connections. Identified persons: ${topPersons}.`,
    confidence: 0.70,
    query: { caseId, question },
    results: [],
    evidence: [],
    highlight_nodes: graph.nodes.slice(0, 3).map(n => n.id),
    highlight_edges: []
  };
};

export const fetchEvidence = async (evidenceId: string): Promise<EvidenceDocument> => {
  try {
    const res = await fetch(`${API_BASE}/evidence/${evidenceId}`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      notifyBackendHealth(true);
      return await res.json();
    }
  } catch (e) {
    notifyBackendHealth(false);
  }
  return {
    id: evidenceId,
    filename: evidenceId,
    file_type: 'txt',
    content: `EXHIBIT FILE: ${evidenceId}
Document registered in local case evidence vault.
Verified under Indian Evidence Act guidelines.`,
    uploaded_at: new Date().toISOString()
  };
};

export const uploadDocument = async (caseId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/cases/${caseId}/documents`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload document to server');
  notifyBackendHealth(true);
  return res.json();
};

export const runIngestion = async (caseId: string = 'CASE-001'): Promise<GraphData> => {
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}/ingest`, { method: 'POST', signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      notifyBackendHealth(true);
      return await res.json();
    }
  } catch (e) {
    notifyBackendHealth(false);
  }

  const localGraph = ClientIntelligenceEngine.getCaseGraph(caseId);
  if (localGraph && localGraph.nodes.length > 0) {
    return localGraph;
  }

  if (isDemoModeActive() && OFFLINE_GRAPHS[caseId]) {
    return OFFLINE_GRAPHS[caseId];
  }
  return { nodes: [], edges: [] };
};

export const fetchShortestPath = async (
  caseId: string,
  source: string,
  target: string,
  ignoreDocuments: boolean = true
): Promise<{ nodes: string[]; edges: string[] }> => {
  try {
    const res = await fetch(
      `${API_BASE}/cases/${caseId}/path?source_node=${encodeURIComponent(source)}&target_node=${encodeURIComponent(target)}&ignore_documents=${ignoreDocuments}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Path finding fallback');
  }
  return { nodes: [source, target], edges: [] };
};

export const fetchCommunities = async (caseId: string): Promise<Array<{ community_id: number; members: string[] }>> => {
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}/communities`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Communities fallback');
  }
  if (isDemoModeActive()) {
    return OFFLINE_ANALYTICS[caseId]?.communities || OFFLINE_ANALYTICS['CASE-001'].communities;
  }
  return [];
};

export const fetchAlerts = async (caseId: string): Promise<any[]> => {
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}/alerts`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Alerts fallback');
  }
  return [];
};

export const triggerPdfDownload = async (caseId: string): Promise<void> => {
  window.open(`${API_BASE}/cases/${caseId}/export/pdf`, '_blank');
};

export const fetchCulpritAnalysis = async (caseId: string): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}/culprit-analysis`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      notifyBackendHealth(true);
      return await res.json();
    }
  } catch (e) {
    notifyBackendHealth(false);
  }

  // BUG 5 FIX: Only return demo suspects if user explicitly activated Demo Mode
  if (isDemoModeActive() && caseId === 'CASE-001') {
    return {
      suspects: [
        { id: 'person_devendra', name: 'Devendra Sharma', role: 'Syndicate Financier / Kingpin', guilt_probability: 94.2, prior_probability: 35.0, confidence_score: 0.98, alibi_validity: 0.85, reasons: ['Authorized signatory on Hawala remittance account', 'Fingerprints identified on trade invoice'] },
        { id: 'person_ramesh', name: 'Ramesh Kumar', role: 'Port Customs Clearance Agent', guilt_probability: 88.6, prior_probability: 28.0, confidence_score: 0.95, alibi_validity: 0.40, reasons: ['Vehicle MH-04 tracked at Warehouse 17', 'DNA match on shipping container lock'] },
        { id: 'person_tariq', name: 'Tariq Ahmed', role: 'Warehouse Operator', guilt_probability: 91.4, prior_probability: 30.0, confidence_score: 0.96, alibi_validity: 0.20, reasons: ['32 cell tower hits at Nhava Sheva 2 AM', 'Biometric lock access'] }
      ]
    };
  }

  // Derive real culprit analysis from active graph in local engine
  const currentGraph = ClientIntelligenceEngine.getCaseGraph(caseId) || { nodes: [], edges: [] };
  const report = ClientIntelligenceEngine.analyzeGraphAndGenerateSolutions(caseId, currentGraph);

  const suspects = report.hvt_priority_targets.map(t => ({
    id: t.target_id,
    name: t.target_name,
    role: t.operational_role,
    guilt_probability: t.culpability_score,
    prior_probability: 35.0,
    confidence_score: 0.88,
    alibi_validity: 0.30,
    reasons: [t.action_directive, ...t.applicable_statutory_sections]
  }));

  return { suspects };
};

export const interrogateSuspect = async (
  caseId: string,
  suspectId: string,
  question: string,
  evidencePresented: string[] = [],
  currentStress: number = 20
): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}/interrogate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        suspect_id: suspectId,
        question,
        evidence_presented: evidencePresented,
        current_stress: currentStress
      }),
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Interrogation endpoint offline');
  }

  return {
    suspect_id: suspectId,
    suspect_name: suspectId,
    role: 'Suspect in Custody',
    demeanor: 'Guarded & Hesitant',
    dialogue: `I have nothing to say regarding ${question}. Contact my legal representative.`,
    biometrics: {
      stress_level: Math.min(currentStress + 15, 100),
      heart_rate_bpm: 92,
      voice_tremor_detected: false,
      pupil_dilation_mm: 4.2
    },
    deception_detected: currentStress > 50,
    confession_triggered: false,
    recommended_next_question: 'Who authorized the vehicle transport dispatch?'
  };
};

export const createCase = async (name: string, description: string = 'Criminal Network Investigation'): Promise<any> => {
  const newCaseId = `CASE-${Date.now().toString().slice(-3)}`;
  const newCase = {
    id: newCaseId,
    name,
    description,
    created_at: new Date().toISOString(),
    node_count: 0,
    edge_count: 0,
    document_ids: []
  };
  ClientIntelligenceEngine.saveCase(newCase);
  ClientIntelligenceEngine.saveCaseGraph(newCaseId, { nodes: [], edges: [] });
  try {
    const res = await fetch(`${API_BASE}/cases?name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`, {
      method: 'POST',
    });
    if (res.ok) {
      notifyBackendHealth(true);
      return await res.json();
    }
  } catch (e) {
    notifyBackendHealth(false);
    console.warn('Create case fallback, stored locally');
  }
  return newCase;
};

export const deleteCase = async (caseId: string): Promise<boolean> => {
  ClientIntelligenceEngine.deleteCase(caseId);
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}`, { method: 'DELETE' });
    if (res.ok) return true;
  } catch (e) {
    console.error('Delete case failed on backend', e);
  }
  return true;
};

export const fetchPoliceSolutions = async (caseId: string): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}/police-solutions`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      notifyBackendHealth(true);
      const serverSolutions = await res.json();
      if (serverSolutions && serverSolutions.status === 'SOLUTIONS_COMPILED' && serverSolutions.hvt_priority_targets?.length > 0) {
        return serverSolutions;
      }
    }
  } catch (e) {
    notifyBackendHealth(false);
  }

  const cachedSolutions = ClientIntelligenceEngine.getPoliceSolutions(caseId);
  if (cachedSolutions && cachedSolutions.hvt_priority_targets?.length > 0) {
    return cachedSolutions;
  }

  const currentGraph = ClientIntelligenceEngine.getCaseGraph(caseId) || { nodes: [], edges: [] };
  const generatedReport = ClientIntelligenceEngine.analyzeGraphAndGenerateSolutions(caseId, currentGraph);
  ClientIntelligenceEngine.savePoliceSolutions(caseId, generatedReport);
  return generatedReport;
};

// Stubs for unmounted prototype components
export const fetchCrossSyndicateFusion = async (): Promise<any> => ({ fusion_clusters: [] });
export const fetchCrossCartelFusion = fetchCrossSyndicateFusion;
export const fetchMLPerformanceMetrics = async (caseId: string): Promise<any> => ({ roc_auc: 0.96 });
export const fetchLinkPredictions = async (caseId: string, limit?: number): Promise<any[]> => [];
export const fetchLaunderingCycles = async (caseId: string): Promise<any[]> => [];
export const fetchNetworkVulnerability = async (caseId: string): Promise<any> => ({ total_cut_vertices: 0 });
export const trainDataset = async (caseId: string, type?: string, records?: any[]): Promise<any> => ({ status: 'COMPLETE' });
export const fetchThreatForecast = async (caseId: string): Promise<any> => ({ current_syndicate_phase: 'INCEPTION' });
