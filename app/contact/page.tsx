"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      {/* Minimal nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#1DB954]/40 group-hover:ring-[#1DB954] transition-all duration-300">
            <Image src="/logo.jpg" alt="Humanify" fill className="object-cover" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Humanify.music</span>
        </Link>
        <Link href="/" className="text-[#B3B3B3] hover:text-white text-sm transition-colors duration-150">
          ← Back
        </Link>
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-lg">
          <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 bg-[#1DB954] rounded-full" />
            <span className="text-sm font-medium text-[#1DB954]">Get in Touch</span>
          </div>

          <h1 className="text-4xl font-black text-white mb-3">Contact Us</h1>
          <p className="text-[#B3B3B3] mb-10">Questions, partnerships, or press inquiries — we'd love to hear from you.</p>

          {status === "success" ? (
            <div className="bg-[#1DB954]/15 border border-[#1DB954]/40 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">✉️</div>
              <p className="text-[#1DB954] font-bold text-xl mb-2">Message sent!</p>
              <p className="text-[#B3B3B3] text-sm">We'll get back to you soon.</p>
              <Link href="/" className="inline-block mt-6 text-[#1DB954] hover:underline text-sm">← Back to home</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full bg-[#1e1e1e] border border-white/10 focus:border-[#1DB954]/50 rounded-xl px-5 py-4 text-white placeholder-[#535353] outline-none transition-colors duration-200"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="w-full bg-[#1e1e1e] border border-white/10 focus:border-[#1DB954]/50 rounded-xl px-5 py-4 text-white placeholder-[#535353] outline-none transition-colors duration-200"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message"
                required
                rows={5}
                className="w-full bg-[#1e1e1e] border border-white/10 focus:border-[#1DB954]/50 rounded-xl px-5 py-4 text-white placeholder-[#535353] outline-none transition-colors duration-200 resize-none"
              />

              {status === "error" && (
                <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] text-base"
              >
                {status === "loading" ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
