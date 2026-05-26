# Humanify.music

**Real Music. Real Artists. Real Transparency.**

A music streaming platform dedicated exclusively to human-made music. Every track is independently rated on our A–F purity scale — measuring pitch correction, time quantization, and studio processing. Zero AI-generated content. Ever.

![Humanify.music](public/logo.jpg)

---

## Features

- **Landing Page** — Spotify dark theme with animated hero, A–F grading system, benefits section, and email waitlist
- **7-Language Support** — English, Spanish, French, German, Japanese, Portuguese, Italian (instant switching)
- **Waitlist Database** — PostgreSQL-backed email signup with duplicate detection
- **Admin Dashboard** — Password-protected dashboard at `/admin` with stats, search, and CSV export
- **Fully Responsive** — Mobile-first design that looks great on all screen sizes

## Tech Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (`postgres` package) |
| i18n | Custom React Context |
| Deploy | Railway or Vercel |

## The A–F Grading System

| Grade | Label | What it means |
|-------|-------|----------------|
| **A** | Pure | Zero pitch correction, no time quantization |
| **B** | Minimal | Light EQ and natural compression only |
| **C** | Light | Subtle corrections used sparingly |
| **D** | Moderate | Noticeable pitch/timing correction |
| **F** | Heavy | Extensive Auto-Tune and quantization |

---

## Quick Deploy

### Railway (Recommended)

1. Fork this repo
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Add a **PostgreSQL** database service — Railway auto-sets `DATABASE_URL`
4. Add environment variable: `ADMIN_KEY=your-secret-key`
5. Deploy → done!

### Vercel

1. Import this repo at [vercel.com](https://vercel.com)
2. Add **Neon** database via Vercel Marketplace (free tier) — auto-sets `DATABASE_URL`
3. Add `ADMIN_KEY` in Settings → Environment Variables
4. Deploy → done!

---

## Environment Variables

```env
# Required — PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:5432/database

# Optional — Admin dashboard password (default: humanify-admin-2026)
ADMIN_KEY=your-secure-key
```

## Admin Dashboard

Visit `/admin` on your deployed site. Enter the `ADMIN_KEY` to access:
- Total signup count, today's signups, language breakdown
- Searchable table of all signups (name, email, language, date)
- CSV export button

---

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with a real DATABASE_URL

# Run development server
npm run dev
# → http://localhost:3000
```

---

## Project Structure

```
├── app/
│   ├── admin/page.tsx          # Admin dashboard
│   ├── api/register/           # POST — email signup
│   ├── api/registrations/      # GET — list all signups (admin)
│   ├── globals.css             # Tailwind theme + animations
│   └── page.tsx                # Landing page
├── components/                 # All UI components
├── translations/               # i18n context + 7 locale files
├── lib/db.ts                   # PostgreSQL queries
└── HUMANIFY.md                 # Full technical documentation
```

---

## License

© 2026 Humanify.music. Supporting human artists since 2026.
