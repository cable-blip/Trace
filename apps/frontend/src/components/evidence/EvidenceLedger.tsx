import React, { useState } from 'react';
import {
  Lock, ShieldCheck, FileCheck, Hash, Key, CheckCircle,
  Clock, Download, Eye, Layers, Search
} from 'lucide-react';

interface EvidenceLedgerProps {
  caseId: string;
}

interface EvidenceRecord {
  id: string;
  itemTag: string;
  category: 'BIOMETRIC_DNA' | 'DIGITAL_CDR' | 'FINANCIAL_WIRE' | 'SERVER_IMAGE' | 'BALLISTIC';
  seizureLocation: string;
  custodian: string;
  sha256Hash: string;
  timestamp: string;
  verifiedStatus: 'CRYPTOGRAPHICALLY_VERIFIED' | 'TAMPER_PROOF_LOCKED';
}

const CASE_LEDGERS: Record<string, EvidenceRecord[]> = {
  'CASE-001': [
    {
      id: 'EVID-001-A',
      itemTag: 'Container #MUK-8891 Contraband Blood Swab',
      category: 'BIOMETRIC_DNA',
      seizureLocation: 'Nhava Sheva Port Yard 4',
      custodian: 'Inspector R. Deshmukh (Forensics Lab Mumbai)',
      sha256Hash: '9e107d9d372bb6826bd81d3542a419d6b5e02ba6873ff6601b0f5908e7518428',
      timestamp: '2026-03-01 04:30:00 UTC',
      verifiedStatus: 'CRYPTOGRAPHICALLY_VERIFIED',
    },
    {
      id: 'EVID-001-B',
      itemTag: 'Thuraya Satellite Burner Phone Extract',
      category: 'DIGITAL_CDR',
      seizureLocation: 'Colaba Range Cell Tower #409',
      custodian: 'Cyber Forensics Division (CERT-In)',
      sha256Hash: 'a4b85c1639d679b32948c269229bb1f09c25f448c48a970921448df74092bbf1',
      timestamp: '2026-03-01 14:15:22 UTC',
      verifiedStatus: 'CRYPTOGRAPHICALLY_VERIFIED',
    },
    {
      id: 'EVID-001-C',
      itemTag: 'Zaveri Bazaar Escrow Hawala Ledger #332',
      category: 'FINANCIAL_WIRE',
      seizureLocation: 'Bhiwandi Warehouse 17 Raid',
      custodian: 'Directorate of Enforcement (ED)',
      sha256Hash: 'f7c3bc1d808e04732adf679965ccc34ca7ae3441ee1f1c998cffc16155609477',
      timestamp: '2026-03-02 08:00:11 UTC',
      verifiedStatus: 'TAMPER_PROOF_LOCKED',
    },
  ],
  'CASE-002': [
    {
      id: 'EVID-002-A',
      itemTag: 'Server Vault 09 RAM Dump & Raw Disk Image',
      category: 'SERVER_IMAGE',
      seizureLocation: 'Bengaluru Server Facility 09',
      custodian: 'Digital Evidence Unit (Cyber Command)',
      sha256Hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      timestamp: '2026-03-10 05:12:00 UTC',
      verifiedStatus: 'CRYPTOGRAPHICALLY_VERIFIED',
    },
  ],
  'CASE-003': [
    {
      id: 'EVID-003-A',
      itemTag: 'Ballistic Firearms Serial Registry & Container Seal',
      category: 'BALLISTIC',
      seizureLocation: 'Mundra Port Terminal 3',
      custodian: 'Customs Preventive Wing',
      sha256Hash: 'cb8379ac2098aa165029e3938a51da0bcecfc008fd6795f401178647f96c5b34',
      timestamp: '2026-03-15 02:40:00 UTC',
      verifiedStatus: 'CRYPTOGRAPHICALLY_VERIFIED',
    },
  ],
  'CASE-004': [
    {
      id: 'EVID-004-A',
      itemTag: 'Session PGP Keyring & Calangute Beach Geo-Drop Pack',
      category: 'DIGITAL_CDR',
      seizureLocation: 'Anjuna Coastal Safehouse Goa',
      custodian: 'Narcotics Control Bureau Special Unit',
      sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      timestamp: '2026-03-19 01:10:00 UTC',
      verifiedStatus: 'CRYPTOGRAPHICALLY_VERIFIED',
    },
  ],
  'CASE-005': [
    {
      id: 'EVID-005-A',
      itemTag: '8.5 kg 24K Concealed Gold Paste Smelt Assay',
      category: 'BIOMETRIC_DNA',
      seizureLocation: 'Mumbai Airport T2 Customs Belt',
      custodian: 'Government Mint & Assay Department',
      sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      timestamp: '2026-03-22 17:05:00 UTC',
      verifiedStatus: 'CRYPTOGRAPHICALLY_VERIFIED',
    },
  ],
};

export const EvidenceLedger: React.FC<EvidenceLedgerProps> = ({ caseId }) => {
  const records = CASE_LEDGERS[caseId] || CASE_LEDGERS['CASE-001'];
  const [search, setSearch] = useState('');

  const filtered = records.filter(r =>
    r.itemTag.toLowerCase().includes(search.toLowerCase()) ||
    r.sha256Hash.toLowerCase().includes(search.toLowerCase()) ||
    r.custodian.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-3 font-sans overflow-hidden p-1">
      {/* ── Top Header HUD ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between card-3d p-3 rounded-xl border border-white/5 bg-surface/90">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Lock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
              Cryptographic Evidence Chain-of-Custody Ledger ({caseId})
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">SHA-256 Tamper-Proof Digital Verification & Judicial Admissibility</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hash or custodian..."
              className="bg-black/60 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* ── Evidence Records List ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filtered.map(rec => (
          <div
            key={rec.id}
            className="card-3d p-5 rounded-xl border border-white/10 bg-surface/95 space-y-3 hover:border-emerald-500/40 transition shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/40">
                  {rec.id}
                </span>
                <span className="text-xs font-bold text-slate-200">{rec.itemTag}</span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{rec.verifiedStatus}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Seizure Location & Time</span>
                <div className="text-slate-200 font-bold">{rec.seizureLocation}</div>
                <div className="text-[10px] text-slate-400">{rec.timestamp}</div>
              </div>

              <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Current Legal Custodian</span>
                <div className="text-cyan-300 font-bold">{rec.custodian}</div>
                <div className="text-[10px] text-slate-400">Judicial Custody Lock #SEC-771</div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Hash */}
            <div className="p-3 rounded-lg bg-black/70 border border-emerald-500/30 flex items-center justify-between font-mono text-xs">
              <div className="space-y-0.5 overflow-hidden pr-2">
                <span className="text-[9px] text-emerald-400 uppercase flex items-center gap-1 font-bold">
                  <Hash className="w-3 h-3" /> SHA-256 Forensic Hash
                </span>
                <div className="text-[10px] text-slate-300 truncate">{rec.sha256Hash}</div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] shrink-0">
                LOCKED
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
