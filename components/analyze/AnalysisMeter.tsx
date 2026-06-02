"use client";

import { useEffect, useRef } from 'react';

type Props = {
  label: string;
  sublabel: string;
  score: number;  // 0-100 (higher = more detected / worse)
  icon: string;
  animationKey: number;
};

const scoreColor = (s: number) =>
  s < 25 ? '#1DB954' : s < 50 ? '#4ade80' : s < 70 ? '#facc15' : s < 85 ? '#fb923c' : '#f87171';

export default function AnalysisMeter({ label, sublabel, score, icon, animationKey }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const color = scoreColor(score);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    el.style.width = '0%';
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'width 1.1s cubic-bezier(0.4,0,0.2,1)';
      el.style.width = `${score}%`;
    });
    return () => cancelAnimationFrame(raf);
  }, [score, animationKey]);

  const severity = score < 25 ? 'CLEAN' : score < 50 ? 'LOW' : score < 70 ? 'MODERATE' : score < 85 ? 'HIGH' : 'CRITICAL';

  return (
    <div className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <div>
            <p className="text-white font-semibold text-sm leading-none">{label}</p>
            <p className="text-white/40 text-xs mt-0.5">{sublabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full"
            style={{ color, background: `${color}18` }}
          >
            {severity}
          </span>
          <span className="text-white font-bold text-base tabular-nums" style={{ color }}>
            {score}%
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-2.5 rounded-full bg-white/[0.06] overflow-hidden mt-3">
        {/* Tick marks at 25, 50, 75 */}
        {[25, 50, 75].map(t => (
          <div key={t} className="absolute top-0 bottom-0 w-px bg-white/10" style={{ left: `${t}%` }} />
        ))}
        <div ref={barRef} className="absolute top-0 left-0 h-full rounded-full" style={{ background: color, width: 0 }} />
      </div>

      <div className="flex justify-between text-[10px] text-white/25 mt-1">
        <span>Natural</span>
        <span>Detected</span>
      </div>
    </div>
  );
}
