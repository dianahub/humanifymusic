"use client";

import Image from "next/image";
import { useI18n } from "@/translations";
import LanguageSelector from "./LanguageSelector";

export default function Navbar() {
  const { t } = useI18n();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-[#121212]/90 backdrop-blur-md border-b border-white/5">
      <a href="/" className="flex items-center gap-3 group">
        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#1DB954]/40 group-hover:ring-[#1DB954] transition-all duration-300">
          <Image src="/logo.jpg" alt="Humanify" fill className="object-cover" />
        </div>
        <span className="font-bold text-white text-lg tracking-tight">{t.nav.brand}</span>
      </a>

      <div className="flex items-center gap-3">
        <LanguageSelector />
        <a
          href="/analyze"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium text-sm transition-all duration-200 border border-white/10"
        >
          <span className="text-xs">🎵</span>
          Analyze
        </a>
        <a
          href="#signup"
          className="hidden sm:inline-flex items-center px-4 py-2 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold text-sm transition-all duration-200 hover:scale-105"
        >
          {t.nav.earlyAccess}
        </a>
      </div>
    </nav>
  );
}
