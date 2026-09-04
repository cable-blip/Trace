import React, { useEffect, useState } from 'react';
import { User, ShieldCheck, AlertTriangle, GitBranch, X, Activity } from 'lucide-react';
import { Node, Edge } from '../../types';

const TYPE_GLOW: Record<string, string> = {
  PERSON:       'rgba(16,185,129,',
  PHONE:        'rgba(245,158,11,',
  LOCATION:     'rgba(59,130,246,',
  VEHICLE:      'rgba(239,68,68,',
  ORGANIZATION: 'rgba(139,92,246,',
  ACCOUNT:      'rgba(6,182,212,',
  TRANSACTION:  'rgba(236,72,153,',
  EVENT:        'rgba(249,115,22,',
};

interface EntityIntelligencePanelProps {
  node: Node | null;
  edges: Edge[];
  onClose: () => void;
  onExpand: (nodeId: string) => void;
}

export const EntityIntelligencePanel: React.FC<EntityIntelligencePanelProps> = ({
  node, edges, onClose, onExpand,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (node) {
      setVisible(false);
      const t = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [node?.id]);

  if (!node) {
    return (
      <div
        className="card-3d panel-depth h-full rounded-xl flex flex-col items-center justify-center text-center p-6"
        style={{
          background: 'rgba(6,7,10,0.7)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <User className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.15)' }} />
        </div>
        <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Click any node in the 3D canvas to inspect entity intelligence
        </p>
      </div>
    );
  }

  const connectedEdges = edges.filter(e => e.source === node.id || e.target === node.id);
  const glowBase = TYPE_GLOW[node.type] ?? 'rgba(148,154,166,';
  const glowColor = `${glowBase}0.4)`;
  const glowFaint = `${glowBase}0.08)`;

  return (
    <div
      className="card-3d h-full rounded-xl flex flex-col overflow-hidden"
      style={{
        background: 'rgba(6,7,10,0.95)',
        border: `1px solid ${glowBase}0.2)`,
        boxShadow: `0 0 40px ${glowFaint}, inset 0 1px 0 ${glowBase}0.1)`,
        transform: visible
          ? 'perspective(900px) rotateY(0deg) translateX(0px) translateZ(0px)'
          : 'perspective(900px) rotateY(8deg) translateX(30px) translateZ(-20px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.45s cubic-bezier(0.23,1,0.32,1), opacity 0.35s ease',
      }}
    >
      {/* Holo top line */}
      <div className="h-px holo opacity-50 shrink-0" style={{ filter: `hue-rotate(${node.type === 'PERSON' ? '130deg' : '0deg'})` }} />

      {/* Header */}
      <div
        className="relative px-4 py-3 shrink-0"
        style={{
          background: `linear-gradient(135deg, ${glowBase}0.12) 0%, transparent 70%)`,
          borderBottom: `1px solid ${glowBase}0.1)`,
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded tracking-wider"
                style={{
                  background: `${glowBase}0.12)`,
                  border: `1px solid ${glowBase}0.3)`,
                  color: glowColor,
                  boxShadow: `0 0 10px ${glowFaint}`,
                }}
              >
                {node.type}
              </span>
              {node.is_possible_duplicate && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <AlertTriangle className="w-2.5 h-2.5" /> Possible Duplicate
                </span>
              )}
            </div>
            <h3
              className="text-base font-bold truncate"
              style={{ color: '#E2E8F0', textShadow: `0 0 20px ${glowBase}0.3)` }}
            >
              {node.label}
            </h3>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              ID: {node.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-3d ml-2 w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

        {/* Confidence gauge */}
        <div
          className="card-3d p-3 rounded-xl"
          style={{
            background: `${glowBase}0.04)`,
            border: `1px solid ${glowBase}0.12)`,
          }}
        >
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <Activity className="w-3 h-3" /> Association Score
            </span>
            <span className="font-bold" style={{ color: glowColor }}>
              {(node.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div
              className="h-1.5 rounded-full"
              style={{
                width: `${node.confidence * 100}%`,
                background: `linear-gradient(90deg, ${glowColor}, rgba(6,182,212,0.8))`,
                boxShadow: `0 0 8px ${glowBase}0.5)`,
                transition: 'width 0.8s cubic-bezier(0.23,1,0.32,1)',
              }}
            />
          </div>
        </div>

        {/* Attributes */}
        {Object.keys(node.attributes || {}).length > 0 && (
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Identifiers
            </p>
            <div
              className="card-3d rounded-xl p-3 space-y-1.5"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              {Object.entries(node.attributes || {}).map(([key, val]) => (
                <div key={key} className="flex justify-between text-[11px] font-mono">
                  <span style={{ color: 'rgba(255,255,255,0.35)' }} className="capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span style={{ color: '#94A3B8' }} className="text-right ml-2 truncate max-w-32">
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relationships */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Relationships ({connectedEdges.length})
            </p>
            <button
              onClick={() => onExpand(node.id)}
              className="btn-3d text-[10px] font-mono px-2 py-0.5 rounded"
              style={{
                background: `${glowBase}0.08)`,
                border: `1px solid ${glowBase}0.2)`,
                color: glowColor,
              }}
            >
              <GitBranch className="w-3 h-3 inline mr-1" />
              Expand
            </button>
          </div>

          <div className="space-y-2">
            {connectedEdges.slice(0, 8).map((edge, idx) => (
              <div
                key={idx}
                className="card-3d rounded-lg p-2.5"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                  <span
                    className="font-bold"
                    style={{ color: glowColor }}
                  >
                    {edge.type}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {edge.timestamp ? new Date(edge.timestamp).toLocaleDateString('en-IN') : 'N/A'}
                  </span>
                </div>
                <div className="text-[10px] font-mono" style={{ color: '#64748B' }}>
                  {edge.source === node.id ? `→ ${edge.target}` : `← ${edge.source}`}
                </div>
                {edge.evidence && (
                  <p className="text-[10px] mt-1.5 italic px-2 py-1 rounded"
                    style={{ background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.3)', borderLeft: `2px solid ${glowBase}0.3)` }}>
                    {edge.evidence.slice(0, 80)}{edge.evidence.length > 80 ? '…' : ''}
                  </p>
                )}
                <div className="flex justify-between text-[9px] font-mono mt-1.5"
                  style={{ color: 'rgba(255,255,255,0.2)' }}>
                  <span>{edge.source_document}</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    {(edge.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
            {connectedEdges.length > 8 && (
              <p className="text-center text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
                +{connectedEdges.length - 8} more relationships
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
