import React, { useState, useEffect } from 'react';
import {
  Mic, ShieldAlert, Heart, Activity, AlertTriangle, CheckCircle,
  FileText, Send, User, Sparkles, RefreshCw, Zap, Scale, Building, Car
} from 'lucide-react';
import { Node } from '../../types';
import { interrogateSuspect } from '../../services/api';

interface SuspectInterrogationSimulatorProps {
  caseId: string;
  suspects: Node[];
}

interface ChatMessage {
  sender: 'INVESTIGATOR' | 'SUSPECT';
  text: string;
  stress?: number;
  heartRate?: number;
  deception?: boolean;
}

// Suspect-Specific Intelligence Dossiers for Dynamic Questioning
const SUSPECT_CONTEXTS: Record<string, {
  role: string;
  allegation: string;
  initialQuote: string;
  presetQuestions: string[];
  evidenceExhibits: string[];
}> = {
  person_devendra: {
    role: "Syndicate Financier / Kingpin",
    allegation: "Channeling INR 2.40 Cr Hawala funds to Dubai and coordinating contraband clearance.",
    initialQuote: "I run Apex Logistics, officer. We process thousands of international trade documents daily. You have no legal standing to detain me.",
    presetQuestions: [
      "Explain the INR 2.40 Crore Hawala transfer to Gulf Horizon FZE.",
      "We found your fingerprints on the fake shipping bill for Container 904.",
      "Tariq Ahmed confessed that you financed the entire Nhava Sheva consignment.",
      "Why did your phone exchange 14 encrypted calls with Victor Vance at 2 AM?"
    ],
    evidenceExhibits: [
      "SWIFT Hawala Wire: INR 2,40,00,000 to Dubai (tx_018.json)",
      "Fingerprints on False Shipping Bill #NH-409",
      "VoIP Call Record with Dubai Syndicate Lead Victor Vance",
      "Apex Logistics Corporate Shareholding Registry"
    ]
  },
  person_ramesh: {
    role: "Port Customs Clearance Agent",
    allegation: "Granting green-channel customs clearance waivers for illicit cargo in exchange for bribes.",
    initialQuote: "I followed standard port protocol. I am not responsible for what was hidden inside sealed maritime containers!",
    presetQuestions: [
      "Why did vehicle MH-04 pass Vashi toll 70 seconds behind the contraband truck?",
      "Explain the INR 25,00,000 cash deposit into your cooperative account.",
      "Your DNA was identified on the cleared shipping container lock seals.",
      "You signed the green-channel waiver without mandatory optical scanner inspection."
    ],
    evidenceExhibits: [
      "ANPR Convoy Telemetry: MH-04 at Vashi Toll Gate",
      "Bank Payoff Deposit: INR 25,00,000 (ACC-MUMBAI-4422)",
      "Forensic DNA Match on Container Locking Seal",
      "Falsified Port Inspection Waiver Certificate"
    ]
  },
  person_tariq: {
    role: "Warehouse Operator / Consignment Receiver",
    allegation: "Operating Warehouse 17 as a clandestine narcotics and contraband staging facility.",
    initialQuote: "I was out of town in Pune during the entire week of the incident. You have the wrong person!",
    presetQuestions: [
      "Your phone connected to Nhava Sheva tower 32 times between 1 AM and 4 AM.",
      "We seized 14 latent fingerprints matching you on the transport crates.",
      "Imran Khan stated you ordered the security cameras disabled during offloading.",
      "Explain the secondary burner handset (+91-98000-77788) recovered from your desk."
    ],
    evidenceExhibits: [
      "Cell Tower Base Station Triangulation: 32 hits at Warehouse 17",
      "14 Friction Ridge Fingerprints on Seized Transport Crates",
      "Warehouse 17 Biometric Lock Electronic Access Log",
      "Burner SIM Card & Dual IMEI Intercept Log"
    ]
  },
  person_imran: {
    role: "Security Guard & Offloading Proxy",
    allegation: "Disabling facility surveillance cameras and assisting midnight container offloading.",
    initialQuote: "Please officer, I was just doing my night security shift. I don't know what was inside those wooden boxes!",
    presetQuestions: [
      "Why did you call Tariq Ahmed 24 times during the police raid?",
      "Why was CCTV Camera #04 disabled between 1:00 AM and 4:30 AM?",
      "You were caught on site holding the warehouse gate keys during the raid.",
      "If you cooperate and name the mastermind now, the prosecution will consider leniency."
    ],
    evidenceExhibits: [
      "24 Intercepted Phone Calls to Tariq Ahmed during Raid",
      "CCTV System Power Cut Tampering Log at 01:15 AM",
      "Security Gate Physical Sign-In Register",
      "On-Site Crime Branch Apprehension Panchnama"
    ]
  },
  person_suresh: {
    role: "Wholesale Contraband Distributor",
    allegation: "Coordinating secondary street distribution and wholesale market offloading.",
    initialQuote: "I run a wholesale vegetable stall in Vashi APMC market. I have never seen these people in my life.",
    presetQuestions: [
      "Why did Devendra Sharma call you immediately before the container arrival?",
      "We found encrypted distribution ledgers listing your APMC stall code.",
      "Explain the vehicle transit logs matching your commercial van at Dockyard Road."
    ],
    evidenceExhibits: [
      "Encrypted Distribution Ledger with Code SUR-09",
      "Call Detail Record with Devendra Sharma",
      "APMC Market Warehouse Delivery Manifest"
    ]
  },
  person_karan: {
    role: "Lead Threat Actor / Exploit Developer",
    allegation: "Deploying State Banking Trojans and laundering ransom through Monero privacy pools.",
    initialQuote: "I am a freelance cybersecurity researcher. Finding server vulnerabilities is my job, not a crime.",
    presetQuestions: [
      "We recovered the private SSH keys for Server Vault 09 from your laptop.",
      "Explain the 14.5 BTC cross-chain swap into privacy coin XMR.",
      "Ananya Roy confirmed your handle 'CyberGh0st' on the Telegram command channel."
    ],
    evidenceExhibits: [
      "Server Vault 09 SSH Root Key Certificate",
      "Monero XMR-WALLET-8844 Blockchain Bridge Ledger",
      "Telegram 'CyberGh0st' Command & Control Export"
    ]
  },
  person_sheikh_mansoor: {
    role: "Gold Smuggling Syndicate Head",
    allegation: "Financing overseas gold bullion paste smuggling via Dubai-Mumbai air couriers.",
    initialQuote: "My bullion trading company in Dubai JAFZA is licensed by the UAE Government. You have no jurisdiction over me.",
    presetQuestions: [
      "Flight manifest Emirates EK-504 connects you directly to courier Fatima Noor.",
      "Explain the 8.5 kg 24K gold paste seized at Mumbai Airport Green Channel.",
      "The Hawala ledger code FALCON-9988 matches your Dubai bank remittance."
    ],
    evidenceExhibits: [
      "Emirates Flight EK-504 Ticket Booking from Dubai FZE Account",
      "Customs Seizure Report: 8.5 kg 24K Gold Paste",
      "Hawala Ledger Code FALCON-9988 Matching UAE Remittance"
    ]
  }
};

export const SuspectInterrogationSimulator: React.FC<SuspectInterrogationSimulatorProps> = ({ caseId, suspects }) => {
  const personSuspects = suspects.filter(s => s.type === 'PERSON');
  const [selectedSuspect, setSelectedSuspect] = useState<string>(personSuspects[0]?.id || 'person_devendra');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stress, setStress] = useState(22);
  const [heartRate, setHeartRate] = useState(76);
  const [demeanor, setDemeanor] = useState('Guarded & Calm');
  const [confessionProb, setConfessionProb] = useState(15);
  const [deceptionFlag, setDeceptionFlag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [presentedEvidence, setPresentedEvidence] = useState<string[]>([]);

  // Get active suspect context
  const activeContext = SUSPECT_CONTEXTS[selectedSuspect] || {
    role: "Identified Co-Conspirator",
    allegation: "Suspected participation in criminal network operations.",
    initialQuote: "I have rights, officer. Talk to my legal counsel.",
    presetQuestions: [
      "Where were you during the primary operational timeline?",
      "Explain your telephone interactions with key syndicate members.",
      "We have electronic evidence placing you at the scene."
    ],
    evidenceExhibits: [
      "Call Detail Records Intercept Summary",
      "Physical Surveillance Field Report",
      "Financial Transaction Audit Log"
    ]
  };

  // Reset dialogue and populate suspect-specific context on suspect switch
  useEffect(() => {
    const suspectObj = personSuspects.find(s => s.id === selectedSuspect);
    const name = suspectObj?.label || 'Suspect';
    setMessages([
      {
        sender: 'SUSPECT',
        text: activeContext.initialQuote,
        stress: 20,
        heartRate: 74,
        deception: false,
      },
    ]);
    setStress(20);
    setHeartRate(74);
    setConfessionProb(12);
    setDemeanor('Guarded & Defensive');
    setPresentedEvidence([]);
    setDeceptionFlag(false);
  }, [selectedSuspect, caseId]);

  const handleSendQuestion = async (qText?: string) => {
    const activeQuestion = qText || question;
    if (!activeQuestion.trim() || loading) return;

    const userMsg: ChatMessage = { sender: 'INVESTIGATOR', text: activeQuestion };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await interrogateSuspect(caseId, selectedSuspect, activeQuestion, presentedEvidence, stress);
      const suspectMsg: ChatMessage = {
        sender: 'SUSPECT',
        text: res.response,
        stress: res.stress_level,
        heartRate: res.heart_rate_bpm,
        deception: res.deception_detected,
      };
      setMessages(prev => [...prev, suspectMsg]);
      setStress(res.stress_level);
      setHeartRate(res.heart_rate_bpm);
      setDemeanor(res.demeanor);
      setConfessionProb(res.confession_probability);
      setDeceptionFlag(res.deception_detected);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleEvidence = (ev: string) => {
    setPresentedEvidence(prev =>
      prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]
    );
  };

  const currentSuspectObj = personSuspects.find(s => s.id === selectedSuspect);

  return (
    <div className="h-full flex flex-col gap-3 font-sans overflow-hidden p-1">
      {/* ── Top Header HUD ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between card-3d p-3 rounded-xl border border-white/5 bg-[#090C12]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
                AI Suspect Interrogation Room
              </h2>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono text-[9px] font-bold border border-red-500/30">
                IN CUSTODY
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Target: <strong className="text-cyan-400">{currentSuspectObj?.label}</strong> ({activeContext.role})
            </span>
          </div>
        </div>

        {/* Target Suspect Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Select Target:</span>
          <select
            value={selectedSuspect}
            onChange={(e) => setSelectedSuspect(e.target.value)}
            className="bg-black/80 border border-cyan-500/40 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none cursor-pointer"
          >
            {personSuspects.map(s => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                {s.label} ({s.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Main Layout: Left Biometrics HUD, Center Chat, Right Evidence Drawer ── */}
      <div className="grid grid-cols-12 gap-3 flex-1 overflow-hidden">
        {/* Left: Biometrics Telemetry (3 cols) */}
        <div className="col-span-3 card-3d p-4 rounded-xl border border-white/5 bg-[#090C12] flex flex-col justify-between space-y-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 font-mono text-xs text-slate-400">
              <span>SUSPECT TELEMETRY</span>
              <span className="text-cyan-400 font-bold">{currentSuspectObj?.label}</span>
            </div>

            {/* Suspect Role Brief */}
            <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 space-y-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Alleged Function</span>
              <div className="text-xs font-mono text-amber-300 font-bold">{activeContext.role}</div>
              <p className="text-[10px] text-slate-400 leading-snug pt-0.5">{activeContext.allegation}</p>
            </div>

            {/* Stress Meter */}
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Stress Gauge:</span>
                <span className={`font-bold ${stress > 70 ? 'text-red-400' : stress > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {stress}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all duration-500 ${
                    stress > 70 ? 'bg-red-500 shadow-[0_0_12px_#EF4444]' :
                    stress > 40 ? 'bg-amber-400 shadow-[0_0_12px_#F59E0B]' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${stress}%` }}
                />
              </div>
            </div>

            {/* Heart Rate */}
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Heart className={`w-4 h-4 ${heartRate > 100 ? 'text-red-500 animate-ping' : 'text-emerald-400 animate-pulse'}`} />
                <span>Heart Rate</span>
              </div>
              <span className={`text-sm font-bold ${heartRate > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                {heartRate} BPM
              </span>
            </div>

            {/* Demeanor */}
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1 font-mono text-xs">
              <span className="text-[10px] text-slate-500 block uppercase">Psychological Demeanor</span>
              <span className="text-cyan-300 font-bold">{demeanor}</span>
            </div>

            {/* Deception Alert Indicator */}
            {deceptionFlag && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/40 flex items-center gap-2 text-red-400 font-mono text-xs animate-pulse">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>DECEPTION DETECTED: Statement contradicts verified evidence!</span>
              </div>
            )}

            {/* Confession Probability */}
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Confession Likelihood:</span>
                <span className="text-purple-400 font-bold">{confessionProb}%</span>
              </div>
              <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-purple-500 transition-all duration-500 shadow-[0_0_10px_#A855F7]"
                  style={{ width: `${confessionProb}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 font-mono text-[9px] text-slate-500 text-center">
            RECORDED UNDER EVIDENCE ACT SECTION 161 CrPC
          </div>
        </div>

        {/* Center: Live Dialogue Console (6 cols) */}
        <div className="col-span-6 card-3d rounded-xl border border-white/5 bg-[#090C12] flex flex-col justify-between overflow-hidden">
          {/* Dialogue Log */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto font-sans">
            {messages.map((m, idx) => {
              const isUser = m.sender === 'INVESTIGATOR';
              return (
                <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className="text-[10px] font-mono text-slate-500 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{isUser ? 'INVESTIGATOR' : currentSuspectObj?.label || 'SUSPECT'}</span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] text-xs font-sans leading-relaxed shadow-lg ${
                      isUser
                        ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-100 rounded-tr-none'
                        : 'bg-black/60 border border-white/10 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="font-mono text-xs text-cyan-400 animate-pulse flex items-center gap-2">
                <Activity className="w-4 h-4 animate-spin" />
                <span>Suspect is evaluating question pressure...</span>
              </div>
            )}
          </div>

          {/* Dynamic Context-Aware Pressure Questions */}
          <div className="px-4 py-2 border-t border-white/5 flex flex-col gap-1.5 shrink-0 bg-black/40">
            <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Suggested Target-Specific Questions:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {activeContext.presetQuestions.map(preset => (
                <button
                  key={preset}
                  onClick={() => handleSendQuestion(preset)}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-cyan-500/15 border border-white/10 text-[10px] font-mono text-slate-300 hover:text-cyan-300 whitespace-nowrap transition"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-white/5 bg-black/60 flex items-center gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuestion()}
              placeholder={`Ask ${currentSuspectObj?.label || 'suspect'} regarding ${activeContext.role}...`}
              className="flex-1 bg-black/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => handleSendQuestion()}
              disabled={loading || !question.trim()}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition disabled:opacity-50 shadow-[0_0_15px_rgba(0,210,255,0.4)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Suspect-Specific Evidence Exhibits Drawer (3 cols) */}
        <div className="col-span-3 card-3d p-4 rounded-xl border border-white/5 bg-[#090C12] flex flex-col justify-between space-y-4 overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Attached Exhibits
              </span>
              <span className="text-[10px] font-mono text-emerald-400">{presentedEvidence.length} SELECTED</span>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Attach exhibits to confront <strong>{currentSuspectObj?.label}</strong> and trigger confession.
            </p>

            {/* Evidence Checklist */}
            <div className="space-y-2">
              {activeContext.evidenceExhibits.map(ev => {
                const isSelected = presentedEvidence.includes(ev);
                return (
                  <button
                    key={ev}
                    onClick={() => toggleEvidence(ev)}
                    className={`w-full text-left p-2.5 rounded-lg border transition font-mono text-xs flex items-start gap-2 ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                        : 'bg-black/40 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <CheckCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className="text-[10.5px] leading-snug">{ev}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-black/60 border border-white/5 text-center font-mono text-[10px] text-slate-400">
            {presentedEvidence.length > 0
              ? `🔥 ${presentedEvidence.length} Exhibits Armed: Ready to break suspect alibi`
              : 'Click exhibits above to confront suspect with forensic proofs'}
          </div>
        </div>
      </div>
    </div>
  );
};
