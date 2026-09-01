import React, { useState, useEffect } from 'react';
import {
  TrendingUp, ShieldAlert, Clock, AlertOctagon, Target, ArrowRight,
  CheckCircle2, Radar, Activity, Zap, ExternalLink
} from 'lucide-react';
import { fetchThreatForecast } from '../../services/api';

interface ThreatForecastConsoleProps {
  caseId: string;
}

export const ThreatForecastConsole: React.FC<ThreatForecastConsoleProps> = ({ caseId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchThreatForecast(caseId);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [caseId]);

  if (loading || !data) {
    return (
      <div className="h-full card-3d rounded-xl flex items-center justify-center p-8 text-xs font-mono text-cyan-400 animate-pulse">
        Running Monte-Carlo Predictive Threat Network Simulation...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3 font-sans overflow-hidden p-1">
      {/* ── Top Header HUD ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between card-3d p-3 rounded-xl border border-white/5 bg-surface/90">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <TrendingUp className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
              Predictive Threat Forecasting & Interception Console ({caseId})
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">Probabilistic Next-Move Network Simulation</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1 rounded bg-red-500/20 border border-red-500/40 text-red-400 font-bold">
            OVERALL THREAT: {data.overall_syndicate_threat_score}/100
          </div>
          <div className="px-3 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
            {data.active_interception_windows} INTERCEPT WINDOWS
          </div>
        </div>
      </div>

      {/* ── Forecast Cards Grid ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {data.forecasts.map((f: any) => (
          <div
            key={f.id}
            className="card-3d p-5 rounded-xl border border-white/10 bg-surface/95 space-y-4 hover:border-cyan-500/40 transition shadow-lg"
          >
            {/* Top Meta Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-bold text-cyan-400">
                  {f.timeframe}
                </span>
                <span className="text-sm font-bold text-slate-100">{f.threat_type}</span>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-slate-400">Probability:</span>
                <span className="text-sm font-bold text-emerald-400">{f.probability}%</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    f.severity === 'MAXIMUM' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                    f.severity === 'CRITICAL' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {f.severity}
                </span>
              </div>
            </div>

            {/* Description & Target */}
            <div className="space-y-1.5 font-sans">
              <div className="text-xs font-mono text-cyan-300 font-bold">Target Vector: {f.target_entity}</div>
              <p className="text-xs text-slate-300 leading-relaxed">{f.description}</p>
            </div>

            {/* Actionable Interception Recommendation */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-cyan-500/30 flex items-start justify-between gap-3 font-mono">
              <div className="space-y-1">
                <div className="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Recommended Field Action
                </div>
                <div className="text-xs text-slate-200">{f.recommended_action}</div>
              </div>
              <button
                onClick={() => alert(`Deploying intercept protocol for ${f.target_entity}...`)}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shrink-0 transition shadow-md"
              >
                DEPLOY INTERCEPT
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
