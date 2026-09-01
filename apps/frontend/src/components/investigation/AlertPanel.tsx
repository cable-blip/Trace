import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { fetchAlerts } from '../../services/api';

interface Alert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: string;
  title: string;
  description: string;
  affected_nodes: string[];
  affected_edges: string[];
  evidence: string;
}

interface AlertPanelProps {
  caseId: string;
  onHighlightPattern: (nodes: string[], edges: string[]) => void;
  onClearHighlight: () => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  caseId,
  onHighlightPattern,
  onClearHighlight,
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchAlerts(caseId);
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    setActiveAlertId(null);
    onClearHighlight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const toggleAlertHighlight = (alert: Alert) => {
    if (activeAlertId === alert.id) {
      setActiveAlertId(null);
      onClearHighlight();
    } else {
      setActiveAlertId(alert.id);
      onHighlightPattern(alert.affected_nodes, alert.affected_edges);
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.25)' };
      case 'HIGH':
        return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)' };
      default:
        return { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.25)' };
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
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 0 16px rgba(239, 68, 68, 0.15)',
          }}
        >
          <ShieldAlert className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <h2 className="text-xs font-bold tracking-widest text-red-300 uppercase font-mono"
            style={{ textShadow: '0 0 12px rgba(239, 68, 68, 0.5)' }}>
            Pattern Intelligence
          </h2>
          <p className="text-[10px] font-mono text-slate-600">Topology Vulnerability Alerts</p>
        </div>
        
        <button
          onClick={loadAlerts}
          disabled={loading}
          className="btn-3d ml-auto w-7 h-7 rounded-lg flex items-center justify-center border border-white/5 text-slate-400"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-xs font-mono text-slate-600">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-500 mb-2" />
            <span>Scanning graph structure for anomalies...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center border border-dashed border-white/5 rounded-xl p-4">
            <ShieldAlert className="w-6 h-6 mb-2 text-slate-800" />
            <p className="text-[11px] font-mono text-slate-600">
              No critical pattern vulnerability alerts detected.
            </p>
          </div>
        ) : (
          alerts.map(alert => {
            const style = getSeverityStyle(alert.severity);
            const active = activeAlertId === alert.id;
            return (
              <div
                key={alert.id}
                className="card-3d rounded-xl p-3 border transition-all duration-300 relative overflow-hidden"
                style={{
                  background: active ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
                  borderColor: active ? style.color : 'rgba(255,255,255,0.04)',
                  boxShadow: active ? `0 0 20px ${style.color}1e` : 'none',
                }}
              >
                {/* Severity glow strip */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: style.color }}
                />

                <div className="flex justify-between items-start pl-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: style.bg,
                        color: style.color,
                        border: `1px solid ${style.border}`,
                      }}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      {alert.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleAlertHighlight(alert)}
                    className="btn-3d flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border border-white/5 text-slate-400"
                    style={{
                      borderColor: active ? style.color : 'rgba(255,255,255,0.06)',
                      color: active ? style.color : '#94A3B8',
                    }}
                  >
                    {active ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Isolate</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Isolate</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="pl-2">
                  <h4 className="text-xs font-bold text-slate-200">{alert.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal font-sans">
                    {alert.description}
                  </p>
                  
                  {alert.evidence && (
                    <div
                      className="text-[10px] font-mono mt-2 p-1.5 rounded border border-white/5 text-slate-500"
                      style={{ background: 'rgba(255,255,255,0.01)' }}
                    >
                      Evidentiary basis: {alert.evidence}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
