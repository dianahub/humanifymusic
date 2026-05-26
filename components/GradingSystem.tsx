"use client";

import { useI18n } from "@/translations";

const gradeStyles: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  A: { color: "#1DB954", bg: "rgba(29,185,84,0.1)", border: "rgba(29,185,84,0.4)", glow: "rgba(29,185,84,0.2)" },
  B: { color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.4)", glow: "rgba(74,222,128,0.15)" },
  C: { color: "#facc15", bg: "rgba(250,204,21,0.1)", border: "rgba(250,204,21,0.4)", glow: "rgba(250,204,21,0.15)" },
  D: { color: "#fb923c", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.4)", glow: "rgba(251,146,60,0.15)" },
  F: { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.4)", glow: "rgba(248,113,113,0.15)" },
};

const purityPercent: Record<string, number> = { A: 100, B: 80, C: 60, D: 35, F: 10 };

export default function GradingSystem() {
  const { t } = useI18n();

  return (
    <section id="grades" className="py-24 bg-[#0e0e0e]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[#1DB954] font-semibold tracking-widest uppercase text-xs mb-3">Transparency</p>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">{t.grading.title}</h2>
          <p className="text-[#B3B3B3] max-w-2xl mx-auto text-lg leading-relaxed">{t.grading.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {t.grading.grades.map((grade) => {
            const style = gradeStyles[grade.letter];
            const pct = purityPercent[grade.letter];
            return (
              <div
                key={grade.letter}
                className="group relative rounded-2xl p-5 transition-all duration-300 hover:-translate-y-2 cursor-default"
                style={{ background: style.bg, border: `1px solid ${style.border}` }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg -z-10"
                  style={{ background: style.glow }}
                />

                {/* Grade circle */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4 font-black text-2xl"
                  style={{ background: style.bg, border: `2px solid ${style.color}`, color: style.color }}
                >
                  {grade.letter}
                </div>

                <h3 className="font-bold text-white text-lg mb-2">{grade.label}</h3>
                <p className="text-[#B3B3B3] text-sm leading-relaxed mb-4">{grade.description}</p>

                {/* Purity bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#B3B3B3]">Purity</span>
                    <span style={{ color: style.color }} className="font-semibold">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: style.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
