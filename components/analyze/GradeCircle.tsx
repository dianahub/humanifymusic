"use client";

const gradeConfig: Record<string, { color: string; glow: string; label: string }> = {
  A: { color: '#1DB954', glow: 'rgba(29,185,84,0.35)', label: 'Pristine' },
  B: { color: '#4ade80', glow: 'rgba(74,222,128,0.30)', label: 'Clean' },
  C: { color: '#facc15', glow: 'rgba(250,204,21,0.30)', label: 'Processed' },
  D: { color: '#fb923c', glow: 'rgba(251,146,60,0.30)', label: 'Manipulated' },
  F: { color: '#f87171', glow: 'rgba(248,113,113,0.35)', label: 'Inauthentic' },
};

type Props = { grade: string; purity: number; animationKey: number };

export default function GradeCircle({ grade, purity, animationKey }: Props) {
  const cfg = gradeConfig[grade] ?? gradeConfig['C'];
  const radius = 80;
  const stroke = 10;
  const size = (radius + stroke) * 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (purity / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-60"
          style={{ background: cfg.glow }}
        />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative z-10">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={stroke}
          />
          {/* Progress arc */}
          <circle
            key={animationKey}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={cfg.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
          {/* Grade letter */}
          <text
            x={size / 2}
            y={size / 2 - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={cfg.color}
            fontSize="52"
            fontWeight="900"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {grade}
          </text>
          {/* Purity % */}
          <text
            x={size / 2}
            y={size / 2 + 36}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.5)"
            fontSize="14"
            fontWeight="500"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {purity}% purity
          </text>
        </svg>
      </div>
      <div
        className="px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide"
        style={{ background: `${cfg.glow}`, color: cfg.color, border: `1px solid ${cfg.color}40` }}
      >
        {cfg.label}
      </div>
    </div>
  );
}
