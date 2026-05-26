"use client";

import { useState } from "react";
import { useI18n } from "@/translations";

export default function SignupSection() {
  const { t, lang } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || null, email, language: lang }),
      });
      const data = await res.json();
      if (res.status === 409) { setStatus("duplicate"); return; }
      if (!res.ok) throw new Error(data.error);
      setStatus("success");
      setName("");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="signup" className="py-24 relative overflow-hidden" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 110%, rgba(29,185,84,0.15) 0%, transparent 65%), #0e0e0e" }}>
      {/* Decorative rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full border border-[#1DB954]/5" />
        <div className="absolute w-[400px] h-[400px] rounded-full border border-[#1DB954]/8" />
        <div className="absolute w-[200px] h-[200px] rounded-full border border-[#1DB954]/10" />
      </div>

      <div className="relative max-w-2xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 bg-[#1DB954] rounded-full" />
          <span className="text-sm font-medium text-[#1DB954]">Early Access</span>
        </div>

        <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">{t.signup.title}</h2>
        <p className="text-[#B3B3B3] text-lg leading-relaxed mb-10">{t.signup.subtitle}</p>

        {status === "success" ? (
          <div className="bg-[#1DB954]/15 border border-[#1DB954]/40 rounded-2xl p-8">
            <div className="text-5xl mb-4">🎵</div>
            <p className="text-[#1DB954] font-bold text-xl">{t.signup.success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.signup.namePlaceholder}
              className="w-full bg-[#1e1e1e] border border-white/10 focus:border-[#1DB954]/50 rounded-xl px-5 py-4 text-white placeholder-[#535353] outline-none transition-colors duration-200"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.signup.emailPlaceholder}
              required
              className="w-full bg-[#1e1e1e] border border-white/10 focus:border-[#1DB954]/50 rounded-xl px-5 py-4 text-white placeholder-[#535353] outline-none transition-colors duration-200"
            />

            {(status === "error" || status === "duplicate") && (
              <p className="text-red-400 text-sm">
                {status === "duplicate" ? t.signup.alreadyRegistered : t.signup.error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading" || !email}
              className="w-full bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] text-base"
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Joining...
                </span>
              ) : t.signup.button}
            </button>

            <p className="text-[#535353] text-xs pt-1">{t.signup.privacy}</p>
          </form>
        )}
      </div>
    </section>
  );
}
