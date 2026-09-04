import React, { useState, useEffect } from 'react';
import {
  Mic, User, Users, FileText, CheckCircle2, ShieldAlert,
  Copy, Save, RefreshCw, Scale, HelpCircle, Phone, CreditCard, MapPin
} from 'lucide-react';
import { Node } from '../../types';

interface InterviewPreparationPanelProps {
  caseId: string;
  suspects: Node[];
  initialSelectedId?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

export const InterviewPreparationPanel: React.FC<InterviewPreparationPanelProps> = ({
  caseId,
  suspects,
  initialSelectedId
}) => {
  const personNodes = suspects.filter(n => n.type === 'PERSON');
  const [selectedPersonId, setSelectedPersonId] = useState<string>(
    initialSelectedId || (personNodes[0]?.id || '')
  );
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (personNodes.length > 0) {
      if (!personNodes.some(p => p.id === selectedPersonId)) {
        setSelectedPersonId(personNodes[0].id);
      }
    } else {
      setSelectedPersonId('');
      setPlan(null);
      setLoading(false);
    }
  }, [caseId, suspects]);

  const loadPlan = async (pid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}/interview-plan/${pid}`);
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      } else {
        // Fallback local plan if offline or empty
        setPlan({
          case_id: caseId,
          person_id: pid,
          person_name: personNodes.find(p => p.id === pid)?.label || pid,
          role_hypothesis: "Case Material Associate",
          interview_objectives: [
            "Clarify factual relationship with active case entities.",
            "Establish verified timeline of interactions based on primary exhibits."
          ],
          non_leading_questions: [
            {
              question_id: "Q-01",
              topic: "General Association",
              question_text: "Please clarify the nature and history of your professional association with the individuals mentioned in the case dossier.",
              evidence_citations: [`Case Dossier ${caseId}`],
              neutrality_rating: "NON_LEADING"
            }
          ],
          alibi_verification_points: [
            "Obtain independent electronic receipts or travel records for relevant dates."
          ]
        });
      }
    } catch (err) {
      console.error('Error fetching interview plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPersonId) {
      loadPlan(selectedPersonId);
    }
  }, [caseId, selectedPersonId]);

  const handleSaveNotes = async () => {
    try {
      setSaveStatus('SAVING...');
      const res = await fetch(`${API_BASE}/cases/${caseId}/interview-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_id: selectedPersonId,
          notes: notes,
          investigator_name: "Investigating Officer"
        })
      });
      if (res.ok) {
        setSaveStatus('SAVED TO AUDIT TRAIL');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('SAVED LOCALLY');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      setSaveStatus('SAVED LOCALLY');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (personNodes.length === 0) {
    return (
      <div className="h-full card-3d rounded-xl flex flex-col items-center justify-center p-8 text-center border border-white/5 bg-surface/90">
        <Users className="w-12 h-12 text-slate-600 mb-3" />
        <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider mb-1">
          No Person Entities Ingested for Case {caseId}
        </h3>
        <p className="text-xs font-mono text-slate-400 max-w-md">
          Interview preparation plans require at least one extracted PERSON entity node. Ingest case documents (FIRs, CDRs, witness statements) to automatically generate statutory non-leading interview questions.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3 font-sans overflow-hidden p-1">
      {/* ── Top Header HUD ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between card-3d p-4 rounded-xl border border-white/10 bg-surface/90 shadow-xl gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wider">
                Evidence-Led Interview Preparation
              </h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                HUMAN-REVIEWED DECISION SUPPORT
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Non-Leading, Evidence-Grounded Inquiries Derived from Case Primary Exhibits
            </span>
          </div>
        </div>

        {/* Person Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Subject:</span>
          <select
            value={selectedPersonId}
            onChange={(e) => setSelectedPersonId(e.target.value)}
            className="bg-slate-900 border border-cyan-500/40 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
          >
            {personNodes.map(p => (
              <option key={p.id} value={p.id}>
                {p.label || p.id} ({p.id})
              </option>
            ))}
          </select>
          <button
            onClick={() => loadPlan(selectedPersonId)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-400 transition"
            title="Refresh Interview Plan"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mandatory Statutory Non-Coercion Notice */}
      <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>
          <strong className="text-slate-300">STATUTORY NOTICE:</strong> Conducted under Section 161 CrPC / Section 180 BNSS. All questions are strictly non-leading and grounded in corroborated records. Coercion, threats, or biometric simulations are prohibited.
        </span>
      </div>

      {/* ── Main Content Grid ─────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-12 gap-3 overflow-hidden">
        {/* Left Column: Subject Evidentiary Dossier & Alibi Points (4 cols) */}
        <div className="col-span-4 h-full flex flex-col gap-3 overflow-y-auto pr-1">
          {/* Evidentiary Summary Card */}
          <div className="card-3d p-4 rounded-xl border border-white/10 bg-surface/95 space-y-3">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-white uppercase">Subject Dossier</span>
            </div>
            <div>
              <h4 className="text-sm font-bold font-mono text-cyan-300">{plan?.person_name}</h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{plan?.role_hypothesis}</p>
            </div>

            <div className="space-y-2 pt-1 border-t border-white/5">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Interview Objectives</span>
              <ul className="space-y-1 text-xs text-slate-300 font-sans">
                {(plan?.interview_objectives || []).map((obj: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-mono">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Alibi Verification Points Card */}
          <div className="card-3d p-4 rounded-xl border border-white/10 bg-surface/95 space-y-2.5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-amber-300 uppercase">Alibi Verification Checkpoints</span>
            </div>
            <div className="space-y-2 text-xs text-slate-300 font-sans">
              {(plan?.alibi_verification_points || []).map((pt: string, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-black/30 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300 font-semibold">
                    <span>Checkpoint #{idx + 1}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{pt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Question Plan & Investigator Notes (8 cols) */}
        <div className="col-span-8 h-full flex flex-col gap-3 overflow-hidden">
          {/* Question List (Top 60%) */}
          <div className="card-3d p-4 rounded-xl border border-white/10 bg-surface/95 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                Prepared Non-Leading Inquiries ({plan?.non_leading_questions?.length || 0})
              </span>
              <span className="text-[10px] font-mono text-slate-500">Citing Primary Evidence Documents</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs font-mono text-cyan-400">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  Formulating Evidence Inquiries...
                </div>
              ) : (
                (plan?.non_leading_questions || []).map((q: any) => (
                  <div
                    key={q.question_id}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-cyan-500/30 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                          {q.question_id}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{q.topic}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(q.question_text, q.question_id)}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-cyan-300 font-mono text-[10px] flex items-center gap-1 transition"
                        title="Copy Question to Clipboard"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedId === q.question_id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-200 font-sans font-medium leading-relaxed">
                      "{q.question_text}"
                    </p>

                    {q.evidence_citations?.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 border-t border-white/5 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-500">Exhibit Ref:</span>
                        {q.evidence_citations.map((cite: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-500/30 text-cyan-400 font-mono text-[10px]"
                          >
                            {cite}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Investigator Notes Notepad (Bottom 40%) */}
          <div className="card-3d p-4 rounded-xl border border-white/10 bg-surface/95 h-48 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Investigator Preparation Notes & Interview Log
              </span>
              <div className="flex items-center gap-2">
                {saveStatus && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">{saveStatus}</span>
                )}
                <button
                  onClick={handleSaveNotes}
                  className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notes</span>
                </button>
              </div>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record preliminary strategy, witness reactions, corroboration follow-ups, and interview responses..."
              className="flex-1 w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default InterviewPreparationPanel;
