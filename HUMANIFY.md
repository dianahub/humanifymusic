# Humanify.music — Project Documentation

## Overview

Humanify.music is a music streaming platform dedicated exclusively to human-made music. Every track is rated on a proprietary A–F transparency scale measuring pitch correction, time quantization, and studio processing.

**Mission:** Support human artists and give listeners complete transparency about how music was made.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (via `postgres` npm package) |
| i18n | Custom React Context (7 languages) |
| Deployment | Railway or Vercel |

---

## Project Structure

```
humanify/
├── app/
│   ├── admin/page.tsx          # Admin dashboard (password protected)
│   ├── api/
│   │   ├── register/route.ts   # POST — save email signup
│   │   └── registrations/route.ts  # GET — list all signups (admin)
│   ├── globals.css             # Tailwind v4 + Spotify theme + animations
│   ├── layout.tsx              # Root layout with metadata
│   └── page.tsx                # Landing page (all sections)
├── components/
│   ├── Providers.tsx           # Client-side context wrapper
│   ├── Navbar.tsx              # Top navigation + language selector
│   ├── LanguageSelector.tsx    # 7-language dropdown with flags
│   ├── Hero.tsx                # Hero section with animated track card
│   ├── GradingSystem.tsx       # A–F grade cards with purity bars
│   ├── Benefits.tsx            # 3-column benefits section
│   ├── SignupSection.tsx       # Email waitlist form
│   └── Footer.tsx              # Footer with social links
├── lib/
│   └── db.ts                   # PostgreSQL connection + query functions
├── translations/
│   ├── index.tsx               # i18n context + Language type
│   └── locales/
│       ├── en.ts               # English (type source of truth)
│       ├── es.ts               # Spanish
│       ├── fr.ts               # French
│       ├── de.ts               # German
│       ├── ja.ts               # Japanese
│       ├── pt.ts               # Portuguese
│       └── it.ts               # Italian
└── public/
    └── logo.jpg                # Humanify logo
```

---

## Features

### Landing Page Sections
1. **Navbar** — Logo, language selector (7 languages), CTA button
2. **Hero** — Bold headline, animated sample track card with A-grade badge and waveform
3. **Grading System** — A through F grade cards with colored borders, purity % bars
4. **Benefits** — 3-column grid: Support Real Artists, Transparency, Discover Pure Sound
5. **Signup** — Email waitlist form (name optional), stores to database
6. **Footer** — Social links (Twitter/X, Instagram, YouTube, TikTok), footer links

### Languages
English 🇺🇸 | Spanish 🇪🇸 | French 🇫🇷 | German 🇩🇪 | Japanese 🇯🇵 | Portuguese 🇧🇷 | Italian 🇮🇹

Switching language instantly updates all text via React Context.

### Admin Dashboard (`/admin`)
- Password-protected (requires admin key)
- Stats: total signups, today's count, language breakdown, monthly count
- Searchable table with: ID, name, email, language, signup date
- Export all signups to CSV
- Refresh button to see new signups

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

The table is auto-created on first API request.

---

## Environment Variables

```env
# Required — PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:5432/database

# Optional — Admin dashboard password (default: humanify-admin-2026)
ADMIN_KEY=your-secure-admin-key
```

---

## Deployment

### Option A: Railway (Recommended)

1. Push code to GitHub: `github.com/dianahub/humanifymusic`
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select the `humanifymusic` repo
4. Add a PostgreSQL database: **New** → **Database** → **PostgreSQL**
5. Railway auto-sets `DATABASE_URL` from the database
6. Add `ADMIN_KEY` in Railway → Variables
7. Deploy → get your public URL

### Option B: Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project from GitHub
3. Add a database via Vercel Marketplace → Neon (free tier)
4. Neon auto-sets `DATABASE_URL`
5. Add `ADMIN_KEY` in Vercel → Settings → Environment Variables
6. Deploy

---

## Local Development (if needed)

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

# Run dev server
npm run dev
# → http://localhost:3000
# → http://localhost:3000/admin
```

---

## The A–F Grading System

| Grade | Label | Purity | Criteria |
|-------|-------|--------|----------|
| A | Pure | 100% | Zero pitch correction, no time quantization, minimal processing |
| B | Minimal | 80% | Light EQ and natural compression only |
| C | Light | 60% | Subtle pitch/timing corrections used sparingly |
| D | Moderate | 35% | Noticeable pitch correction and time alignment |
| F | Heavy | 10% | Extensive Auto-Tune, heavy quantization, AI-like processing |

---

## Color Scheme (Spotify-Inspired)

| Token | Value | Usage |
|-------|-------|-------|
| `spotify-black` | `#121212` | Base background |
| `spotify-dark` | `#181818` | Elevated sections |
| `spotify-card` | `#1e1e1e` | Card backgrounds |
| `spotify-green` | `#1DB954` | Primary accent / CTA |
| `spotify-green-light` | `#1ed760` | Hover states |
| `spotify-gray` | `#B3B3B3` | Secondary text |
| `grade-a` | `#1DB954` | Grade A (green) |
| `grade-b` | `#4ade80` | Grade B (light green) |
| `grade-c` | `#facc15` | Grade C (yellow) |
| `grade-d` | `#fb923c` | Grade D (orange) |
| `grade-f` | `#f87171` | Grade F (red) |

---

## Adding a New Language

1. Create `translations/locales/xx.ts` (copy structure from `en.ts`)
2. Add it to `translations/index.tsx`:
   - Import the locale
   - Add to `allTranslations` object
   - Add to `languages` array with flag and name

---

## Roadmap

- [ ] Stripe integration for premium subscriptions (multi-currency)
- [ ] Web Audio API track analysis tool
- [ ] Artist onboarding portal
- [ ] Track submission and grading workflow
- [ ] User profiles and listening history
- [ ] Playlist creation with purity filtering
- [ ] Mobile app (React Native)
