import React, { useState } from 'react';
import { Filter, Sliders, Search, RefreshCw, X } from 'lucide-react';
import { NodeType } from '../../types';

interface GraphFilterToolbarProps {
  minConfidence: number;
  onConfidenceChange: (val: number) => void;
  selectedNodeTypes: NodeType[];
  onToggleNodeType: (type: NodeType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onResetFilters: () => void;
}

const ALL_TYPES: NodeType[] = [
  'PERSON', 'PHONE', 'LOCATION', 'VEHICLE', 'ORGANIZATION', 'ACCOUNT', 'DOCUMENT'
];

export const GraphFilterToolbar: React.FC<GraphFilterToolbarProps> = ({
  minConfidence,
  onConfidenceChange,
  selectedNodeTypes,
  onToggleNodeType,
  searchQuery,
  onSearchChange,
  onResetFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Show indicator dot when filters are active
  const hasActiveFilters = selectedNodeTypes.length > 0 || minConfidence > 0.5 || searchQuery.trim().length > 0;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-surface/95 backdrop-blur-md border border-surface-border rounded-lg px-3 py-2 flex items-center justify-between text-xs font-sans cursor-pointer hover:border-accent-cyan/40 transition-all"
        style={{ boxShadow: '0 0 12px rgba(6,182,212,0.08)' }}
      >
        <div className="flex items-center gap-1.5 font-semibold text-text-primary uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Graph Filters & Thresholds</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
          )}
        </div>
        <span className="text-[10px] font-mono text-text-muted">click to expand</span>
      </button>
    );
  }

  return (
    <div
      className="bg-surface/95 backdrop-blur-md border border-surface-border rounded-lg p-3 text-xs font-sans space-y-2.5 shadow-xl"
      style={{ animation: 'fadeSlideIn 0.2s ease-out' }}
    >
      <div className="flex items-center justify-between border-b border-surface-border pb-2">
        <div className="flex items-center gap-1.5 font-semibold text-text-primary uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Graph Filters & Thresholds</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetFilters}
            className="text-[10px] font-mono text-text-muted hover:text-accent-cyan flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-text-muted hover:text-accent-cyan transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter nodes by label..."
          className="w-full bg-surface-elevated border border-surface-border rounded pl-8 pr-2 py-1 text-xs text-text-primary font-mono focus:outline-none focus:border-accent-cyan"
        />
      </div>

      {/* Confidence Threshold Slider */}
      <div>
        <div className="flex justify-between text-text-secondary font-mono text-[11px] mb-1">
          <span className="flex items-center gap-1"><Sliders className="w-3 h-3 text-accent-emerald" /> Min Confidence</span>
          <span className="text-accent-emerald font-semibold">{(minConfidence * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="1.0"
          step="0.05"
          value={minConfidence}
          onChange={(e) => onConfidenceChange(parseFloat(e.target.value))}
          className="w-full accent-accent-emerald bg-surface-elevated h-1.5 rounded cursor-pointer"
        />
      </div>

      {/* Node Type Filter Checkboxes */}
      <div>
        <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider block mb-1.5">
          Filter Node Types
        </span>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map((type) => {
            const active = selectedNodeTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => onToggleNodeType(type)}
                className={`px-2 py-0.5 rounded font-mono text-[10px] transition border ${
                  active
                    ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/40 font-semibold'
                    : 'bg-surface-elevated text-text-muted border-surface-border hover:text-text-secondary'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
