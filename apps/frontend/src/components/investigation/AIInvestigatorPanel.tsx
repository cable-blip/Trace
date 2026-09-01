import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, FileText, CheckCircle2, AlertCircle, ArrowRight, Brain, Zap } from 'lucide-react';
import { InvestigatorResponse } from '../../types';
import { askInvestigator } from '../../services/api';

interface AIInvestigatorPanelProps {
  caseId: string;
  onApplyHighlight: (nodes: string[], edges: string[]) => void;
  onViewEvidence: (evidenceId: string) => void;
}

export const AIInvestigatorPanel: React.FC<AIInvestigatorPanelProps> = ({
  caseId, onApplyHighlight, onViewEvidence,
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<InvestigatorResponse | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true);
    try {
      const res = await askInvestigator(question, caseId);
      setResponse(res);
      if (res.highlight_nodes.length > 0) onApplyHighlight(res.highlight_nodes, res.highlight_edges);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const presets = [
    'Which person connects Cluster A and B?',
    'Who are the most connected key players?',
    'How is Victor Vance connected to Devendra Sharma?',
  ];

  return (
    <div
      className="card-3d panel-depth flex flex-col h-full rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(6,7,10,0.95) 0%, rgba(8,10,15,0.98) 100%)',
        border: '1px solid rgba(6,182,212,0.15)',
        boxShadow: '0 0 40px rgba(6,182,212,0.05), inset 0 1px 0 rgba(6,182,212,0.08)',
      }}
    >
      {/* Header */}
      <div
        className="relative flex items-center gap-2.5 px-4 py-3 shrink-0"
        style={{
          background: 'linear-gradient(90deg, rgba(6,182,212,0.08) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(6,182,212,0.1)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px holo opacity-40" />
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: 'rgba(6,182,212,0.12)',
            border: '1px solid rgba(6,182,212,0.3)',
            boxShadow: '0 0 16px rgba(6,182,212,0.15)',
          }}
        >
          <Brain className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xs font-bold tracking-widest text-cyan-300 uppercase font-mono"
            style={{ textShadow: '0 0 12px rgba(6,182,212,0.5)' }}>
            AI Investigator
          </h2>
          <p className="text-[10px] font-mono text-slate-600">Grounded Graph Reasoning</p>
        </div>
        <span
          className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-mono font-bold tracking-wider"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          ACTIVE
        </span>
      </div>

      {/* Preset Questions */}
      <div className="flex flex-col gap-1.5 px-3 pt-3 shrink-0">
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-0.5">
          Suggested Queries
        </span>
        {presets.map((q, i) => (
          <button
            key={i}
            onClick={() => { setQuestion(q); inputRef.current?.focus(); }}
            className="btn-3d text-left text-[11px] px-2.5 py-2 rounded-lg font-mono transition-all"
            style={{
              background: 'rgba(6,182,212,0.03)',
              border: '1px solid rgba(6,182,212,0.1)',
              color: '#64748B',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(6,182,212,0.08)';
              (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(6,182,212,0.25)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(6,182,212,0.03)';
              (e.currentTarget as HTMLButtonElement).style.color = '#64748B';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(6,182,212,0.1)';
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Query Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 px-3 pt-3 shrink-0">
        <div
          className="flex-1 relative"
          style={{
            transform: inputFocused ? 'perspective(600px) translateZ(4px)' : 'perspective(600px) translateZ(0)',
            transition: 'transform 0.2s ease',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Ask a graph intelligence question…"
            maxLength={500}
            className="w-full bg-transparent text-xs text-slate-200 font-mono px-3 py-2.5 rounded-lg focus:outline-none placeholder-slate-700"
            style={{
              background: inputFocused ? 'rgba(6,182,212,0.06)' : 'rgba(255,255,255,0.02)',
              border: inputFocused
                ? '1px solid rgba(6,182,212,0.5)'
                : '1px solid rgba(255,255,255,0.07)',
              boxShadow: inputFocused ? '0 0 20px rgba(6,182,212,0.12)' : 'none',
              transition: 'all 0.2s ease',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="btn-3d flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-mono font-bold transition-all"
          style={{
            background: loading
              ? 'rgba(6,182,212,0.1)'
              : 'linear-gradient(135deg, rgba(6,182,212,0.4) 0%, rgba(16,185,129,0.3) 100%)',
            border: '1px solid rgba(6,182,212,0.5)',
            color: '#06B6D4',
            boxShadow: '0 0 16px rgba(6,182,212,0.15)',
            opacity: !question.trim() ? 0.4 : 1,
          }}
        >
          {loading ? (
            <Zap className="w-3.5 h-3.5 animate-pulse" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>

      {/* Response Area */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-32 gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(6,182,212,0.1)',
                border: '1px solid rgba(6,182,212,0.3)',
                boxShadow: '0 0 30px rgba(6,182,212,0.2)',
                animation: 'float3d 1.2s ease-in-out infinite',
              }}
            >
              <Sparkles className="w-5 h-5 text-cyan-400" style={{ animation: 'spin 2s linear infinite' }} />
            </div>
            <div className="text-xs font-mono text-slate-600 text-center">
              <p className="text-cyan-400 animate-pulse">Parsing intent & executing graph query…</p>
              <p className="text-slate-700 mt-1">Collecting evidence chains…</p>
            </div>
          </div>
        ) : response ? (
          <div
            className="card-3d rounded-xl overflow-hidden"
            style={{
              background: 'rgba(6,182,212,0.04)',
              border: '1px solid rgba(6,182,212,0.15)',
              boxShadow: '0 0 30px rgba(6,182,212,0.06)',
              animation: 'fadeSlideIn 0.4s cubic-bezier(0.23,1,0.32,1) forwards',
            }}
          >
            {/* Answer */}
            <div className="p-3.5">
              <p className="text-xs leading-relaxed text-slate-300 font-sans whitespace-pre-line">
                {response.answer}
              </p>
            </div>

            {/* Confidence bar */}
            <div className="px-3.5 pb-3">
              <div className="flex justify-between text-[10px] font-mono mb-1.5">
                <span className="text-slate-600">Confidence</span>
                <span className="text-emerald-400 font-bold">{(response.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div
                  className="h-1 rounded-full transition-all duration-700"
                  style={{
                    width: `${response.confidence * 100}%`,
                    background: 'linear-gradient(90deg, #10B981, #06B6D4)',
                    boxShadow: '0 0 8px rgba(6,182,212,0.5)',
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono mt-1.5">
                <span className="text-slate-600">Intent: <span className="text-cyan-500">{response.query.intent}</span></span>
              </div>
            </div>

            {/* Highlight button */}
            {response.highlight_nodes.length > 0 && (
              <button
                onClick={() => onApplyHighlight(response.highlight_nodes, response.highlight_edges)}
                className="btn-3d w-full flex items-center justify-center gap-2 py-2.5 text-xs font-mono font-semibold transition-all"
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  borderTop: '1px solid rgba(16,185,129,0.15)',
                  color: '#10B981',
                }}
              >
                <span>Highlight {response.highlight_nodes.length} Nodes in 3D Canvas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Evidence */}
            {response.evidence.length > 0 && (
              <div className="px-3.5 pb-3 pt-2 border-t border-white/5">
                <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2">Evidence Sources</p>
                {response.evidence.map((ev, i) => (
                  <button
                    key={i}
                    onClick={() => onViewEvidence(ev)}
                    className="btn-3d w-full text-left flex items-center gap-2 text-[11px] font-mono px-2.5 py-1.5 rounded-lg mb-1 transition-all"
                    style={{
                      background: 'rgba(6,182,212,0.03)',
                      border: '1px solid rgba(6,182,212,0.08)',
                      color: '#06B6D4',
                    }}
                  >
                    <FileText className="w-3 h-3 shrink-0" />
                    <span className="truncate">{ev}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center h-36 rounded-xl text-center"
            style={{ border: '1px dashed rgba(255,255,255,0.06)' }}
          >
            <AlertCircle className="w-6 h-6 mb-2" style={{ color: 'rgba(255,255,255,0.15)' }} />
            <p className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Enter a query above to begin graph reasoning
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
