"use client";

import { useState } from 'react';

type Timestamp = {
  timeStart: number;
  timeEnd: number;
  severity: 'low' | 'medium' | 'high';
  detail: string;
};

type Props = {
  pitchTimestamps: Timestamp[];
  timeTimestamps: Timestamp[];
  aiTimestamps: Timestamp[];
};

const severityStyle: Record<string, { color: string; bg: string; dot: string }> = {
  low:    { color: '#facc15', bg: 'rgba(250,204,21,0.10)', dot: 'bg-yellow-400' },
  medium: { color: '#fb923c', bg: 'rgba(251,146,60,0.10)', dot: 'bg-orange-400' },
  high:   { color: '#f87171', bg: 'rgba(248,113,113,0.10)', dot: 'bg-red-400' },
};

const categoryStyle: Record<string, { color: string; label: string; icon: string }> = {
  pitch: { color: '#a78bfa', label: 'Pitch',  icon: '🎵' },
  time:  { color: '#38bdf8', label: 'Timing', icon: '⏱' },
  ai:    { color: '#f472b6', label: 'AI',     icon: '🤖' },
};

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type Entry = Timestamp & { category: 'pitch' | 'time' | 'ai' };

type TabKey = 'all' | 'pitch' | 'time' | 'ai';

export default function TimestampPanel({ pitchTimestamps, timeTimestamps, aiTimestamps }: Props) {
  const [tab, setTab] = useState<TabKey>('all');

  const all: Entry[] = [
    ...pitchTimestamps.map(t => ({ ...t, category: 'pitch' as const })),
    ...timeTimestamps.map(t => ({ ...t, category: 'time' as const })),
    ...aiTimestamps.map(t => ({ ...t, category: 'ai' as const })),
  ].sort((a, b) => a.timeStart - b.timeStart);

  const filtered = tab === 'all' ? all : all.filter(e => e.category === tab);

  const tabCounts: Record<TabKey, number> = {
    all:   all.length,
    pitch: pitchTimestamps.length,
    time:  timeTimestamps.length,
    ai:    aiTimestamps.length,
  };

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'all',   label: 'All',    icon: '📋' },
    { key: 'pitch', label: 'Pitch',  icon: '🎵' },
    { key: 'time',  label: 'Timing', icon: '⏱' },
    { key: 'ai',    label: 'AI',     icon: '🤖' },
  ];

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div>
          <p className="text-white font-semibold text-sm">Detection Breakdown</p>
          <p className="text-white/40 text-xs">{all.length} flagged segment{all.length !== 1 ? 's' : ''}</p>
        </div>
        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                tab === t.key
                  ? 'bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30'
                  : 'text-white/40 hover:text-white/70 border border-transparent'
              }`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
              <span className="tabular-nums text-[10px] opacity-70">({tabCounts[t.key]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <span className="text-2xl">✅</span>
          <p className="text-white/50 text-sm">No issues detected in this category</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04] max-h-72 overflow-y-auto">
          {filtered.map((entry, i) => {
            const sev = severityStyle[entry.severity];
            const cat = categoryStyle[entry.category];
            return (
              <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                {/* Timestamp */}
                <div className="flex-none pt-0.5">
                  <span className="font-mono text-xs font-semibold tabular-nums" style={{ color: cat.color }}>
                    {fmt(entry.timeStart)}–{fmt(entry.timeEnd)}
                  </span>
                </div>

                {/* Category badge */}
                <div
                  className="flex-none px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-0.5"
                  style={{ color: cat.color, background: `${cat.color}15` }}
                >
                  {cat.icon} {cat.label}
                </div>

                {/* Detail */}
                <p className="flex-1 text-white/60 text-xs leading-relaxed">{entry.detail}</p>

                {/* Severity dot */}
                <div className="flex-none flex items-center gap-1 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: sev.color }}>
                    {entry.severity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
