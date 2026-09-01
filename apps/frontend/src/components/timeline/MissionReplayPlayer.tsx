import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, RotateCcw, FastForward, SkipForward, SkipBack,
  Clock, ShieldAlert, Sparkles, MapPin, Radio, DollarSign, Car, User
} from 'lucide-react';
import { GraphData, Node } from '../../types';

interface MissionReplayPlayerProps {
  caseId: string;
  graphData: GraphData;
  onApplyHighlight: (nodeIds: string[], edgeIds: string[]) => void;
  onSelectNode: (node: Node | null) => void;
}

interface ReplayEvent {
  step: number;
  timestamp: string;
  title: string;
  category: 'COMMUNICATION' | 'FINANCIAL' | 'LOGISTICS' | 'MEETING' | 'RAID';
  involvedNodes: string[];
  involvedEdges: string[];
  description: string;
  coordinates?: string;
}

const CASE_REPLAY_EVENTS: Record<string, ReplayEvent[]> = {
  'CASE-001': [
    {
      step: 1,
      timestamp: '2026-03-01 02:15 AM',
      title: 'Initial Encrypted Satellite Call',
      category: 'COMMUNICATION',
      involvedNodes: ['person_victor', 'phone_victor_burner', 'phone_devendra'],
      involvedEdges: ['edge_1', 'edge_2'],
      description: 'Victor Vance initiates satellite communication with Devendra Sharma to negotiate transport clearance for container #MUK-8891.',
      coordinates: '18.9067 N, 72.8147 E (Colaba)',
    },
    {
      step: 2,
      timestamp: '2026-03-01 11:30 AM',
      title: 'Hawala Advance Wire Transfer',
      category: 'FINANCIAL',
      involvedNodes: ['acc_devendra_current', 'acc_tariq_hawala', 'person_tariq'],
      involvedEdges: ['edge_8', 'edge_11'],
      description: 'Devendra Sharma transmits INR 1.2 Crore via dummy jewelers escrow to Tariq Ahmed for port container clearance.',
      coordinates: '18.9507 N, 72.8315 E (Zaveri Bazaar)',
    },
    {
      step: 3,
      timestamp: '2026-03-02 03:14 AM',
      title: 'ANPR Night Convoy Transit',
      category: 'LOGISTICS',
      involvedNodes: ['veh_truck_1', 'loc_vashi_toll', 'person_ramesh'],
      involvedEdges: ['edge_15', 'edge_19'],
      description: 'Contraband carrier truck MH-04-AB-1234 driven by Ramesh Kumar passes Vashi Bridge Toll Gate towards Bhiwandi.',
      coordinates: '19.0645 N, 72.9961 E (Vashi Bridge)',
    },
    {
      step: 4,
      timestamp: '2026-03-02 05:45 AM',
      title: 'Warehouse Offloading & Staging',
      category: 'MEETING',
      involvedNodes: ['loc_warehouse_17', 'person_tariq', 'veh_truck_1'],
      involvedEdges: ['edge_22', 'edge_25'],
      description: 'Cargo transferred into Bhiwandi Warehouse 17 under supervision of Tariq Ahmed. 18 cell-tower handoffs recorded.',
      coordinates: '19.2812 N, 73.0489 E (Bhiwandi WH17)',
    },
    {
      step: 5,
      timestamp: '2026-03-03 01:00 AM',
      title: 'Tactical Joint Agency Interception Raid',
      category: 'RAID',
      involvedNodes: ['person_victor', 'person_tariq', 'person_devendra', 'person_ramesh'],
      involvedEdges: ['edge_1', 'edge_8', 'edge_15', 'edge_22'],
      description: 'Anti-Narcotics & DRI tactical teams execute coordinated raids across 4 locations, seizing 250 kg contraband.',
      coordinates: 'Multi-Sector Strike',
    },
  ],
  'CASE-002': [
    {
      step: 1,
      timestamp: '2026-03-10 03:40 AM',
      title: 'Trojan Exploit Infiltration',
      category: 'COMMUNICATION',
      involvedNodes: ['person_karan', 'server_vault_09', 'acc_mule_1'],
      involvedEdges: ['edge_c2_1', 'edge_c2_2'],
      description: 'Karan Mehra executes zero-day buffer overflow payload against core banking gateway at Server Vault 09.',
      coordinates: '12.9716 N, 77.5946 E (Bengaluru)',
    },
    {
      step: 2,
      timestamp: '2026-03-10 04:15 AM',
      title: 'Multi-Account Siphoning & Layering',
      category: 'FINANCIAL',
      involvedNodes: ['acc_mule_1', 'acc_mule_2', 'person_ananya'],
      involvedEdges: ['edge_c2_3', 'edge_c2_4'],
      description: 'Automated dispersal of INR 65 Lakhs across 40 money-mule accounts managed by Ananya Roy in Electronic City.',
      coordinates: '12.8399 N, 77.6770 E (Electronic City)',
    },
    {
      step: 3,
      timestamp: '2026-03-10 06:00 AM',
      title: 'Offshore Escrow Conversion',
      category: 'FINANCIAL',
      involvedNodes: ['acc_offshore_escrow', 'person_vikram'],
      involvedEdges: ['edge_c2_5'],
      description: 'Conversion of siphoned funds into privacy coins routed to Cayman Trust Corp escrow account.',
      coordinates: '19.2866 N, -81.3674 E (Cayman Islands)',
    },
  ],
  'CASE-003': [
    {
      step: 1,
      timestamp: '2026-03-15 01:20 AM',
      title: 'Maritime Port Container Release',
      category: 'LOGISTICS',
      involvedNodes: ['person_kabir', 'person_feroz', 'loc_mundra'],
      involvedEdges: ['edge_c3_1', 'edge_c3_2'],
      description: 'Captain Kabir Rao and port broker Feroz Khan facilitate midnight customs gate bypass for container #ARM-90.',
      coordinates: '22.8397 N, 69.7042 E (Mundra Port)',
    },
    {
      step: 2,
      timestamp: '2026-03-15 04:00 AM',
      title: 'Armored SUV Escort Intercept',
      category: 'RAID',
      involvedNodes: ['person_kabir', 'veh_armored_suv'],
      involvedEdges: ['edge_c3_3'],
      description: 'Armored convoy intercepted at Bhuj highway roadblock. DNA & ballistic weapons recovered.',
      coordinates: '23.2420 N, 69.6669 E (Bhuj Checkpost)',
    },
  ],
  'CASE-004': [
    {
      step: 1,
      timestamp: '2026-03-18 11:45 PM',
      title: 'Session PGP Dead-Drop Dispatch',
      category: 'COMMUNICATION',
      involvedNodes: ['person_zack', 'person_arjun', 'loc_anjuna'],
      involvedEdges: ['edge_c4_1', 'edge_c4_2'],
      description: 'Zack Alva coordinates GPS coordinates for 12 dead-drop narcotic packages in North Goa.',
      coordinates: '15.5808 N, 73.7427 E (Anjuna Beach)',
    },
  ],
  'CASE-005': [
    {
      step: 1,
      timestamp: '2026-03-22 08:30 AM',
      title: 'Dubai Bullion Air Courier Dispatch',
      category: 'LOGISTICS',
      involvedNodes: ['person_sheikh_mansoor', 'person_fatima', 'loc_deira'],
      involvedEdges: ['edge_c5_1'],
      description: 'Mansoor Merchant outfits air courier Fatima Al-Sayed with 8.5 kg concealed gold paste in Dubai Souk.',
      coordinates: '25.2711 N, 55.3075 E (Dubai Gold Souk)',
    },
    {
      step: 2,
      timestamp: '2026-03-22 03:15 PM',
      title: 'Airport Customs Green Channel Interception',
      category: 'RAID',
      involvedNodes: ['person_fatima', 'person_rashid', 'loc_mumbai_airport'],
      involvedEdges: ['edge_c5_2', 'edge_c5_3'],
      description: 'Customs officers intercept courier at Mumbai T2 arrival hall and detain receiver Rashid Qureshi.',
      coordinates: '19.0896 N, 72.8656 E (Mumbai Airport T2)',
    },
  ],
};

export const MissionReplayPlayer: React.FC<MissionReplayPlayerProps> = ({
  caseId, graphData, onApplyHighlight, onSelectNode,
}) => {
  const events = CASE_REPLAY_EVENTS[caseId] || CASE_REPLAY_EVENTS['CASE-001'];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const timerRef = useRef<any>(null);

  const activeEvent = events[currentStepIndex] || events[0];

  // Apply node and edge highlights on 3D canvas whenever the active event changes
  useEffect(() => {
    if (activeEvent) {
      onApplyHighlight(activeEvent.involvedNodes, activeEvent.involvedEdges);
    }
  }, [currentStepIndex, activeEvent, onApplyHighlight]);

  // Autoplay ticker
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 3500 / playbackSpeed;
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= events.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, playbackSpeed, events.length]);

  return (
    <div className="h-full flex flex-col gap-3 font-sans overflow-hidden p-1">
      {/* ── Top Header HUD ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between card-3d p-3 rounded-xl border border-white/5 bg-surface/90">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
              4D Tactical Mission Timeline Replay ({caseId})
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">Synchronized Spatial Graph & Chronological Incident Flow</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-2 bg-black/60 border border-white/10 p-1 rounded-xl">
          <button
            onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
            className="p-1.5 rounded hover:bg-white/10 text-slate-300"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 transition text-xs shadow-[0_0_12px_rgba(0,210,255,0.4)]"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY REPLAY'}</span>
          </button>
          <button
            onClick={() => setCurrentStepIndex(Math.min(events.length - 1, currentStepIndex + 1))}
            className="p-1.5 rounded hover:bg-white/10 text-slate-300"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <span className="w-px h-4 bg-white/10 mx-1" />
          {/* Speed Selector */}
          {[1, 2, 5].map(s => (
            <button
              key={s}
              onClick={() => setPlaybackSpeed(s)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                playbackSpeed === s ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* ── Active Incident Spotlight Banner ──────────────────────────── */}
      {activeEvent && (
        <div
          className="card-3d p-5 rounded-xl border border-cyan-500/30 bg-surface/95 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(6,7,10,0.98) 100%)' }}
        >
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40">
                STEP {activeEvent.step} / {events.length}
              </span>
              <span className="text-slate-400 font-bold">{activeEvent.timestamp}</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-purple-300">
                {activeEvent.category}
              </span>
            </div>

            <h3 className="text-base font-bold font-mono text-white tracking-wide">
              {activeEvent.title}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activeEvent.description}
            </p>

            {activeEvent.coordinates && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 pt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Sector GPS: {activeEvent.coordinates}</span>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-white/10 shrink-0 font-mono text-xs space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">Entities Illuminated</span>
            <div className="text-cyan-400 font-bold">{activeEvent.involvedNodes.length} Nodes Highlighted</div>
            <div className="text-emerald-400 font-bold">{activeEvent.involvedEdges.length} Relations Active</div>
          </div>
        </div>
      )}

      {/* ── Chronological Step Bar ────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-2 font-mono text-xs">
        {events.map((ev, idx) => {
          const isActive = currentStepIndex === idx;
          const isPast = currentStepIndex > idx;
          return (
            <button
              key={ev.step}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(idx);
              }}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                isActive
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(0,210,255,0.3)]'
                  : isPast
                  ? 'bg-black/40 border-emerald-500/30 text-emerald-400'
                  : 'bg-black/30 border-white/5 text-slate-500 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold">PHASE 0{ev.step}</span>
                <span>{ev.category}</span>
              </div>
              <div className="font-bold text-[11px] truncate text-slate-200">{ev.title}</div>
              <div className="text-[9px] text-slate-400">{ev.timestamp.split(' ')[1]}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
