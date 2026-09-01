import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, UserX, AlertTriangle, FileText, CheckCircle2, 
  ArrowRight, Scale, RefreshCw, Zap, Lock, Siren, Database
} from 'lucide-react';
import { fetchPoliceSolutions } from '../../services/api';

interface PoliceSolutionsPanelProps {
  caseId: string;
  onOpenWarrantModal?: () => void;
  onOpenIngestionModal?: () => void;
}

export const PoliceSolutionsPanel: React.FC<PoliceSolutionsPanelProps> = ({
  caseId,
  onOpenWarrantModal,
  onOpenIngestionModal
}) => {
  const [solutions, setSolutions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHVT, setSelectedHVT] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchPoliceSolutions(caseId);
      setSolutions(data);
      if (data?.hvt_priority_targets?.length > 0) {
        setSelectedHVT(data.hvt_priority_targets[0]);
      }
    } catch (err) {
      console.error('Error fetching police solutions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  if (loading) {
    return (
      <div className="h-full card-3d rounded-xl flex flex-col items-center justify-center p-8 text-xs font-mono text-cyan-400 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
        <div className="tracking-widest uppercase animate-pulse">
          Synthesizing Machine Learning Police Solutions & Tactical Directives...
        </div>
      </div>
    );
  }

  const hvts: any[] = solutions?.hvt_priority_targets || [];
  const directives: any[] = solutions?.actionable_directives || [];
  const bottlenecks: any[] = solutions?.takedown_bottlenecks || [];
  const playbook: any[] = solutions?.operational_playbook_72h || [];
  const alerts: any[] = solutions?.evidence_preservation_alerts || [];

  if (solutions?.status === 'AWAITING_INGESTION' || hvts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="card-3d max-w-lg w-full p-8 rounded-2xl border border-white/10 bg-surface/95 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
            <Database className="w-7 h-7 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold font-mono text-white uppercase tracking-wider">
              No Data Ingested for Case {caseId}
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              The Police Tactical Solutions Engine requires ingested investigation records (CDR telecom logs, bank transactions, ANPR tolls, or FIR transcripts) to compute High-Value Targets and legal directives.
            </p>
          </div>
          <button
            onClick={onOpenIngestionModal}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold transition flex items-center gap-2 mx-auto shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <Zap className="w-4 h-4" />
            <span>Ingest Intelligence Records Now</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3 font-sans overflow-hidden p-1">
      {/* ── Top Header HUD ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between card-3d p-4 rounded-xl border border-white/10 bg-surface/90 shadow-xl gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Siren className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wider">
                Police Action & Tactical Solutions Center
              </h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                TACTICAL ENFORCEMENT
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Automated Forensic Solutions & Legal Directives for Case {caseId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenWarrantModal}
            className="px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-mono text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Generate Judicial Warrant</span>
          </button>
          <button
            onClick={loadData}
            title="Re-run Engine"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-400 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main Content Grid ─────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-12 gap-3 overflow-hidden">
        {/* Left Column: High-Value Targets (HVT) Priority List (5 cols) */}
        <div className="col-span-5 h-full flex flex-col gap-3 overflow-hidden">
          <div className="card-3d p-4 rounded-xl border border-white/10 bg-surface/95 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <UserX className="w-4 h-4 text-cyan-400" />
                HVT Priority Takedown Roster ({hvts.length})
              </span>
              <span className="text-[10px] font-mono text-slate-500">Ranked by Bayesian Centrality</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {hvts.map((target) => {
                const isSelected = selectedHVT?.target_id === target.target_id;
                return (
                  <div
                    key={target.target_id}
                    onClick={() => setSelectedHVT(target)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                        : 'bg-black/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white truncate">
                        {target.target_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        target.culpability_score >= 90 ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        Guilt: {target.culpability_score}%
                      </span>
                    </div>

                    <div className="text-[11px] text-cyan-300 font-mono font-semibold">
                      {target.operational_role}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                      <span>{target.priority}</span>
                      <span>{target.direct_connections_count} Direct Links</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Articulation Bottlenecks Card */}
          <div className="card-3d p-4 rounded-xl border border-white/10 bg-surface/95">
            <span className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5 mb-2">
              <Lock className="w-4 h-4 text-amber-400" />
              Syndicate Articulation Bottlenecks ({bottlenecks.length})
            </span>
            <div className="space-y-2">
              {bottlenecks.map((b, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-200">{b.label}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">{b.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans">{b.disruption_impact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Target Tactical Directives & Playbook (7 cols) */}
        <div className="col-span-7 h-full flex flex-col gap-3 overflow-y-auto pr-1">
          {/* Target Tactical Action Card */}
          {selectedHVT && (
            <div className="card-3d p-5 rounded-xl border border-cyan-500/30 bg-surface/95 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                    POLICE ACTION DIRECTIVE // TARGET PROFILE
                  </span>
                  <h3 className="text-lg font-bold font-mono text-white">{selectedHVT.target_name}</h3>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-xs font-bold">
                    {selectedHVT.threat_level}
                  </span>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    Culpability Index: {selectedHVT.culpability_score}/100
                  </div>
                </div>
              </div>

              {/* Immediate Action Directive */}
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 space-y-1.5">
                <span className="text-[10px] font-mono text-red-400 font-bold uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Primary Action Order:
                </span>
                <p className="text-xs font-mono text-white font-semibold leading-relaxed">
                  {selectedHVT.action_directive}
                </p>
              </div>

              {/* Statutory Legal Penal Codes */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-300 font-bold uppercase flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-cyan-400" />
                  Recommended Statutory Penal Codes for Charge Sheet:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedHVT.applicable_statutory_sections.map((sec: string, sIdx: number) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-cyan-300 font-mono text-xs font-bold"
                    >
                      {sec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Operational Action Directives */}
          <div className="card-3d p-5 rounded-xl border border-white/10 bg-surface/95 space-y-3">
            <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              Executive Directives for Investigating Officer (IO)
            </span>
            <div className="space-y-2.5">
              {directives.map((dir, dIdx) => (
                <div key={dIdx} className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{dir.category}</span>
                    <span className="text-[10px] text-amber-400 font-semibold">{dir.urgency}</span>
                  </div>
                  <p className="text-slate-200 font-sans text-xs">{dir.order}</p>
                  <div className="text-[10px] text-slate-500 pt-1">
                    Statutory Authority: {dir.statutory_basis}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 72-Hour Tactical Playbook */}
          <div className="card-3d p-5 rounded-xl border border-white/10 bg-surface/95 space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-300 uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              72-Hour Police Enforcement Operational Playbook
            </span>
            <div className="space-y-3">
              {playbook.map((phase, pIdx) => (
                <div key={pIdx} className="p-3 rounded-lg bg-black/40 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-emerald-300">{phase.timeframe}: {phase.operation}</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300 font-sans list-disc list-inside">
                    {phase.steps.map((st: string, stIdx: number) => (
                      <li key={stIdx}>{st}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
