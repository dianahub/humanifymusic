"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Signup {
  id: number;
  name: string | null;
  email: string;
  language: string;
  created_at: string;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

const FLAG: Record<string, string> = { en: "🇺🇸", es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪", ja: "🇯🇵", pt: "🇧🇷", it: "🇮🇹" };

function downloadCSV(signups: Signup[]) {
  const header = "ID,Name,Email,Language,Date\n";
  const rows = signups.map((s) =>
    `${s.id},"${s.name || ""}","${s.email}","${s.language}","${new Date(s.created_at).toLocaleString()}"`
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `humanify-signups-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"signups" | "contacts">("signups");

  // Signups state
  const [signups, setSignups] = useState<Signup[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactTotal, setContactTotal] = useState(0);
  const [contactSearch, setContactSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const [sigRes, conRes] = await Promise.all([
        fetch("/api/registrations", { headers: { "x-admin-key": key } }),
        fetch("/api/contacts", { headers: { "x-admin-key": key } }),
      ]);
      if (sigRes.status === 401) { setError("Invalid admin key."); return; }
      if (!sigRes.ok || !conRes.ok) throw new Error("Server error");
      const sigData = await sigRes.json();
      const conData = await conRes.json();
      setSignups(sigData.signups);
      setTotal(sigData.total);
      setContacts(conData.contacts);
      setContactTotal(conData.total);
      setAuthed(true);
    } catch {
      setError("Connection failed. Is the database configured?");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setLoading(true);
    try {
      const [sigRes, conRes] = await Promise.all([
        fetch("/api/registrations", { headers: { "x-admin-key": key } }),
        fetch("/api/contacts", { headers: { "x-admin-key": key } }),
      ]);
      const sigData = await sigRes.json();
      const conData = await conRes.json();
      setSignups(sigData.signups);
      setTotal(sigData.total);
      setContacts(conData.contacts);
      setContactTotal(conData.total);
    } finally {
      setLoading(false);
    }
  }

  const filteredSignups = signups.filter(
    (s) =>
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredContacts = contacts.filter(
    (c) =>
      c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.message.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const langCounts = signups.reduce<Record<string, number>>((acc, s) => {
    acc[s.language] = (acc[s.language] || 0) + 1;
    return acc;
  }, {});

  const today = signups.filter(
    (s) => new Date(s.created_at).toDateString() === new Date().toDateString()
  ).length;

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image src="/logo.jpg" alt="Humanify" fill className="object-cover" />
            </div>
            <span className="font-bold text-white text-lg">Humanify Admin</span>
          </div>

          <div className="bg-[#1e1e1e] rounded-2xl p-8 border border-white/10">
            <h1 className="text-xl font-bold text-white mb-1">Admin Access</h1>
            <p className="text-[#B3B3B3] text-sm mb-6">Enter your admin key to view signups.</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Admin key"
                required
                className="w-full bg-[#2a2a2a] border border-white/10 focus:border-[#1DB954]/50 rounded-xl px-4 py-3 text-white placeholder-[#535353] outline-none transition-colors"
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-60 text-black font-bold py-3 rounded-xl transition-all duration-200"
              >
                {loading ? "Checking..." : "Sign In"}
              </button>
            </form>
          </div>

          <p className="text-center mt-4">
            <Link href="/" className="text-[#535353] hover:text-[#1DB954] text-sm transition-colors">
              ← Back to site
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="bg-[#1e1e1e] border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-7 h-7 rounded-full overflow-hidden">
            <Image src="/logo.jpg" alt="Humanify" fill className="object-cover" />
          </div>
          <span className="font-bold text-white">Humanify Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-[#B3B3B3] hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          {tab === "signups" && (
            <button
              onClick={() => downloadCSV(signups)}
              className="flex items-center gap-2 text-sm bg-[#1DB954]/10 hover:bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          )}
          <Link href="/" className="text-[#535353] hover:text-white text-sm transition-colors">
            ← Site
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/5 px-6">
        <div className="flex gap-1 max-w-6xl mx-auto">
          {(["signups", "contacts"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "border-[#1DB954] text-white"
                  : "border-transparent text-[#535353] hover:text-[#B3B3B3]"
              }`}
            >
              {t === "signups" ? `Waitlist (${total})` : `Messages (${contactTotal})`}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {tab === "signups" ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Signups", value: total, color: "#1DB954" },
                { label: "Today", value: today, color: "#4ade80" },
                { label: "Languages", value: Object.keys(langCounts).length, color: "#facc15" },
                { label: "This Month", value: signups.filter(s => new Date(s.created_at).getMonth() === new Date().getMonth()).length, color: "#fb923c" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#1e1e1e] rounded-xl p-5 border border-white/5">
                  <p className="text-[#B3B3B3] text-xs mb-1">{stat.label}</p>
                  <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Language breakdown */}
            {Object.keys(langCounts).length > 0 && (
              <div className="bg-[#1e1e1e] rounded-xl p-5 border border-white/5 mb-6">
                <h3 className="text-sm font-semibold text-[#B3B3B3] mb-3">Signups by Language</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(langCounts).sort((a, b) => b[1] - a[1]).map(([lang, count]) => (
                    <div key={lang} className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5">
                      <span className="text-sm">{FLAG[lang] || "🌐"}</span>
                      <span className="text-white text-sm font-medium">{count}</span>
                      <span className="text-[#535353] text-xs">{lang.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full max-w-sm bg-[#1e1e1e] border border-white/10 focus:border-[#1DB954]/50 rounded-xl px-4 py-2.5 text-white placeholder-[#535353] outline-none text-sm transition-colors"
              />
            </div>

            {filteredSignups.length === 0 ? (
              <div className="text-center py-20 text-[#535353]">
                {search ? "No results match your search." : "No signups yet. Share the page!"}
              </div>
            ) : (
              <div className="bg-[#1e1e1e] rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["#", "Name", "Email", "Lang", "Signed Up"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-[#535353] uppercase tracking-wider px-5 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSignups.map((s, i) => (
                      <tr key={s.id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i === filteredSignups.length - 1 ? "border-b-0" : ""}`}>
                        <td className="px-5 py-3.5 text-[#535353] text-sm">{s.id}</td>
                        <td className="px-5 py-3.5 text-white text-sm">{s.name || <span className="text-[#535353]">—</span>}</td>
                        <td className="px-5 py-3.5 text-[#B3B3B3] text-sm font-mono">{s.email}</td>
                        <td className="px-5 py-3.5 text-sm">
                          <span className="flex items-center gap-1.5">
                            <span>{FLAG[s.language] || "🌐"}</span>
                            <span className="text-[#535353]">{s.language.toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#B3B3B3] text-xs">
                          {new Date(s.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-5 py-3 border-t border-white/5 text-xs text-[#535353]">
                  Showing {filteredSignups.length} of {total} signups
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total Messages", value: contactTotal, color: "#1DB954" },
                { label: "Today", value: contacts.filter(c => new Date(c.created_at).toDateString() === new Date().toDateString()).length, color: "#4ade80" },
                { label: "This Month", value: contacts.filter(c => new Date(c.created_at).getMonth() === new Date().getMonth()).length, color: "#facc15" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#1e1e1e] rounded-xl p-5 border border-white/5">
                  <p className="text-[#B3B3B3] text-xs mb-1">{stat.label}</p>
                  <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Search messages..."
                className="w-full max-w-sm bg-[#1e1e1e] border border-white/10 focus:border-[#1DB954]/50 rounded-xl px-4 py-2.5 text-white placeholder-[#535353] outline-none text-sm transition-colors"
              />
            </div>

            {filteredContacts.length === 0 ? (
              <div className="text-center py-20 text-[#535353]">
                {contactSearch ? "No results match your search." : "No messages yet."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredContacts.map((c) => (
                  <div key={c.id} className="bg-[#1e1e1e] rounded-xl border border-white/5 overflow-hidden">
                    <button
                      onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#1DB954]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#1DB954] text-sm font-bold">{c.name[0].toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate">{c.name}</p>
                          <p className="text-[#535353] text-xs font-mono">{c.email}</p>
                        </div>
                        <p className="text-[#B3B3B3] text-sm truncate hidden md:block max-w-xs">{c.message}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <span className="text-[#535353] text-xs">{new Date(c.created_at).toLocaleDateString()}</span>
                        <svg
                          className={`w-4 h-4 text-[#535353] transition-transform ${expanded === c.id ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    {expanded === c.id && (
                      <div className="px-5 pb-5 border-t border-white/5 pt-4">
                        <p className="text-[#B3B3B3] text-sm leading-relaxed whitespace-pre-wrap">{c.message}</p>
                        <div className="flex items-center gap-4 mt-4">
                          <a
                            href={`mailto:${c.email}`}
                            className="inline-flex items-center gap-2 text-sm bg-[#1DB954]/10 hover:bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Reply →
                          </a>
                          <span className="text-[#535353] text-xs">{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
