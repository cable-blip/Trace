import React, { useState, useEffect, useRef } from 'react';
import { Radio, Play, Pause, RefreshCw, Terminal, Activity, Zap } from 'lucide-react';
import { Node, Edge } from '../../types';

interface InterceptEvent {
  id: string;
  timestamp: string;
  type: 'CDR' | 'TRANSACTION' | 'SURVEILLANCE' | 'FIR';
  summary: string;
  nodes: Node[];
  edges: Edge[];
}

interface LiveStreamFeedProps {
  onInjectData: (newNodes: Node[], newEdges: Edge[]) => void;
}

const STREAM_TEMPLATES: Array<Omit<InterceptEvent, 'id' | 'timestamp'>> = [
  {
    type: 'CDR',
    summary: 'INTERCEPT: Call from +91-98200-99999 (Victor Vance) to +91-98200-88888 (Tariq Ahmed) [Duration: 420s]',
    nodes: [
      { id: 'phone_victor_sec', type: 'PHONE', label: '+91-98200-99999', confidence: 0.99, attributes: { owner: 'Victor Vance' }, is_possible_duplicate: false, created_at: new Date().toISOString() },
      { id: 'phone_tariq_sec', type: 'PHONE', label: '+91-98200-88888', confidence: 0.99, attributes: { owner: 'Tariq Ahmed' }, is_possible_duplicate: false, created_at: new Date().toISOString() },
    ],
    edges: [
      { id: 'edge_live_cdr_1', source: 'phone_victor_sec', target: 'phone_tariq_sec', type: 'CALLED', confidence: 0.99, source_document: 'live_stream_feed', timestamp: new Date().toISOString(), extraction_method: 'live_wiretap', evidence: 'Live CDR intercept at Nhava Sheva tower', attributes: {} }
    ]
  },
  {
    type: 'TRANSACTION',
    summary: 'FINANCIAL ALERT: Wire transfer of INR 45,00,000 from ACC-987654 to ACC-555999 (Ref: Offshore Escrow)',
    nodes: [
      { id: 'account_offshore_01', type: 'ACCOUNT', label: 'ACC-555999', confidence: 0.98, attributes: { bank: 'Offshore Escrow' }, is_possible_duplicate: false, created_at: new Date().toISOString() },
    ],
    edges: [
      { id: 'edge_live_txn_1', source: 'person_devendra', target: 'account_offshore_01', type: 'TRANSFERRED_TO', confidence: 0.98, source_document: 'live_stream_feed', timestamp: new Date().toISOString(), extraction_method: 'finint_feed', evidence: 'SWIFT wire intercept INR 45L', attributes: {} }
    ]
  },
  {
    type: 'SURVEILLANCE',
    summary: 'FIELD SURVEILLANCE: Vehicle MH-04-AB-1234 spotted entering Warehouse 17, Nhava Sheva',
    nodes: [
      { id: 'loc_wh17_sec', type: 'LOCATION', label: 'Warehouse 17, Nhava Sheva', confidence: 0.95, attributes: {}, is_possible_duplicate: false, created_at: new Date().toISOString() },
    ],
    edges: [
      { id: 'edge_live_surv_1', source: 'person_ramesh', target: 'loc_wh17_sec', type: 'LOCATED_AT', confidence: 0.95, source_document: 'live_stream_feed', timestamp: new Date().toISOString(), extraction_method: 'license_plate_anpr', evidence: 'ANPR camera 04 match at Nhava Sheva gate', attributes: {} }
    ]
  },
  {
    type: 'CDR',
    summary: 'INTERCEPT: Burner phone +91-98200-11111 pinged Tower_Central_09 near Dockyard Road Office',
    nodes: [
      { id: 'tower_central_09', type: 'LOCATION', label: 'Tower_Central_09', confidence: 0.92, attributes: {}, is_possible_duplicate: false, created_at: new Date().toISOString() }
    ],
    edges: [
      { id: 'edge_live_cell_1', source: 'person_devendra', target: 'tower_central_09', type: 'LOCATED_AT', confidence: 0.92, source_document: 'live_stream_feed', timestamp: new Date().toISOString(), extraction_method: 'tower_ping', evidence: 'Celltower ping intersection', attributes: {} }
    ]
  }
];

export const LiveStreamFeed: React.FC<LiveStreamFeedProps> = ({ onInjectData }) => {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; text: string; type: string }>>([]);
  const [speed, setSpeed] = useState<number>(3000); // 3 seconds interval
  const templateIdxRef = useRef<number>(0);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: number | null = null;
    if (isStreaming) {
      interval = window.setInterval(() => {
        const tmpl = STREAM_TEMPLATES[templateIdxRef.current % STREAM_TEMPLATES.length];
        templateIdxRef.current++;

        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-IN');
        const logId = `log_${Date.now()}`;

        const newLog = {
          id: logId,
          time: timeStr,
          text: tmpl.summary,
          type: tmpl.type
        };

        setLogs(prev => [newLog, ...prev.slice(0, 19)]); // Keep last 20 logs

        // Inject new nodes & edges into graph state
        onInjectData(tmpl.nodes, tmpl.edges);

      }, speed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreaming, speed, onInjectData]);

  return (
    <div
      className="card-3d panel-depth flex flex-col rounded-xl overflow-hidden"
      style={{
        background: 'rgba(6,7,10,0.92)',
        border: '1px solid rgba(6,182,212,0.2)',
        boxShadow: '0 0 30px rgba(6,182,212,0.08)',
      }}
    >
      {/* Header Bar */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-white/5"
        style={{ background: 'rgba(6,182,212,0.04)' }}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-bold font-mono text-cyan-300 tracking-wider">
            WIRETAP STREAM FEED
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed selector */}
          <select
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            className="bg-black/60 border border-white/10 text-[10px] font-mono text-slate-300 px-2 py-0.5 rounded focus:outline-none"
          >
            <option value={5000}>5s interval</option>
            <option value={3000}>3s interval</option>
            <option value={1500}>1.5s interval</option>
          </select>

          {/* Start/Pause Stream Button */}
          <button
            onClick={() => setIsStreaming(v => !v)}
            className="btn-3d flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded transition-all"
            style={{
              background: isStreaming
                ? 'rgba(239,68,68,0.15)'
                : 'linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(16,185,129,0.2) 100%)',
              border: isStreaming ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(6,182,212,0.5)',
              color: isStreaming ? '#EF4444' : '#06B6D4',
            }}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3 h-3" /> Pause Feed
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-cyan-400/20" /> Start Live Stream
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terminal Intercept Ticker Log Box */}
      <div
        ref={logContainerRef}
        className="h-28 overflow-y-auto p-2.5 space-y-1.5 font-mono text-[10px]"
        style={{ background: 'rgba(0,0,0,0.4)' }}
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-600 gap-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>Click "Start Live Stream" to simulate real-time wiretap & CDR intercepts...</span>
          </div>
        ) : (
          logs.map(log => (
            <div
              key={log.id}
              className="flex items-start gap-2 animate-fade-in"
              style={{ color: log.type === 'TRANSACTION' ? '#F59E0B' : (log.type === 'CDR' ? '#06B6D4' : '#10B981') }}
            >
              <span className="text-slate-600 shrink-0">[{log.time}]</span>
              <span className="font-bold shrink-0">[{log.type}]</span>
              <span className="text-slate-300 truncate">{log.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
