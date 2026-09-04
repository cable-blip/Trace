import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, Mic, Radio, FileText, UserCheck, ShieldAlert } from 'lucide-react';

interface TranscriptLine {
  id: number;
  time: string;
  speaker: string;
  text: string;
  entities: string[];
}

const MOCK_TRANSCRIPT: TranscriptLine[] = [
  {
    id: 1,
    time: '00:02',
    speaker: 'Devendra Sharma',
    text: 'Victor, the Nhava Sheva container shipment is arriving at 03:00 AM. Is Tariq ready at Warehouse 17?',
    entities: ['Nhava Sheva', 'Tariq', 'Warehouse 17'],
  },
  {
    id: 2,
    time: '00:07',
    speaker: 'Victor Vance',
    text: 'Tariq has 4 trucks standby. Ramesh Kumar is driving the lead transport MH-04-AB-1234.',
    entities: ['Tariq', 'Ramesh Kumar', 'MH-04-AB-1234'],
  },
  {
    id: 3,
    time: '00:14',
    speaker: 'Devendra Sharma',
    text: 'Make sure the SWIFT bank transfer of 65 Lakhs clears to account ACC-111222 before the gates open.',
    entities: ['SWIFT', 'ACC-111222'],
  },
  {
    id: 4,
    time: '00:21',
    speaker: 'Victor Vance',
    text: 'Understood. The customs agent is cleared. Nobody touches container #MUK-8891.',
    entities: ['MUK-8891'],
  },
];

export const WiretapAudioInspector: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLine, setActiveLine] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveLine(prev => (prev + 1) % MOCK_TRANSCRIPT.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="card-3d p-4 rounded-xl border border-white/5 bg-surface/90 font-sans space-y-4">
      {/* Header HUD */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 font-mono">
          <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Live Audio Wiretap & Transcript Intercept
          </span>
        </div>
        <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
          FREQUENCY: 844.2 MHz (ENCRYPTED)
        </span>
      </div>

      {/* Audio Waveform Simulator Bar */}
      <div className="p-3 rounded-lg border border-white/5 bg-black/40 flex items-center justify-between gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-3 rounded-full transition flex items-center justify-center font-mono ${
            isPlaying ? 'bg-amber-500 text-black font-bold shadow-[0_0_16px_rgba(245,158,11,0.6)]' : 'bg-cyan-500 text-black font-bold shadow-[0_0_16px_rgba(6,182,212,0.6)]'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        {/* Animated Bar Visualizer */}
        <div className="flex-1 flex items-center gap-1 h-8 overflow-hidden">
          {Array.from({ length: 36 }).map((_, idx) => (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all duration-300 ${
                isPlaying ? 'bg-amber-400' : 'bg-slate-700'
              }`}
              style={{
                height: isPlaying ? `${Math.floor(Math.sin(idx + activeLine) * 12 + 18)}px` : '6px',
              }}
            />
          ))}
        </div>

        <div className="font-mono text-xs text-amber-400 font-bold shrink-0">
          {MOCK_TRANSCRIPT[activeLine].time} / 00:30
        </div>
      </div>

      {/* Transcript Line-by-Line List */}
      <div className="space-y-2 pr-1">
        {MOCK_TRANSCRIPT.map((line, idx) => {
          const isActive = idx === activeLine;
          return (
            <div
              key={line.id}
              onClick={() => setActiveLine(idx)}
              className={`p-3 rounded-lg border transition cursor-pointer font-mono text-xs ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/40 text-slate-100 shadow-md'
                  : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  {line.speaker}
                </span>
                <span className="text-slate-500">{line.time}</span>
              </div>
              <p className="font-sans text-xs leading-relaxed text-slate-200">{line.text}</p>

              {/* Entity Badges */}
              <div className="flex flex-wrap gap-1 mt-2">
                {line.entities.map(ent => (
                  <span
                    key={ent}
                    className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono"
                  >
                    #{ent}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
