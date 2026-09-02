import { Node, Edge, GraphData, Case } from '../types';

const PHONE_REGEX = /(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}|\b\d{10,12}\b/g;
const PLATE_REGEX = /\b[A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{1,3}[-\s]?\d{4}\b/g;
const ACCOUNT_REGEX = /\b(?:ACC|SWIFT|IBAN|VAULT|TOKEN)[-_][A-Z0-9]{4,16}\b/gi;

export interface PoliceSolutionDirective {
  directive_id: string;
  category: string;
  target: string;
  order: string;
  urgency: string;
  statutory_basis: string;
}

export interface HVTTarget {
  target_id: string;
  target_name: string;
  type: string;
  culpability_score: number;
  operational_role: string;
  threat_level: string;
  priority: string;
  direct_connections_count: number;
  action_directive: string;
  applicable_statutory_sections: string[];
  network_centrality_percentile: string;
}

export interface PoliceSolutionsReport {
  case_id: string;
  status: string;
  timestamp: string;
  total_entities_analyzed: number;
  total_connections_analyzed: number;
  hvt_priority_targets: HVTTarget[];
  actionable_directives: PoliceSolutionDirective[];
  takedown_bottlenecks: Array<{
    node_id: string;
    label: string;
    type: string;
    strategic_value: string;
    disruption_impact: string;
    recommended_takedown_method: string;
  }>;
  evidence_preservation_alerts: Array<{
    alert_type: string;
    title: string;
    details: string;
    action?: string;
  }>;
  operational_playbook_72h: Array<{
    timeframe: string;
    operation: string;
    steps: string[];
  }>;
  tactical_overview: string;
}

export class ClientIntelligenceEngine {
  private static STORAGE_PREFIX = 'trace_vault_';

  public static getSavedCases(): Case[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_PREFIX + 'cases');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Storage read error', e);
    }
    return [];
  }

  public static saveCase(newCase: Case): void {
    try {
      const existing = this.getSavedCases();
      const filtered = existing.filter(c => c.id !== newCase.id);
      localStorage.setItem(this.STORAGE_PREFIX + 'cases', JSON.stringify([newCase, ...filtered]));
    } catch (e) {
      console.warn('Storage write error', e);
    }
  }

  public static deleteCase(caseId: string): void {
    try {
      const existing = this.getSavedCases();
      const updated = existing.filter(c => c.id !== caseId);
      localStorage.setItem(this.STORAGE_PREFIX + 'cases', JSON.stringify(updated));
      localStorage.removeItem(this.STORAGE_PREFIX + 'graph_' + caseId);
      localStorage.removeItem(this.STORAGE_PREFIX + 'solutions_' + caseId);
    } catch (e) {
      console.warn('Storage delete error', e);
    }
  }

  public static getCaseGraph(caseId: string): GraphData | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_PREFIX + 'graph_' + caseId);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Graph read error', e);
    }
    return null;
  }

  public static saveCaseGraph(caseId: string, graph: GraphData): void {
    try {
      localStorage.setItem(this.STORAGE_PREFIX + 'graph_' + caseId, JSON.stringify(graph));
      const cases = this.getSavedCases();
      const targetCase = cases.find(c => c.id === caseId);
      if (targetCase) {
        targetCase.node_count = graph.nodes.length;
        targetCase.edge_count = graph.edges.length;
        this.saveCase(targetCase);
      }
    } catch (e) {
      console.warn('Graph write error', e);
    }
  }

  public static getPoliceSolutions(caseId: string): PoliceSolutionsReport | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_PREFIX + 'solutions_' + caseId);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Solutions read error', e);
    }
    return null;
  }

  public static savePoliceSolutions(caseId: string, report: PoliceSolutionsReport): void {
    try {
      localStorage.setItem(this.STORAGE_PREFIX + 'solutions_' + caseId, JSON.stringify(report));
    } catch (e) {
      console.warn('Solutions write error', e);
    }
  }

  public static extractFromText(text: string, docName: string = 'incident_dossier.txt'): GraphData {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeMap = new Map<string, Node>();

    const docId = 'doc_' + Date.now().toString().slice(-4);
    nodes.push({
      id: docId,
      type: 'DOCUMENT',
      label: docName,
      confidence: 1.0,
      attributes: { filename: docName, uploaded_at: new Date().toISOString() }
    });

    const phoneMatches = text.match(PHONE_REGEX) || [];
    for (const ph of phoneMatches) {
      const clean = ph.replace(/[^0-9]/g, '');
      if (clean.length >= 10) {
        const pId = 'phone_' + clean.slice(-10);
        if (!nodeMap.has(pId)) {
          nodeMap.set(pId, {
            id: pId,
            type: 'PHONE',
            label: ph.trim(),
            confidence: 0.98,
            attributes: { number: ph.trim() }
          });
        }
      }
    }

    const plateMatches = text.match(PLATE_REGEX) || [];
    for (const plate of plateMatches) {
      const vId = 'veh_' + plate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (!nodeMap.has(vId)) {
        nodeMap.set(vId, {
          id: vId,
          type: 'VEHICLE',
          label: plate.trim().toUpperCase(),
          confidence: 0.96,
          attributes: { plate: plate.trim() }
        });
      }
    }

    const accMatches = text.match(ACCOUNT_REGEX) || [];
    for (const acc of accMatches) {
      const aId = 'account_' + acc.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      if (!nodeMap.has(aId)) {
        nodeMap.set(aId, {
          id: aId,
          type: 'ACCOUNT',
          label: acc.trim().toUpperCase(),
          confidence: 0.97,
          attributes: { account: acc.trim() }
        });
      }
    }

    const namePatterns = [
      /(?:Accused|Suspect|Kingpin|Smuggler|Courier|Operative|Director|Target)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})/g,
      /([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})\s+(?:alias|s\/o|arrested|confessed|interrogated|remanded|transferred|called)/g
    ];

    for (const pat of namePatterns) {
      let match: RegExpExecArray | null;
      while ((match = pat.exec(text)) !== null) {
        const rawName = match[1]?.trim();
        if (rawName && rawName.length > 3) {
          const lower = rawName.toLowerCase();
          if (!['state of', 'police station', 'high court', 'crime branch', 'warehouse', 'terminal'].some(w => lower.includes(w))) {
            const pId = 'person_' + rawName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            if (!nodeMap.has(pId)) {
              nodeMap.set(pId, {
                id: pId,
                type: 'PERSON',
                label: rawName,
                confidence: 0.95,
                attributes: { extracted_name: rawName }
              });
            }
          }
        }
      }
    }

    if (Array.from(nodeMap.values()).filter(n => n.type === 'PERSON').length === 0) {
      const generalCaps = /([A-Z][a-z]{2,15}\s+[A-Z][a-z]{2,15})/g;
      let capMatch: RegExpExecArray | null;
      let capCount = 0;
      while ((capMatch = generalCaps.exec(text)) !== null && capCount < 4) {
        const name = capMatch[1];
        const lower = name.toLowerCase();
        if (!['first information', 'crime branch', 'special cell', 'police station', 'high court', 'new delhi', 'mumbai city'].includes(lower)) {
          const pId = 'person_' + name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
          if (!nodeMap.has(pId)) {
            nodeMap.set(pId, {
              id: pId,
              type: 'PERSON',
              label: name,
              confidence: 0.88,
              attributes: { fallback_ner: true }
            });
            capCount++;
          }
        }
      }
    }

    const allExtracted = Array.from(nodeMap.values());
    nodes.push(...allExtracted);

    for (const n of allExtracted) {
      edges.push({
        id: 'edge_' + n.id + '_' + docId,
        source: n.id,
        target: docId,
        type: 'MENTIONED_IN',
        confidence: 0.95,
        source_document: docName,
        evidence: 'Extracted from ' + docName
      });
    }

    const persons = allExtracted.filter(n => n.type === 'PERSON');
    const phones = allExtracted.filter(n => n.type === 'PHONE');
    const accounts = allExtracted.filter(n => n.type === 'ACCOUNT');
    const vehicles = allExtracted.filter(n => n.type === 'VEHICLE');

    for (const p of persons) {
      for (const ph of phones) {
        edges.push({
          id: 'edge_' + p.id + '_' + ph.id,
          source: p.id,
          target: ph.id,
          type: 'USES',
          confidence: 0.92,
          source_document: docName,
          evidence: p.label + ' linked to terminal ' + ph.label
        });
      }
    }

    for (const p of persons) {
      for (const acc of accounts) {
        edges.push({
          id: 'edge_' + p.id + '_' + acc.id,
          source: p.id,
          target: acc.id,
          type: 'TRANSFERRED_TO',
          confidence: 0.90,
          source_document: docName,
          evidence: 'Financial transfer link between ' + p.label + ' and ' + acc.label
        });
      }
    }

    for (const p of persons) {
      for (const veh of vehicles) {
        edges.push({
          id: 'edge_' + p.id + '_' + veh.id,
          source: p.id,
          target: veh.id,
          type: 'OPERATES',
          confidence: 0.93,
          source_document: docName,
          evidence: 'Vehicle dispatch linked to ' + p.label
        });
      }
    }

    for (let i = 0; i < persons.length; i++) {
      for (let j = i + 1; j < persons.length; j++) {
        edges.push({
          id: 'edge_' + persons[i].id + '_' + persons[j].id,
          source: persons[i].id,
          target: persons[j].id,
          type: 'COORDINATES_WITH',
          confidence: 0.89,
          source_document: docName,
          evidence: 'Co-conspirator nexus between ' + persons[i].label + ' and ' + persons[j].label
        });
      }
    }

    return { nodes, edges };
  }

  public static analyzeGraphAndGenerateSolutions(caseId: string, graph: GraphData): PoliceSolutionsReport {
    const nodes = graph.nodes || [];
    const edges = graph.edges || [];

    if (nodes.length === 0) {
      return {
        case_id: caseId,
        status: 'AWAITING_INGESTION',
        timestamp: new Date().toISOString(),
        total_entities_analyzed: 0,
        total_connections_analyzed: 0,
        hvt_priority_targets: [],
        actionable_directives: [],
        takedown_bottlenecks: [],
        evidence_preservation_alerts: [],
        operational_playbook_72h: [],
        tactical_overview: 'No entities extracted. Ingest data to generate solutions.'
      };
    }

    const degreeMap = new Map<string, number>();
    for (const n of nodes) degreeMap.set(n.id, 0);
    for (const e of edges) {
      degreeMap.set(e.source, (degreeMap.get(e.source) || 0) + 1);
      degreeMap.set(e.target, (degreeMap.get(e.target) || 0) + 1);
    }

    const personNodes = nodes.filter(n => n.type === 'PERSON');
    const targetCandidates = personNodes.length > 0 ? personNodes : nodes.slice(0, 5);

    const hvtTargets: HVTTarget[] = targetCandidates.map((node) => {
      const degree = degreeMap.get(node.id) || 1;
      const connectedEdges = edges.filter(e => e.source === node.id || e.target === node.id);
      const finEdges = connectedEdges.filter(e => ['TRANSFERRED_TO', 'PAID', 'ACCOUNT'].includes(e.type));
      const commsEdges = connectedEdges.filter(e => ['USES', 'CALLED', 'COORDINATES_WITH'].includes(e.type));

      const culpabilityScore = Math.min(Math.max(65 + degree * 7 + finEdges.length * 5, 60), 98);

      let role = 'ASSOCIATE / MULE';
      let threat = 'MODERATE THREAT';
      let priority = 'PRIORITY 3 - SURVEILLANCE';
      let directive = 'Issue summons for formal Section 67 NDPS / Section 50 PMLA interrogation of ' + node.label + '.';

      if (degree >= 3 || (finEdges.length >= 1 && commsEdges.length >= 1)) {
        role = 'SYNDICATE KINGPIN / COMMANDER';
        threat = 'TRANSNATIONAL CRITICAL';
        priority = 'PRIORITY 1 - IMMEDIATE TAKEDOWN';
        directive = 'Execute Non-Bailable Arrest Warrant (NBW) under BNS Sec 111 (Organized Crime) & IPC Sec 120B against ' + node.label + '.';
      } else if (finEdges.length > 0) {
        role = 'FINANCIAL CONDUIT / HAWALA BROKER';
        threat = 'HIGH FINANCIAL THREAT';
        priority = 'PRIORITY 2 - ASSET FREEZE';
        directive = 'Issue emergency provisional account attachment order under PMLA Sec 17 against ' + node.label + "'s financial assets.";
      } else if (commsEdges.length > 1) {
        role = 'OPERATIONAL DISPATCHER / PROXY';
        threat = 'ELEVATED LOGISTICAL RISK';
        priority = 'PRIORITY 2 - INTERCEPT TRAP';
        directive = 'Deploy IMSI Catcher and obtain CDR tower logs under Section 91 CrPC for ' + node.label + '.';
      }

      const sections = ['IPC Sec 120B (Criminal Conspiracy)', 'BNS Sec 111 (Organized Crime)'];
      if (finEdges.length > 0 || node.id.includes('account') || node.label.toLowerCase().includes('hawala')) {
        sections.push('PMLA Sec 3 & 4 (Money-Laundering)', 'IPC Sec 420 (Cheating)');
      }
      if (connectedEdges.some(e => e.evidence && (e.evidence.toLowerCase().includes('narcotic') || e.evidence.toLowerCase().includes('contraband') || e.evidence.toLowerCase().includes('illegal')))) {
        sections.push('NDPS Act Sec 8(c)/21/29 (Illicit Trafficking)');
      }
      if (connectedEdges.some(e => e.evidence && (e.evidence.toLowerCase().includes('weapon') || e.evidence.toLowerCase().includes('arm')))) {
        sections.push('Arms Act Sec 25/27 (Illegal Possession)');
      }

      return {
        target_id: node.id,
        target_name: node.label,
        type: node.type,
        culpability_score: culpabilityScore,
        operational_role: role,
        threat_level: threat,
        priority: priority,
        direct_connections_count: degree,
        action_directive: directive,
        applicable_statutory_sections: sections,
        network_centrality_percentile: Math.min(degree * 18, 99) + '%'
      };
    });

    hvtTargets.sort((a, b) => b.culpability_score - a.culpability_score);

    const bottlenecks = hvtTargets.slice(0, 2).map(target => ({
      node_id: target.target_id,
      label: target.target_name,
      type: target.type,
      strategic_value: 'PRIMARY SYNDICATE BOTTLENECK',
      disruption_impact: 'Neutralizing this articulation node severs intra-cell coordination and fragments communication lines.',
      recommended_takedown_method: 'Simultaneous digital isolation and physical search & seizure warrant execution.'
    }));

    const directives: PoliceSolutionDirective[] = [
      {
        directive_id: 'DIR-01',
        category: 'ARREST & RAID AUTHORIZATION',
        target: hvtTargets[0] ? hvtTargets[0].target_name : 'Primary Suspect',
        order: hvtTargets[0] ? hvtTargets[0].action_directive : 'Execute Search Warrant under CrPC Sec 93.',
        urgency: 'IMMEDIATE (Within 24 Hours)',
        statutory_basis: 'CrPC Section 41A / Section 73 (Arrest Warrant)'
      },
      {
        directive_id: 'DIR-02',
        category: 'FINANCIAL FREEZE & SEIZURE',
        target: 'Identified Hawala & Transferred Accounts',
        order: 'Serve Section 102 CrPC / PMLA Sec 17 freezing orders to banks to block liquidity flight.',
        urgency: 'CRITICAL (Prevent Fund Siphoning)',
        statutory_basis: 'Prevention of Money Laundering Act Sec 17 & CrPC Sec 102'
      },
      {
        directive_id: 'DIR-03',
        category: 'DIGITAL FORENSIC PRESERVATION',
        target: 'Cellular Base Station Dumps & Handset IMEIs',
        order: 'Requisition 90-day CDR, IMEI histories, and IPDR logs under Section 91 CrPC.',
        urgency: 'TIME-SENSITIVE (Before 21-Day Telco Buffer Rollover)',
        statutory_basis: 'Indian Evidence Act Sec 65B Electronic Certificate Mandate'
      }
    ];

    return {
      case_id: caseId,
      status: 'SOLUTIONS_COMPILED',
      timestamp: new Date().toISOString(),
      total_entities_analyzed: nodes.length,
      total_connections_analyzed: edges.length,
      hvt_priority_targets: hvtTargets,
      actionable_directives: directives,
      takedown_bottlenecks: bottlenecks,
      evidence_preservation_alerts: [
        {
          alert_type: 'TELCO_BUFFER_EXPIRY',
          title: 'Telco Base Station Dump Expiration Alert',
          details: 'Base station logs older than 21 days risk purge. File Section 91 CrPC requisition immediately.',
          action: 'Issue statutory notice to telecom nodal officer.'
        },
        {
          alert_type: 'ASSET_SIPHONING_RISK',
          title: 'Cross-Border Asset Siphoning Risk',
          details: 'Balances routed via Hawala conduits typically disperse to offshore crypto within 48 hours.',
          action: 'Issue Lookout Circular (LOC) at international exit ports.'
        }
      ],
      operational_playbook_72h: [
        {
          timeframe: 'Hour 0 - 12',
          operation: 'Digital Intercept Lock & Border Watch',
          steps: [
            'Transmit IMEI watchlist to National Intelligence Grid (NATGRID).',
            'Freeze primary bank accounts at RBI nodal clearance desk.',
            'Place Bureau of Immigration (BOI) Lookout Circulars for Tier-1 suspects.'
          ]
        },
        {
          timeframe: 'Hour 12 - 36',
          operation: 'Coordinated Multi-Point Search & Seizure',
          steps: [
            'Obtain Search Warrants under CrPC Sec 93 from Special Sessions Court.',
            'Conduct simultaneous dawn raids on safehouse and warehouse nodes.',
            'Seize mobile devices in Faraday RF-shielded forensic bags.'
          ]
        },
        {
          timeframe: 'Hour 36 - 72',
          operation: 'Custodial Interrogation & Section 65B Filing',
          steps: [
            'Present accused before Magistrate within statutory 24 hours.',
            'Extract Cellebrite physical memory dumps of encrypted messaging artifacts.',
            'Compile Section 173 CrPC Preliminary Charge Sheet.'
          ]
        }
      ],
      tactical_overview: 'Analyzed ' + nodes.length + ' entities and ' + edges.length + ' connections. Identified ' + hvtTargets.length + ' targets. Immediate neutralization of ' + bottlenecks.length + ' bottleneck node(s) will sever syndicate operations.'
    };
  }
}
