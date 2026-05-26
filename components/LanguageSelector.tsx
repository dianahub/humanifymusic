"use client";

import { useRef, useState, useEffect } from "react";
import { useI18n, languages, type Language } from "@/translations";

export default function LanguageSelector() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = languages.find((l) => l.code === lang)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 text-sm font-medium text-white"
        aria-label="Select language"
      >
        <span className="text-lg leading-none">{current.flag}</span>
        <span className="hidden sm:block">{current.name}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#1e1e1e] border border-white/10 shadow-2xl overflow-hidden z-50">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code as Language); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${
                l.code === lang
                  ? "bg-[#1DB954]/20 text-[#1DB954] font-medium"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-lg leading-none">{l.flag}</span>
              <span>{l.name}</span>
              {l.code === lang && (
                <svg className="ml-auto w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
