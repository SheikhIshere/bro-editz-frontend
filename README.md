# bro-editz-frontend

Modern video agency frontend — standalone, no Docker, no backend required. Built with Next.js 14, Tailwind CSS v4, Framer Motion.

> **Demo-ready dummy data included.** All YouTube links you provided are wired as portfolio / review / hero video. Runs fully without API.

## 🎬 Demo Videos (as requested)

| Section | YouTube URL | Uses |
|---|---|---|
| **Portfolio — Shorts** | https://www.youtube.com/shorts/bJBnMBXhVg0 | Vertical project card (tag `Shorts`) |
| **Portfolio — Shorts** | https://www.youtube.com/shorts/yq6RcvtWKas | Vertical project card (tag `Shorts`) |
| **Portfolio — Shorts** | https://www.youtube.com/shorts/dblGGEbpc9w | Vertical project card (tag `Shorts`) |
| **Review — Video** | https://www.youtube.com/shorts/3DVJ81fUlXg | Client video feedback carousel |
| **Landing — Hero** | https://www.youtube.com/watch?v=aj2QXCgiEzQ&list=RDGMEM_6azG-gbwFIpRtH6PATXiQVMaj2QXCgiEzQ&start_radio=1 | Hero showreel (YouTube player, autoplay muted) |

All dummy data lives in `src/data/dummy.ts` — edit there to replace titles/thumbnails without touching components.

## ✨ What was cleaned

- Removed Docker (`docker-compose.yml`, `Dockerfile`, `Dockerfile.frontend`) — not needed for frontend-only demo
- Removed Django `backend/` folder — frontend now falls back to dummy when `NEXT_PUBLIC_BACKEND_API_BASE_URL` is empty/unreachable
- Kept only `frontend/` content at repo root (this directory _is_ the Next.js app)
- Updated `next.config.mjs` to allow `img.youtube.com` / `i.ytimg.com` thumbnails
- Added central dummy file + fallbacks in `Hero.tsx`, `Portfolio.tsx`, `Testimonials.tsx`, `FAQ.tsx`

## 📁 Project Structure

```
bro-editz-frontend/
├── src/
│   ├── app/               # Next.js App Router (page.tsx, layout.tsx, admin/*)
│   ├── components/        # Hero, Portfolio, Testimonials, Services, Process, FAQ, Footer...
│   ├── data/
│   │   └── dummy.ts       # ← ALL dummy data (hero, works, reviews, FAQs) ← EDIT HERE
│   ├── lib/
│   │   ├── axios.ts       # Falls back to dummy if backend unreachable
│   │   └── admin-auth/    # Auth helpers (optional backend)
│   └── types/
├── public/                # hero-showcase.png, favicons, etc.
├── next.config.mjs
├── package.json
└── .env.example
```

## 🚀 Quick Start (no Docker)

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### 1. Clone
```bash
git clone git@github.com:SheikhIshere/bro-editz-frontend.git
cd bro-editz-frontend
```

### 2. Install
```bash
npm install
```

### 3. Env (optional)
Frontend runs **without env** using dummy data. To connect a backend, create `.env.local`:
```bash
cp .env.example .env.local
# then edit:
# NEXT_PUBLIC_BACKEND_API_BASE_URL=http://localhost:8005/v1/api
# or NEXT_PUBLIC_BACKEND_API_BASE_URL=https://api.broeditz.com/v1/api
```

### 4. Run
```bash
npm run dev
# → http://localhost:3000
```

### Build / Production
```bash
npm run build
npm run start
```

Deploy anywhere Next.js runs: Vercel, Netlify, AWS Amplify.

## 🧩 Dummy Data — How It Works

`src/data/dummy.ts` exports:

- `DUMMY_HERO_CONTENT` / `DUMMY_HERO_VIDEO` (landing video = `aj2QXCgiEzQ`)
- `DUMMY_WORKS` (6 items: 3 Shorts as requested + 3 long-form for “All” grid)
- `DUMMY_VIDEO_REVIEWS` (includes `3DVJ81fUlXg` as first item) + `DUMMY_TEXT_REVIEWS`
- `DUMMY_FAQS`, `DUMMY_SERVICES`, `DUMMY_STATS`

Components try the API first (`axiosInstance.get(...)` → `normalizeWorks` etc.). On **error or empty response**, they **fallback to dummy** and log a warning — so the site never looks broken.

> To go live, just set `NEXT_PUBLIC_BACKEND_API_BASE_URL` and ensure backend implements those endpoints; dummy is automatically bypassed when API returns data.

## 🛠️ Tech Stack

- **Next.js 14.2.0** (App Router), **React 18.3.1**, **TypeScript 5**
- **Tailwind CSS v4**, **Framer Motion 12**, **Lucide React**, **Lenis** smooth scroll
- **Axios** for data fetching, **clsx + tailwind-merge**

## 🎨 Sections

- **Hero** — cinematic headline + YouTube showreel with custom controls (10s seek, mute, fullscreen, autoplay)
- **Services** — marquee with fallback data if API down
- **Portfolio** — 3 Shorts swipe + long grid, tag filters (`Shorts` tag triggers swipe view)
- **Testimonials** — video carousel + text cards, both dummy-backed
- **Process** — 7-step timeline (static)
- **FAQ** — accordion + submit (uses dummy FAQs when offline)
- **Footer / ContactModal**

## 🔧 Customizing

- **Change portfolio videos:** edit `DUMMY_WORKS` in `src/data/dummy.ts` (replace `video_url` + `thumbnail`)
- **Change hero video:** edit `DUMMY_HERO_VIDEO.video_url`
- **Change review video:** edit first entry of `DUMMY_VIDEO_REVIEWS` (`3DVJ81fUlXg`)
- **Colors:** CSS variables in `src/app/globals.css` (`--accent-primary` etc.)

## 📜 License

MIT — feel free to fork for your agency.

---
Built with ❤️ from the [BroEditz-video-agency](https://github.com/NutCrackersOrg/BroEditz-video-agency) — frontend extracted & cleaned for standalone demo.
# bro-editz-frontend
