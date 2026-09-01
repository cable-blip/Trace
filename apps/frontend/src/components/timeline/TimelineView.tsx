import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Play, Pause, SkipBack, SkipForward, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { Edge } from '../../types';

interface TimelineViewProps {
  edges: Edge[];
  onSelectEdge?: (edge: Edge) => void;
  onTimeFilterChange?: (maxTimestamp: string | null) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  edges,
  onSelectEdge,
  onTimeFilterChange,
}) => {
  // Filter edges that have valid timestamps and sort chronologically
  const datedEdges = edges
    .filter((e): e is Edge & { timestamp: string } => typeof e.timestamp === 'string')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const [currentIndex, setCurrentIndex] = useState<number>(datedEdges.length > 0 ? datedEdges.length - 1 : 0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playIntervalRef = useRef<number | null>(null);

  // Sync index if edges change
  useEffect(() => {
    if (datedEdges.length > 0) {
      setCurrentIndex(datedEdges.length - 1);
    }
  }, [edges.length]);

  // Handle scrubber change
  const handleIndexChange = (index: number) => {
    setCurrentIndex(index);
    if (onTimeFilterChange && datedEdges[index]) {
      onTimeFilterChange(datedEdges[index].timestamp);
    }
  };

  // Playback controls
  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = window.setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          if (next >= datedEdges.length) {
            setIsPlaying(false);
            return prev;
          }
          if (onTimeFilterChange && datedEdges[next]) {
            onTimeFilterChange(datedEdges[next].timestamp);
          }
          return next;
        });
      }, 1000);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, datedEdges.length]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    if (onTimeFilterChange && datedEdges[0]) {
      onTimeFilterChange(datedEdges[0].timestamp);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentIndex < datedEdges.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      if (onTimeFilterChange && datedEdges[next]) {
        onTimeFilterChange(datedEdges[next].timestamp);
      }
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      if (onTimeFilterChange && datedEdges[prev]) {
        onTimeFilterChange(datedEdges[prev].timestamp);
      }
    }
  };

  const handleResetAllTime = () => {
    setIsPlaying(false);
    setCurrentIndex(datedEdges.length - 1);
    if (onTimeFilterChange) {
      onTimeFilterChange(null); // Show everything
    }
  };

  const activeEdge = datedEdges[currentIndex];

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
          <Clock className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xs font-bold tracking-widest text-cyan-300 uppercase font-mono"
            style={{ textShadow: '0 0 12px rgba(6,182,212,0.5)' }}>
            Temporal Simulator
          </h2>
          <p className="text-[10px] font-mono text-slate-600">Event Playback Control</p>
        </div>
        <span className="ml-auto text-[10px] font-mono text-slate-500">
          {datedEdges.length} events logged
        </span>
      </div>

      {datedEdges.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-600 font-mono text-xs">
          No timestamped event sequence data available in current case.
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Active node detail card */}
          {activeEdge && (
            <div
              className="card-3d rounded-xl p-3.5 border border-white/5 space-y-2 shrink-0 mb-4"
              style={{ background: 'rgba(255,255,255,0.01)' }}
            >
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-500">Event {currentIndex + 1} of {datedEdges.length}</span>
                <span
                  className="font-bold px-2 py-0.5 rounded"
                  style={{
                    background: 'rgba(6,182,212,0.12)',
                    border: '1px solid rgba(6,182,212,0.3)',
                    color: '#06B6D4',
                  }}
                >
                  {activeEdge.type}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300 font-bold">
                  {new Date(activeEdge.timestamp!).toLocaleString('en-IN')}
                </span>
              </div>
              
              <div
                className="text-xs font-mono py-1 text-slate-200"
                onClick={() => onSelectEdge && onSelectEdge(activeEdge)}
                style={{ cursor: 'pointer' }}
              >
                <span className="text-cyan-500">{activeEdge.source}</span>
                <span className="text-slate-600 px-1.5">→</span>
                <span className="text-emerald-500">{activeEdge.target}</span>
              </div>

              {activeEdge.evidence && (
                <p className="text-[11px] font-sans leading-relaxed text-slate-400 italic bg-white/2 p-2 rounded border border-white/5">
                  "{activeEdge.evidence}"
                </p>
              )}

              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-600" /> {activeEdge.source_document}
                </span>
                <span className="flex items-center gap-1 text-emerald-500">
                  <CheckCircle2 className="w-3 h-3" /> {(activeEdge.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}

          {/* Timeline slider bar */}
          <div className="flex-1 flex flex-col justify-end space-y-4">
            
            {/* Horizontal Timeline Track */}
            <div className="relative h-14 bg-white/2 border border-white/5 rounded-xl px-4 flex items-center overflow-x-auto">
              <div className="absolute left-0 right-0 h-0.5 bg-slate-800" />
              {datedEdges.map((edge, idx) => {
                const isPassed = idx <= currentIndex;
                const isActive = idx === currentIndex;
                return (
                  <div
                    key={idx}
                    className="relative flex-1 shrink-0 flex flex-col items-center justify-center cursor-pointer min-w-8"
                    onClick={() => handleIndexChange(idx)}
                  >
                    <div
                      className="w-3 h-3 rounded-full border-2 transition-all duration-300 z-10"
                      style={{
                        background: isActive ? '#06B6D4' : isPassed ? '#10B981' : '#0F172A',
                        borderColor: isActive ? '#fff' : isPassed ? '#10B981' : '#334155',
                        boxShadow: isActive ? '0 0 12px #06B6D4' : 'none',
                        transform: isActive ? 'scale(1.3)' : 'scale(1)',
                      }}
                    />
                    <span className="text-[8px] font-mono text-slate-600 absolute bottom-1 truncate max-w-full">
                      {edge.timestamp!.split('T')[0].split('-').slice(1).join('/')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Playback HUD controls */}
            <div
              className="p-3.5 rounded-xl border border-white/5 flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.01)' }}
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-3d w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 text-slate-400"
                  title="Reset to Start"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleStepBackward}
                  className="btn-3d w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 text-slate-400"
                  title="Step Backward"
                >
                  <Clock className="w-3.5 h-3.5 transform scale-x-[-1]" />
                </button>
                <button
                  type="button"
                  onClick={handlePlayToggle}
                  className="btn-3d w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: isPlaying ? 'rgba(239,68,68,0.1)' : 'rgba(6,182,212,0.1)',
                    border: isPlaying ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(6,182,212,0.3)',
                    color: isPlaying ? '#EF4444' : '#06B6D4',
                  }}
                  title={isPlaying ? 'Pause' : 'Play Simulation'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-cyan-400/20" />}
                </button>
                <button
                  type="button"
                  onClick={handleStepForward}
                  className="btn-3d w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 text-slate-400"
                  title="Step Forward"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Range reset button */}
              <button
                type="button"
                onClick={handleResetAllTime}
                className="btn-3d text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg text-cyan-300"
                style={{
                  background: 'rgba(6,182,212,0.08)',
                  border: '1px solid rgba(6,182,212,0.2)',
                }}
              >
                Reset Time Range
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};
