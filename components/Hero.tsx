"use client";

import Image from "next/image";
import { useI18n } from "@/translations";

function WaveformBars() {
  const heights = [35, 65, 50, 90, 70, 80, 45, 75, 60, 85, 40, 70, 55];
  return (
    <div className="flex items-end justify-center gap-1 h-10">
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

export default function Hero() {
  const { t } = useI18n();
  const [h1, h2] = t.hero.headline.split("\n");

  return (
    <section className="hero-bg min-h-screen flex items-center pt-20">
      <div className="max-w-4xl mx-auto px-6 py-20 w-full flex flex-col items-center text-center">

        {/* Big centered logo with glow */}
        <div className="relative mb-8 animate-float">
          <div className="absolute inset-0 bg-[#1DB954]/20 rounded-full blur-3xl scale-110" />
          <div className="relative w-52 h-52 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full overflow-hidden ring-4 ring-[#1DB954]/40 shadow-2xl shadow-[#1DB954]/20">
            <Image
              src="/logo.jpg"
              alt="Humanify.music"
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full ring-2 ring-[#1DB954]/20 scale-110 animate-pulse-glow" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-full px-4 py-1.5 mb-5">
          <div className="w-2 h-2 bg-[#1DB954] rounded-full" />
          <span className="text-sm font-medium text-[#1DB954]">{t.hero.badge}</span>
        </div>

        {/* Tagline */}
        <p className="text-[#1DB954] font-semibold tracking-widest uppercase text-xs mb-3">
          {t.hero.tagline}
        </p>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-5 text-white">
          {h1}
          <br />
          <span className="text-gradient">{h2}</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-[#B3B3B3] leading-relaxed mb-8 max-w-2xl">
          {t.hero.subheadline}
        </p>

        {/* Waveform */}
        <div className="w-48 mb-8 opacity-70">
          <WaveformBars />
        </div>

        {/* CTA */}
        <a
          href="#signup"
          className="inline-flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-10 py-4 rounded-full transition-all duration-300 hover:scale-105 text-base shadow-lg hover:shadow-[#1DB954]/40"
        >
          {t.hero.cta}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>

        {/* Stats */}
        <div className="flex items-center gap-8 mt-12 pt-10 border-t border-white/5 w-full justify-center">
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
    </section>
  );
}
