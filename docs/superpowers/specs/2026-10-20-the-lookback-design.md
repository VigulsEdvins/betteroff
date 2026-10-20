# The Lookback (Better Off® Studio) — Design Specification

**Date:** 2026-10-20  
**Project:** The Lookback Web Experience & CMS Admin Panel  
**Reference Implementations:** `../carousel-gallery-play`, `../vivmgmt`, https://tlb.betteroff.studio

---

## 1. Intent & Purpose

Recreate a faithful, responsive, high-fidelity copy of **Better Off Studio's "THE LOOKBACK" (`tlb.betteroff.studio`)**, complete with interactive 3D / timeline views, an audio jukebox experience, responsive mobile navigation, and an intuitive Admin Panel (`admin.html`) enabling non-technical users to edit text, swap images, configure music tracks, and manage articles with live synchronized preview.

---

## 2. Architecture & File Structure

Adopting the proven, robust architecture established in `carousel-gallery-play` and `vivmgmt`:

```
betteroff/
├── index.html            # Public website (Timeline, Surf, Index, About, Drawer, Player)
├── styles.css            # Production CSS: responsive layouts, 3D transforms, typography
├── app.js                # Frontend runtime: views, audio engine, timeline gestures, drawer
├── site-data.js          # Central store: default seed data, persistence, BroadcastChannel sync
├── admin.html            # Admin CMS Studio interface with live preview & tabbed editors
├── admin.css             # Admin dashboard styling
├── admin.js              # Admin logic: forms, image uploader, JSON export/import, sync
├── assets/
│   ├── fonts/            # PP Neue Montreal (Book, Medium, Bold), PP Neue Montreal Mono
│   ├── images/           # Curated test images, album art, noise texture
│   ├── audio/            # click.mp3, fx.mp3, sample audio tracks
│   └── videos/           # render-big.mp4 (rotating 3D metallic globe)
├── docs/                 # Specs, plans, documentation
├── .graphifyignore       # Graphify ignore configuration
└── .gitignore            # Git configuration
```

---

## 3. Core Features & User Requirements

### 3.1 Public Experience (`index.html`)
1. **Intro Sound Gate**:
   - Initial modal: `"Enter with sound →"` or `"...or without"`.
   - Remembers sound preference in session/local storage.
2. **Top Navigation & Branding**:
   - Left: View links (`Timeline,`, `Surf,`, `Index,`, `About`).
   - Center: Dynamic brand header `Better Off® THE LOOKBACK (BO®S/2026)`.
   - Right: Interactive music pill with marquee scroll of current track, play/pause toggle, and dropdown tracklist with thumbnails.
   - Micro-interactions: Tactile click audio effect (`click.mp3`) on link/button interactions.
3. **Four Distinct Views**:
   - **Timeline (`#timeline` / default)**: Horizontal swipeable/draggable card carousel with parallax depth, index badge, tag/month, and calendar ruler tick marks along the bottom.
   - **Surf (`#surf`)**: 3D tilted ribbon wave of articles floating in space with mouse/touch-driven inertia scrolling.
   - **Index (`#articles`)**: Multi-column monthly masonry grid layout with month headings.
   - **About (`#about`)**: Studio manifesto, spinning 3D metallic globe video (`render-big.mp4`), stats, and footer credits.
4. **Article Detail Drawer (`#articles/:slug` / slide-in modal)**:
   - Click card on Timeline or Index to open side drawer.
   - Header: Category badge (e.g. `INSPIRE (MARCH)`), `Close`, `Source ↗` external link.
   - Body: Title, rich text description, media embeds (images/video), tags, and metadata.
   - Smooth slide-in animation; `Esc` or overlay click closes drawer.
5. **Mobile Responsiveness**:
   - Fixed bottom segmented pill navigation bar: `[ Timeline ] [ Surf ] [ Index ] [ About ]`.
   - Touch drag and swipe for horizontal timeline and surf views.
   - Full-width mobile drawer with smooth vertical scrolling.
   - Mobile-adapted header and audio toggle.

---

### 3.2 Admin CMS Studio (`admin.html`)
1. **Article Management**:
   - View, add, edit, duplicate, and delete articles.
   - Editable fields: Title, slug, month, category tag (`INSPIRE`, `SHOWCASE`, `EDUCATE`), date, external source URL, cover image (upload / URL / preset), rich text / description, media embeds.
   - Reordering and month assignment.
2. **Music & Audio Playlist**:
   - Manage playlist: Title, artist, MP3 URL / audio source, thumbnail image.
   - Add new tracks, reorder, delete tracks.
3. **About & Brand Settings**:
   - Edit headline, studio manifesto text, section pillars, credits, contact info, and globe video asset.
4. **General & Site Meta**:
   - Site title, meta description, favicon, noise overlay toggle, audio defaults.
5. **Media Library & Image Uploader**:
   - Upload images from disk (stored as Base64 / data URLs), enter direct URLs, or pick from pre-bundled assets.
6. **Persistence & Data Portability**:
   - Real-time synchronization to live tabs via `BroadcastChannel('tlb_cms_sync_channel')`.
   - LocalStorage backup (`tlb_site_data_v1`).
   - One-click `Export JSON`, `Import JSON`, and `Reset to Default`.
   - Visual draft / publish workflow with toast notifications.

---

## 4. Test Data & Seed Content
- Bundled seed dataset with representative articles spanning multiple months (March down through January) with realistic photography, skate/streetwear/culture imagery, and audio tracks matching the aesthetic of the live site.
- Allows immediate demonstration of all views and interactions without requiring manual data entry first.

---

## 5. Non-Goals & Anti-Goals
- **Anti-Goal**: Requiring Node.js backend runtime or DatoCMS API keys to run. The site must be 100% self-contained, statically hostable on GitHub Pages/Netlify/Vercel or viewable directly in any browser.
- **Anti-Goal**: Fragile dependencies or heavy framework lock-in. Vanilla ES6+ and modern CSS ensures maximum longevity, performance, and portability.

---

## 6. Review & Verification Criteria
- All 4 views (Timeline, Surf, Index, About) and Article Drawer function seamlessly.
- Audio player functions with play/pause, playlist dropdown, and click sound effects.
- Admin panel edits reflect in real time on the live site without page reloads.
- Responsive layout verified on mobile (390px) and desktop (1440px+).
- Code quality pass: no redundant code, no duplicates, secure against XSS, sanitized inputs.
- Knowledge graph generated via `graphify`.
