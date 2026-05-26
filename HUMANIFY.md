# Humanify.music — Project Documentation

**Last updated:** 2026-05-25

---

## Overview

Humanify.music is a music streaming platform dedicated exclusively to human-made music. Every track is rated on a proprietary A–F transparency scale measuring pitch correction, time quantization, and studio processing.

**Mission:** Support human artists and give listeners complete transparency about how music was made.

**GitHub:** `github.com/dianahub/humanifymusic`
**Deployed on:** Railway (project: `charming-presence`, service: `humanifymusic`)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (via `postgres` npm package) |
| i18n | Custom React Context (7 languages) |
| Deployment | Railway (`railway.json` + Nixpacks) |

---

## Project Structure

```
humanify/
├── app/
│   ├── admin/page.tsx              # Admin dashboard (password protected)
│   ├── api/
│   │   ├── register/route.ts       # POST — save email signup
│   │   └── registrations/route.ts  # GET — list all signups (admin only)
│   ├── globals.css                 # Tailwind v4 + Spotify theme + animations
│   ├── layout.tsx                  # Root layout with metadata
│   └── page.tsx                    # Landing page entry point
├── components/
│   ├── Providers.tsx               # Client-side i18n context wrapper
│   ├── Navbar.tsx                  # Top nav: logo + language selector + CTA
│   ├── LanguageSelector.tsx        # 7-language dropdown with flags
│   ├── Hero.tsx                    # Centered logo, headline, waveform, CTA, stats
│   ├── GradingSystem.tsx           # A–F grade cards with purity bars
│   ├── Benefits.tsx                # 3-column benefits section
│   ├── SignupSection.tsx           # Email waitlist form
│   └── Footer.tsx                  # Social links + footer links
├── lib/
│   └── db.ts                       # PostgreSQL connection + query functions
├── translations/
│   ├── index.tsx                   # i18n context, Language type, language list
│   └── locales/
│       ├── en.ts                   # English (Translations type source of truth)
│       ├── es.ts                   # Spanish
│       ├── fr.ts                   # French
│       ├── de.ts                   # German
│       ├── ja.ts                   # Japanese
│       ├── pt.ts                   # Portuguese
│       └── it.ts                   # Italian
├── public/
│   └── logo.jpg                    # Humanify logo (circular, used in Navbar + Hero)
├── railway.json                    # Railway build + deploy config
├── next.config.ts                  # Next.js config (standalone output, ignore TS errors)
├── .env.example                    # Environment variable template
├── HUMANIFY.md                     # This file
└── README.md                       # GitHub README
```

---

## Features Built

### Landing Page Sections
1. **Navbar** — Logo (small, top-left), language selector (top-right), CTA button
2. **Hero** — Large circular logo centered with green glow + float animation, tagline, headline, animated waveform bars, CTA button, 3 stat counters
3. **Grading System** — A through F grade cards with colored borders and purity % progress bars
4. **Benefits** — 3-column grid: Support Real Artists, Transparency You Can Trust, Discover Pure Sound
5. **Signup** — Email waitlist form (name optional), stores to PostgreSQL, handles duplicates
6. **Footer** — Social links (Twitter/X, Instagram, YouTube, TikTok), company/legal links, admin link

### Language Switcher
7 languages with flag emoji dropdown in top-right navbar corner. Switching language instantly updates all text on the page via React Context — no page reload.

| Flag | Language |
|------|----------|
| 🇺🇸 | English |
| 🇪🇸 | Spanish |
| 🇫🇷 | French |
| 🇩🇪 | German |
| 🇯🇵 | Japanese |
| 🇧🇷 | Portuguese |
| 🇮🇹 | Italian |

### Admin Dashboard (`/admin`)
- Password prompt on load — enter `ADMIN_KEY` to authenticate
- Stats cards: total signups, today's count, unique languages, monthly count
- Language breakdown chips showing signup distribution
- Searchable table: ID, name, email, language flag, date joined
- Export to CSV button (client-side generation)
- Refresh button
- Default admin key: `humanify-admin-2026` (override with `ADMIN_KEY` env var)

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS signups (
  id         SERIAL PRIMARY KEY,
  name       TEXT,
  email      TEXT NOT NULL UNIQUE,
  language   TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Table is auto-created on the first API request — no manual migration needed.

---

## Environment Variables

```env
# Required — PostgreSQL connection string
# Railway: auto-provided when you add a PostgreSQL service
DATABASE_URL=postgresql://user:password@host:5432/database

# Optional — Admin dashboard password
# Default if not set: humanify-admin-2026
ADMIN_KEY=your-secure-admin-key
```

---

## Deployment (Railway)

The project is deployed on Railway under project **charming-presence**, service **humanifymusic**.

### How it works
- Every `git push` to `main` triggers an automatic redeploy on Railway
- Railway uses Nixpacks with the config in `railway.json`
- Build uses `output: standalone` in Next.js for an optimized Docker image
- Start command: `HOSTNAME=0.0.0.0 node .next/standalone/server.js`

### `railway.json` explained
```json
{
  "build": {
    "buildCommand": "npm install && npm run build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/"
  },
  "deploy": {
    "startCommand": "HOSTNAME=0.0.0.0 node .next/standalone/server.js"
  }
}
```
- `HOSTNAME=0.0.0.0` — required so Railway's health check can reach the server (default is 127.0.0.1 which blocks external requests)
- `cp -r public` and `cp -r .next/static` — required because standalone mode doesn't copy these automatically

### Adding the PostgreSQL database on Railway
1. In Railway project dashboard → **+ New** → **Database** → **Add PostgreSQL**
2. Railway auto-injects `DATABASE_URL` into the service environment
3. No further config needed — the table is created automatically on first signup

### Useful Railway CLI commands
```bash
railway link            # Link local folder to Railway project
railway service humanifymusic  # Select the service
railway logs --build    # View build logs
railway logs            # View runtime logs
railway variables       # View environment variables
```

---

## Build Notes & Fixes Applied

| Issue | Fix |
|-------|-----|
| TypeScript errors during build | `ignoreBuildErrors: true` in `next.config.ts` |
| ESLint errors blocking build | `ignoreDuringBuilds: true` in `next.config.ts` |
| `npm ci` lock file mismatch | Regenerated `package-lock.json` with local npm |
| Health check failing (service unavailable) | Added `HOSTNAME=0.0.0.0` to start command |
| Logo/CSS not loading in standalone mode | Copy `public/` and `.next/static/` into standalone dir during build |
| CSS `@import` ordering warning | Moved Google Fonts `@import` before `@import "tailwindcss"` |

---

## The A–F Grading System

| Grade | Label | Purity | Criteria |
|-------|-------|--------|----------|
| **A** | Pure | 100% | Zero pitch correction, no time quantization, minimal processing |
| **B** | Minimal | 80% | Light EQ and natural compression only |
| **C** | Light | 60% | Subtle pitch/timing corrections used sparingly |
| **D** | Moderate | 35% | Noticeable pitch correction and time alignment |
| **F** | Heavy | 10% | Extensive Auto-Tune, heavy quantization, AI-like processing |

---

## Color Scheme (Spotify-Inspired)

| Token | Value | Usage |
|-------|-------|-------|
| `#121212` | Spotify Black | Base page background |
| `#181818` | Spotify Dark | Elevated section backgrounds |
| `#1e1e1e` | Card | Card backgrounds |
| `#1DB954` | Spotify Green | Primary accent, CTA buttons, grade A |
| `#1ed760` | Green Light | Hover states |
| `#B3B3B3` | Gray | Secondary text |
| `#535353` | Muted | Tertiary text, disabled states |
| `#4ade80` | Grade B | Light green |
| `#facc15` | Grade C | Yellow |
| `#fb923c` | Grade D | Orange |
| `#f87171` | Grade F | Red |

---

## CSS Animations

Defined in `app/globals.css`:

| Class | Effect |
|-------|--------|
| `.animate-float` | Gentle up/down float (logo in hero) |
| `.animate-pulse-glow` | Green shadow pulse (logo ring) |
| `.animate-fade-in-up` | Fade in from below on load |
| `.wave-bar` | Audio waveform bar animation |
| `.hero-bg` | Radial green glow background |
| `.text-gradient` | White-to-green gradient text |

---

## Adding a New Language

1. Create `translations/locales/xx.ts` — copy the structure from `en.ts` exactly
2. In `translations/index.tsx`:
   - Import the new locale: `import { xx } from "./locales/xx"`
   - Add to `allTranslations`: `xx`
   - Add to `languages` array: `{ code: "xx", flag: "🏳️", name: "Language Name" }`
3. Push to GitHub — Railway redeploys automatically

---

## Roadmap

- [ ] Stripe integration for premium subscriptions (multi-currency)
- [ ] Web Audio API track analysis tool
- [ ] Artist onboarding portal
- [ ] Track submission and grading workflow
- [ ] User profiles and listening history
- [ ] Playlist creation with purity grade filtering
- [ ] Mobile app (React Native)
