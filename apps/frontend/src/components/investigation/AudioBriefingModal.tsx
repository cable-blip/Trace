import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2, VolumeX, Play, Pause, RotateCcw, X, ShieldAlert,
  Radio, Sparkles, Activity, Lock
} from 'lucide-react';

interface AudioBriefingModalProps {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CASE_BRIEFINGS: Record<string, {
  title: string;
  classification: string;
  transcript: string;
  leadTarget: string;
}> = {
  'CASE-001': {
    title: 'OPERATION NEXUS // MARITIME CONTRABAND & HAWALA LIQUIDATION',
    classification: 'TOP SECRET // LAW ENFORCEMENT DIRECTIVE',
    transcript: (
      'Attention Task Force. This is Directive 09. Operation Nexus targets an organized maritime smuggling syndicate ' +
      'operating through Nhava Sheva Container Yard 4. Primary target Victor Vance has established high-frequency burner ' +
      'communications with logistics broker Devendra Sharma. Financial forensic audits trace an advance Hawala liquidation ' +
      'of INR 1.2 Crore via dummy jewelers in Zaveri Bazaar to Tariq Ahmed. Contraband transit carrier truck MH-04-AB-1234 ' +
      'was intercepted on the Vashi Bridge corridor with biometric DNA matches linking container MUK-8891 to Bhiwandi Warehouse 17. ' +
      'Judicial arrest warrants are armed for immediate multi-sector execution.'
    ),
    leadTarget: 'Victor Vance',
  },
  'CASE-002': {
    title: 'OPERATION BLACKOUT // BANKING TROJAN & OFFSHORE MULE NETWORK',
    classification: 'CYBER COMMAND CRITICAL',
    transcript: (
      'Task Force briefing for Operation Blackout. State-level cyber intrusion identified at Server Vault 09 Bengaluru. ' +
      'Lead threat actor Karan Mehra deployed a zero-day memory exploit siphoning INR 65 Lakhs across 40 money-mule accounts ' +
      'supervised by Ananya Roy in Electronic City. Digital forensics confirms automated cross-chain privacy coin conversions ' +
      'routed to Cayman Offshore Escrow Trust. Immediate server containment and FIU asset freezing orders are active.'
    ),
    leadTarget: 'Karan Mehra',
  },
  'CASE-003': {
    title: 'OPERATION VULTURE // MARITIME PORT ARMS CONVOY',
    classification: 'DEFENSE INTELLIGENCE MAXIMUM',
    transcript: (
      'Intelligence briefing for Operation Vulture. Arms trafficking syndicate orchestrated by Captain Kabir Rao detected at Mundra Port ' +
      'Terminal 3. Broker Feroz Khan authorized unauthorized customs clearance for container ARM-90. Armored SUV transit KA-01-MJ-9999 ' +
      'intercepted at Bhuj highway roadblock. Ballistic evidence and satellite phone intercepts confirm multi-state distribution.'
    ),
    leadTarget: 'Captain Kabir Rao',
  },
  'CASE-004': {
    title: 'OPERATION DARKNET GHOST // ENCRYPTED SYNTHETIC NARCOTICS',
    classification: 'NARCOTICS CONTROL BUREAU TOP SECRET',
    transcript: (
      'Operation DarkNet Ghost briefing. Cryptographic drug distribution ring led by Zack Alva operating via Goa coastal safehouses. ' +
      'Coinjoin tumbler transactions engineered by Meera Sen fund bulk synthetic narcotics dead-drops along Calangute Beach coordinates. ' +
      'Plainclothes interception teams are deployed with infrared surveillance.'
    ),
    leadTarget: 'Zack Alva',
  },
  'CASE-005': {
    title: 'OPERATION GOLDEN FALCON // DUBAI BULLION AIR PIPELINE',
    classification: 'DIRECTORATE OF REVENUE INTELLIGENCE CLASSIFIED',
    transcript: (
      'Operation Golden Falcon briefing. Transnational bullion smuggling network originating from Deira Gold Souk Dubai, headed by Mansoor Merchant. ' +
      'Air courier Fatima Al-Sayed intercepted at Mumbai T2 Green Channel with 8.5 kilograms concealed 24K gold paste. ' +
      'Hawala coordinator Rashid Qureshi and Zaveri Bazaar smelter Sanjay Zaveri detained for joint prosecution.'
    ),
    leadTarget: 'Mansoor Merchant',
  },
};

export const AudioBriefingModal: React.FC<AudioBriefingModalProps> = ({ caseId, isOpen, onClose }) => {
  const briefing = CASE_BRIEFINGS[caseId] || CASE_BRIEFINGS['CASE-001'];
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const handleTogglePlay = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
    } else {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(briefing.transcript);
      utterance.rate = speechRate;
      utterance.pitch = 0.95;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      synthRef.current.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleClose = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="card-3d w-full max-w-2xl rounded-2xl border border-cyan-500/40 bg-surface/98 p-6 space-y-5 shadow-[0_0_50px_rgba(0,210,255,0.25)] relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(6,7,10,0.98) 100%)' }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono text-[9px] font-bold border border-red-500/40">
                {briefing.classification}
              </span>
              <h2 className="text-sm font-bold font-mono text-white mt-1">{briefing.title}</h2>
            </div>
          </div>

          <button onClick={handleClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animated Frequency Spectrum Waves */}
        <div className="p-4 rounded-xl bg-black/70 border border-white/5 flex items-center justify-center gap-1.5 h-16">
          {Array.from({ length: 28 }).map((_, i) => {
            const heightMultiplier = isPlaying ? Math.sin(i * 0.4 + Date.now() * 0.005) * 0.5 + 0.5 : 0.15;
            return (
              <span
                key={i}
                className="w-1 rounded-full bg-cyan-400 transition-all duration-150"
                style={{
                  height: `${Math.max(6, heightMultiplier * 36)}px`,
                  opacity: isPlaying ? 0.9 : 0.3,
                  boxShadow: isPlaying ? '0 0 8px #00D2FF' : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Teleprompter Transcript */}
        <div className="p-4 rounded-xl bg-black/50 border border-white/5 font-mono text-xs text-slate-200 leading-relaxed max-h-48 overflow-y-auto space-y-2">
          <div className="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Synthetic Voice Speech-to-Audio Dispatch
          </div>
          <p className="text-slate-300 font-sans text-xs leading-relaxed">
            "{briefing.transcript}"
          </p>
        </div>

        {/* Control Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span>Primary Target:</span>
            <strong className="text-white">{briefing.leadTarget}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePlay}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-black transition flex items-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.4)]"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlaying ? 'PAUSE VOICE BRIEFING' : 'PLAY AUDIO BRIEFING'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
