"use client";

import { useEffect, useRef } from 'react';

type Region = { start: number; end: number; color: string };

type Props = {
  waveformData: number[];
  regions: Region[];
  duration: number;
  animationKey: number;
};

const regionColors: Record<string, string> = {
  clean:    'rgba(29,185,84,0.55)',
  caution:  'rgba(250,204,21,0.55)',
  warning:  'rgba(251,146,60,0.60)',
  critical: 'rgba(248,113,113,0.65)',
};

const regionGlow: Record<string, string> = {
  clean:    '#1DB954',
  caution:  '#facc15',
  warning:  '#fb923c',
  critical: '#f87171',
};

export default function WaveformCanvas({ waveformData, regions, duration, animationKey }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData.length) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    // Background
    ctx.clearRect(0, 0, W, H);

    // Draw colored region bands first (background layer)
    if (duration > 0) {
      regions.forEach(({ start, end, color }) => {
        if (color === 'clean') return;
        const x1 = (start / duration) * W;
        const x2 = (end / duration) * W;
        ctx.fillStyle = regionColors[color] ?? regionColors.warning;
        ctx.fillRect(x1, 0, x2 - x1, H);
      });
    }

    // Center line
    const mid = H / 2;

    // Draw waveform bars
    const n = waveformData.length;
    const barW = Math.max(1, W / n);

    for (let i = 0; i < n; i++) {
      const x = (i / n) * W;
      const amp = waveformData[i] * mid * 0.88;

      // Determine region color for this sample
      let barColor = regionGlow.clean;
      if (duration > 0) {
        const t = (i / n) * duration;
        for (const r of regions) {
          if (t >= r.start && t < r.end) {
            barColor = regionGlow[r.color] ?? regionGlow.clean;
            break;
          }
        }
      }

      ctx.fillStyle = barColor;
      ctx.globalAlpha = 0.85;
      // Upper half
      ctx.fillRect(x, mid - amp, barW - 0.3, amp);
      // Lower half (mirrored, slightly dimmer)
      ctx.globalAlpha = 0.45;
      ctx.fillRect(x, mid, barW - 0.3, amp);
    }
    ctx.globalAlpha = 1;

    // Center baseline
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(W, mid);
    ctx.stroke();
  }, [waveformData, regions, duration, animationKey]);

  const legendItems = [
    { color: regionGlow.clean,    label: 'Clean',         bg: regionColors.clean },
    { color: regionGlow.caution,  label: 'Minor Issue',   bg: regionColors.caution },
    { color: regionGlow.warning,  label: 'Moderate',      bg: regionColors.warning },
    { color: regionGlow.critical, label: 'Critical',      bg: regionColors.critical },
  ];

  return (
    <div className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.06]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-white font-semibold text-sm">Waveform Analysis</p>
          <p className="text-white/40 text-xs">Color-coded by detected issues</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {legendItems.map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: item.bg, border: `1px solid ${item.color}60` }} />
              <span className="text-white/50 text-[11px]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg"
        style={{ height: 120, background: 'rgba(0,0,0,0.25)' }}
      />
    </div>
  );
}
