"use client";

import Image from "next/image";
import { useI18n } from "@/translations";

function WaveformBars() {
  const heights = [35, 65, 50, 90, 70, 80, 45, 75, 60, 85, 40, 70, 55];
  return (
    <div className="flex items-end gap-1 h-10">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-1 bg-[#1DB954] rounded-full wave-bar"
          style={{ height: `${h}%`, animationDelay: `${i * 0.09}s` }}
        />
      ))}
    </div>
  );
}

function SampleTrackCard() {
  return (
    <div className="animate-float relative bg-[#1e1e1e] rounded-2xl p-6 shadow-2xl border border-white/10 max-w-xs w-full">
      {/* Grade badge */}
      <div className="animate-pulse-glow absolute -top-5 -right-5 w-16 h-16 bg-[#1DB954] rounded-full flex items-center justify-center shadow-lg border-4 border-[#121212] z-10">
        <span className="text-2xl font-black text-black">A</span>
      </div>

      {/* Track info */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1DB954] to-emerald-700 flex items-center justify-center flex-shrink-0 text-2xl">
          🎸
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Live Without Words</p>
          <p className="text-[#B3B3B3] text-xs mt-0.5">The Real Session</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-1.5 h-1.5 bg-[#1DB954] rounded-full" />
            <span className="text-[#1DB954] text-xs font-medium">100% Pure</span>
          </div>
        </div>
      </div>

      <WaveformBars />

      {/* Tags */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {["No Pitch Fix", "No Quantize", "Live Take"].map((tag) => (
          <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[#2a2a2a] text-[#B3B3B3] border border-white/5">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const { t } = useI18n();
  const [h1, h2] = t.hero.headline.split("\n");

  return (
    <section className="hero-bg min-h-screen flex items-center pt-20">
      <div className="max-w-7xl mx-auto px-6 py-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 bg-[#1DB954] rounded-full" />
            <span className="text-sm font-medium text-[#1DB954]">{t.hero.badge}</span>
          </div>

          <p className="text-[#1DB954] font-semibold tracking-widest uppercase text-xs mb-3">
            {t.hero.tagline}
          </p>

          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-6 text-white">
            {h1}
            <br />
            <span className="text-gradient">{h2}</span>
          </h1>

          <p className="text-lg text-[#B3B3B3] leading-relaxed mb-10 max-w-lg">
            {t.hero.subheadline}
          </p>

          <a
            href="#signup"
            className="inline-flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 text-base shadow-lg hover:shadow-[#1DB954]/30"
          >
            {t.hero.cta}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>

          {/* Stats */}
          <div className="flex items-center gap-8 mt-12">
            {[
              { value: "10K+", label: t.hero.stats.artists },
              { value: "500K+", label: t.hero.stats.tracks },
              { value: "100%", label: t.hero.stats.human },
            ].map((s, i) => (
              <div key={i} className={`${i > 0 ? "pl-8 border-l border-white/10" : ""}`}>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-[#B3B3B3] text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex justify-center lg:justify-end items-center relative">
          <div className="absolute inset-0 bg-[#1DB954]/5 rounded-full blur-3xl scale-75" />
          <SampleTrackCard />
        </div>
      </div>
    </section>
  );
}
