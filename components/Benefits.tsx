"use client";

import { useI18n } from "@/translations";

export default function Benefits() {
  const { t } = useI18n();

  return (
    <section className="py-24 bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[#1DB954] font-semibold tracking-widest uppercase text-xs mb-3">Why Us</p>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">{t.benefits.title}</h2>
          <p className="text-[#B3B3B3] text-lg">{t.benefits.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.benefits.items.map((item, i) => (
            <div
              key={i}
              className="group relative bg-[#1e1e1e] hover:bg-[#242424] rounded-2xl p-8 border border-white/5 hover:border-[#1DB954]/30 transition-all duration-300 hover:-translate-y-2"
            >
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#1DB954]/5 rounded-2xl rounded-tl-none" />

              <div className="text-5xl mb-6">{item.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#1DB954] transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-[#B3B3B3] leading-relaxed">{item.description}</p>

              {/* Hover arrow */}
              <div className="mt-6 flex items-center gap-1 text-[#1DB954] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Learn more</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
