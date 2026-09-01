import React, { useState } from 'react';
import { GitMerge, Search, GitCommit, HelpCircle, AlertCircle } from 'lucide-react';
import { fetchShortestPath } from '../../services/api';
import { GraphData } from '../../types';

interface PathFinderPanelProps {
  caseId: string;
  graphData: GraphData;
  onHighlightPath: (nodes: string[], edges: string[]) => void;
  onClearHighlight: () => void;
}

export const PathFinderPanel: React.FC<PathFinderPanelProps> = ({
  caseId,
  graphData,
  onHighlightPath,
  onClearHighlight,
}) => {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [ignoreDocs, setIgnoreDocs] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pathResult, setPathResult] = useState<string[]>([]);

  const handleTrace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !target.trim()) return;

    // Find actual IDs from labels
    const srcNode = graphData.nodes.find(
      n => n.label.toLowerCase() === source.trim().toLowerCase() || n.id.toLowerCase() === source.trim().toLowerCase()
    );
    const tgtNode = graphData.nodes.find(
      n => n.label.toLowerCase() === target.trim().toLowerCase() || n.id.toLowerCase() === target.trim().toLowerCase()
    );

    if (!srcNode || !tgtNode) {
      setError('Could not find matching source or target entities. Check spelling.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetchShortestPath(caseId, srcNode.id, tgtNode.id, ignoreDocs);
      if (res.nodes.length === 0) {
        setError('No connection path found between these two entities.');
        onClearHighlight();
        setPathResult([]);
      } else {
        onHighlightPath(res.nodes, res.edges);
        // Map back to labels for display
        const labels = res.nodes.map(nid => {
          const found = graphData.nodes.find(n => n.id === nid);
          return found ? found.label : nid;
        });
        setPathResult(labels);
      }
    } catch (err) {
      console.error(err);
      setError('Error trace connection route.');
    } finally {
      setLoading(false);
    }
  };

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
          <GitMerge className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xs font-bold tracking-widest text-cyan-300 uppercase font-mono"
            style={{ textShadow: '0 0 12px rgba(6,182,212,0.5)' }}>
            Path Tracer
          </h2>
          <p className="text-[10px] font-mono text-slate-600">Shortest Connection Search</p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleTrace} className="p-3.5 space-y-3 shrink-0">
        <div>
          <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1 block">
            Source Entity (Label or ID)
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="e.g. Victor Vance"
              className="w-full bg-white/2 border border-white/5 text-xs text-slate-200 font-mono pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 focus:bg-cyan-500/5 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1 block">
            Target Entity (Label or ID)
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="e.g. Devendra Sharma"
              className="w-full bg-white/2 border border-white/5 text-xs text-slate-200 font-mono pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 focus:bg-cyan-500/5 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="ignoreDocs"
            checked={ignoreDocs}
            onChange={e => setIgnoreDocs(e.target.checked)}
            className="rounded border-slate-800 bg-transparent text-cyan-500 focus:ring-0 cursor-pointer"
          />
          <label htmlFor="ignoreDocs" className="text-[10px] font-mono text-slate-400 select-none cursor-pointer">
            Ignore intermediary Document nodes
          </label>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading || !source.trim() || !target.trim()}
            className="btn-3d flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all text-cyan-300"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(16,185,129,0.2) 100%)',
              border: '1px solid rgba(6,182,212,0.5)',
              boxShadow: '0 0 16px rgba(6,182,212,0.15)',
            }}
          >
            {loading ? 'Tracing path...' : 'Calculate Path'}
          </button>
          
          {(pathResult.length > 0 || error) && (
            <button
              type="button"
              onClick={() => {
                setSource('');
                setTarget('');
                setPathResult([]);
                setError(null);
                onClearHighlight();
              }}
              className="btn-3d px-3 py-2 rounded-lg text-xs font-mono border border-white/10 text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Result list */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-3">
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-950/20 border border-red-500/30 rounded-lg text-red-400 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {pathResult.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                Path Chain Found ({pathResult.length} hops)
              </span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-cyan-500/30">
              {pathResult.map((label, idx) => (
                <div key={idx} className="relative text-xs font-mono">
                  {/* Step bullet */}
                  <div
                    className="absolute left-[-19.5px] top-1 w-2.5 h-2.5 rounded-full flex items-center justify-center border transition"
                    style={{
                      background: idx === 0 || idx === pathResult.length - 1 ? '#06B6D4' : '#1e293b',
                      borderColor: '#06B6D4',
                      boxShadow: '0 0 8px rgba(6,182,212,0.5)',
                    }}
                  />
                  <div className="text-[11px] font-bold text-slate-300">{label}</div>
                  <div className="text-[9px] text-slate-600">Hop {idx + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!error && pathResult.length === 0 && (
          <div className="flex flex-col items-center justify-center h-28 border border-dashed border-white/5 rounded-lg text-center p-4">
            <HelpCircle className="w-5 h-5 mb-1.5 text-slate-800" />
            <p className="text-[10px] font-mono text-slate-700">
              Input two entities to find their shortest network connection path.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
