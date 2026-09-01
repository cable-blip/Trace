import React from 'react';
import { BarChart3, Users, Network, ShieldAlert, Award, ChevronRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { AnalyticsResponse } from '../../types';

interface AnalyticsDashboardProps {
  analytics: AnalyticsResponse | null;
  onSelectNode: (nodeId: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  PERSON: '#10B981',
  PHONE: '#F59E0B',
  LOCATION: '#3B82F6',
  VEHICLE: '#EF4444',
  ORGANIZATION: '#8B5CF6',
  ACCOUNT: '#06B6D4',
  DOCUMENT: '#64748B',
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analytics, onSelectNode }) => {
  if (!analytics) {
    return (
      <div className="h-full card-3d rounded-xl flex items-center justify-center p-8 text-xs font-mono text-slate-500">
        Loading analytics engine metrics...
      </div>
    );
  }

  // Bar chart data for top key players
  const keyPlayersData = analytics.top_key_players.slice(0, 7).map(player => ({
    name: player.label,
    score: parseFloat((player.composite_score * 100).toFixed(1)),
    betweenness: parseFloat((player.betweenness_centrality * 100).toFixed(1)),
    degree: parseFloat((player.degree_centrality * 100).toFixed(1)),
    id: player.id,
  }));

  // Pie chart data for community breakdown
  const pieData = analytics.communities.map((comm, idx) => ({
    name: `Cell #${comm.community_id}`,
    value: comm.members.length,
    color: ['#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4'][idx % 6],
  }));

  return (
    <div className="h-full flex flex-col gap-3 font-sans overflow-y-auto p-1">
      {/* Metrics HUD Row */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        <div
          className="card-3d p-4 rounded-xl border border-white/5 flex items-center justify-between"
          style={{ background: 'rgba(6,182,212,0.04)' }}
        >
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
              Total Communities
            </span>
            <span className="text-2xl font-black font-mono text-cyan-400 text-glow-cyan">
              {analytics.communities.length}
            </span>
          </div>
          <Users className="w-8 h-8 text-cyan-400/30" />
        </div>

        <div
          className="card-3d p-4 rounded-xl border border-white/5 flex items-center justify-between"
          style={{ background: 'rgba(16,185,129,0.04)' }}
        >
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
              Key Players Tracked
            </span>
            <span className="text-2xl font-black font-mono text-emerald-400 text-glow-emerald">
              {analytics.top_key_players.length}
            </span>
          </div>
          <Award className="w-8 h-8 text-emerald-400/30" />
        </div>

        <div
          className="card-3d p-4 rounded-xl border border-white/5 flex items-center justify-between"
          style={{ background: 'rgba(139,92,246,0.04)' }}
        >
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
              Network Centrality
            </span>
            <span className="text-2xl font-black font-mono text-purple-400">
              {(analytics.top_key_players[0]?.composite_score * 100).toFixed(0)}%
            </span>
          </div>
          <Network className="w-8 h-8 text-purple-400/30" />
        </div>

        <div
          className="card-3d p-4 rounded-xl border border-white/5 flex items-center justify-between"
          style={{ background: 'rgba(239,68,68,0.04)' }}
        >
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
              Primary Threat Node
            </span>
            <span className="text-sm font-bold font-mono text-red-400 truncate max-w-32 block">
              {analytics.top_key_players[0]?.label ?? 'N/A'}
            </span>
          </div>
          <ShieldAlert className="w-8 h-8 text-red-400/30" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-3 flex-1 min-h-[320px]">
        {/* Left: Key Players Centrality Bar Chart (7 cols) */}
        <div
          className="col-span-7 card-3d p-4 rounded-xl border border-white/5 flex flex-col justify-between"
          style={{ background: 'rgba(6,7,10,0.8)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Top Key Player Centrality Leaderboard
            </span>
            <span className="text-[10px] font-mono text-slate-500">Composite Score Rating</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={keyPlayersData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#06070A', borderColor: 'rgba(6,182,212,0.3)', borderRadius: 8, fontSize: 11, fontFamily: 'monospace' }}
                  itemStyle={{ color: '#06B6D4' }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {keyPlayersData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#EF4444' : index === 1 ? '#F59E0B' : '#06B6D4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Community Breakdown Pie Chart (5 cols) */}
        <div
          className="col-span-5 card-3d p-4 rounded-xl border border-white/5 flex flex-col justify-between"
          style={{ background: 'rgba(6,7,10,0.8)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider">
              Criminal Cell Distribution
            </span>
            <span className="text-[10px] font-mono text-slate-500">Louvain Clusters</span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#06070A', borderColor: 'rgba(139,92,246,0.3)', borderRadius: 8, fontSize: 11, fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 justify-center pt-2 border-t border-white/5">
            {pieData.map((p, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                <span>{p.name}: {p.value} members</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Community Details Breakdown List */}
      <div
        className="card-3d p-4 rounded-xl border border-white/5 space-y-3 shrink-0"
        style={{ background: 'rgba(6,7,10,0.8)' }}
      >
        <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
          Community Cluster Breakdown
        </span>

        <div className="grid grid-cols-3 gap-3">
          {analytics.communities.map(comm => (
            <div
              key={comm.community_id}
              className="p-3 rounded-lg border border-white/5 space-y-1.5"
              style={{ background: 'rgba(255,255,255,0.01)' }}
            >
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="font-bold text-cyan-400">Cell #{comm.community_id}</span>
                <span className="text-[10px] text-slate-500">{comm.members.length} members</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate">
                {comm.members.map(m => (
                  <button
                    key={m}
                    onClick={() => onSelectNode(m)}
                    className="hover:text-cyan-300 hover:underline mr-1 text-[10px]"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
