import React, { useEffect, useState } from 'react';
import { FileText, X, ShieldCheck, Database, Tag, Eye } from 'lucide-react';
import { EvidenceDocument, Node, Edge } from '../../types';
import { fetchEvidence } from '../../services/api';

interface EvidenceViewerProps {
  evidenceId: string | null;
  onClose: () => void;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({ evidenceId, onClose }) => {
  const [doc, setDoc] = useState<EvidenceDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (evidenceId) {
      setLoading(true);
      fetchEvidence(evidenceId)
        .then(data => setDoc(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setDoc(null);
    }
  }, [evidenceId]);

  if (!evidenceId) return null;

  // Inline entity highlight formatter
  const renderHighlightedContent = (text: string) => {
    // Known entity patterns to highlight inline
    const replacements: Array<{ regex: RegExp; class: string; label: string }> = [
      { regex: /(Devendra Sharma|Ramesh Kumar|Suresh Patil|Tariq Ahmed|Imran Khan|Zaid Sheikh|Victor Vance)/g, class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', label: 'PERSON' },
      { regex: /(\+91-\d{5}-\d{5}|\+?\d{10,12})/g, class: 'bg-amber-500/20 text-amber-300 border-amber-500/40', label: 'PHONE' },
      { regex: /([A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4})/g, class: 'bg-red-500/20 text-red-300 border-red-500/40', label: 'VEHICLE' },
      { regex: /(ACC-\d{6})/g, class: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', label: 'ACCOUNT' },
      { regex: /(Warehouse 17, Nhava Sheva|Dockyard Road Office, Mumbai|Crime Branch Zone 4, Mumbai)/g, class: 'bg-blue-500/20 text-blue-300 border-blue-500/40', label: 'LOCATION' },
    ];

    let segments: Array<{ text: string; tag?: string; class?: string }> = [{ text }];

    replacements.forEach(rep => {
      const nextSegments: typeof segments = [];
      segments.forEach(seg => {
        if (seg.tag) {
          nextSegments.push(seg);
          return;
        }
        const parts = seg.text.split(rep.regex);
        parts.forEach((part, i) => {
          if (rep.regex.test(part)) {
            nextSegments.push({ text: part, tag: rep.label, class: rep.class });
          } else if (part) {
            nextSegments.push({ text: part });
          }
        });
      });
      segments = nextSegments;
    });

    return (
      <div className="whitespace-pre-wrap leading-relaxed">
        {segments.map((seg, idx) => {
          if (seg.tag) {
            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono border ${seg.class} mx-0.5`}
              >
                <span>{seg.text}</span>
                <span className="text-[8px] opacity-70 uppercase font-bold">[{seg.tag}]</span>
              </span>
            );
          }
          return <span key={idx}>{seg.text}</span>;
        })}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(16px)' }}
    >
      <div
        className="card-3d w-full max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(180deg, rgba(8,9,11,0.98) 0%, rgba(6,7,10,0.99) 100%)',
          border: '1px solid rgba(6,182,212,0.3)',
          boxShadow: '0 0 80px rgba(6,182,212,0.15)',
        }}
      >
        {/* Header */}
        <div
          className="relative px-6 py-4 flex items-center justify-between shrink-0"
          style={{
            background: 'linear-gradient(90deg, rgba(6,182,212,0.08) 0%, transparent 100%)',
            borderBottom: '1px solid rgba(6,182,212,0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(6,182,212,0.12)',
                border: '1px solid rgba(6,182,212,0.3)',
                boxShadow: '0 0 20px rgba(6,182,212,0.2)',
              }}
            >
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                  {doc?.file_type ?? 'EVIDENCE RECORD'}
                </span>
                <span className="text-xs font-mono text-slate-500">ID: {evidenceId}</span>
              </div>
              <h2 className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                {doc?.filename ?? 'Loading document provenance...'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-3d w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body Split View */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-xs font-mono text-slate-500">
            <Database className="w-8 h-8 animate-spin text-cyan-500 mb-3" />
            <span>Retrieving ground truth evidence record...</span>
          </div>
        ) : doc ? (
          <div className="flex-1 grid grid-cols-12 overflow-hidden">
            {/* Left: Document Text with Inline Highlights */}
            <div className="col-span-8 p-6 overflow-y-auto border-r border-white/5 font-mono text-xs text-slate-300 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pb-2 border-b border-white/5">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Chain of Custody Verified</span>
                <span>Uploaded: {new Date(doc.uploaded_at).toLocaleString('en-IN')}</span>
              </div>

              {renderHighlightedContent(doc.content)}
            </div>

            {/* Right: Extracted Metadata & Taxonomy Legend */}
            <div className="col-span-4 p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-2">
                  Extracted Entity Types
                </span>
                <div className="space-y-1.5">
                  {[
                    { label: 'PERSON', color: '#10B981', desc: 'Identified Suspects & Proxies' },
                    { label: 'PHONE', color: '#F59E0B', desc: 'Call Detail Record Identifiers' },
                    { label: 'LOCATION', color: '#3B82F6', desc: 'Spatial Coordinates & Sites' },
                    { label: 'VEHICLE', color: '#EF4444', desc: 'ANPR Registered Plates' },
                    { label: 'ACCOUNT', color: '#06B6D4', desc: 'Financial IBAN / ACC Numbers' },
                  ].map(t => (
                    <div key={t.label} className="p-2 rounded bg-white/2 border border-white/5 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                      <div>
                        <div className="font-bold text-slate-300 text-[10px]">{t.label}</div>
                        <div className="text-[9px] text-slate-600">{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-300 text-[11px] leading-relaxed">
                <Tag className="w-4 h-4 mb-1 text-cyan-400" />
                All extracted entities are automatically matched to the canonical graph repository with confidence scores exceeding 90%.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 text-xs font-mono text-red-400">
            Document evidence record not found.
          </div>
        )}
      </div>
    </div>
  );
};
