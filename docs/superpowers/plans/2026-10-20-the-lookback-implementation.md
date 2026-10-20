# The Lookback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, responsive, standalone replica of Better Off Studio's "THE LOOKBACK" (`tlb.betteroff.studio`) with interactive Timeline, Surf, Index, About, Article Drawer, Music Player, sound effects, seed test data, and a full-featured CMS Admin Panel with live cross-tab sync.

**Architecture:** Vanilla ES6+ and modern CSS architecture modeled after `carousel-gallery-play` and `vivmgmt`. Uses `site-data.js` as the single source of truth with `localStorage` and `BroadcastChannel` real-time synchronization between the public frontend (`index.html` + `app.js`) and the CMS Studio (`admin.html` + `admin.js`).

**Tech Stack:** HTML5, CSS3 (CSS custom properties, 3D transforms, container queries), Modern Vanilla ES6+, Web Audio API / HTML5 Audio, LocalStorage, BroadcastChannel API.

**Spec:** [docs/superpowers/specs/2026-10-20-the-lookback-design.md](file:///home/edvins/features-for-web/betteroff/docs/superpowers/specs/2026-10-20-the-lookback-design.md)

## Global Constraints

- Standalone: Zero npm build step or server dependency; runnable via any static web server or browser.
- Typography: Use PP Neue Montreal and PP Neue Montreal Mono fonts for 100% brand fidelity.
- Visual Quality: Include subtle noise/grain texture, high-contrast typography, and smooth transitions.
- Security: Sanitize all dynamic HTML injections in article drawer and admin preview to eliminate XSS vectors.
- Responsiveness: Flawless experience from mobile (360px+) to ultra-wide desktop displays.

## Review Focus

1. **Audio Autoplay Restrictions**: Browsers block audio before user interaction; ensure intro gate cleanly unlocks audio context.
2. **Smooth Touch & Mouse Drag on Timeline & Surf**: Differentiate between drag vs tap (< 10px movement opens article, >= 10px pans).
3. **Data Integrity & Storage Limits**: Avoid localStorage quota exhaustion by cleanly validating uploaded media sizes.
4. **Live Real-time Sync**: Changes published in Admin must instantly update the public site tab via BroadcastChannel without full page reload.
5. **Mobile Viewport & Bottom Navigation**: Segmented navigation must remain cleanly pinned without covering content on iOS Safari / Android Chrome.

---

### Task 1: Asset Scaffolding & Media Assets

**Files:**
- Create: `assets/fonts/` (PP Neue Montreal webfonts)
- Create: `assets/audio/` (`click.mp3`, `fx.mp3`)
- Create: `assets/images/` (`noise.png`, seed covers, favicons)
- Create: `assets/videos/` (`render-big.mp4`)
- Test: Verification script checking presence and valid byte sizes of all assets.

- [ ] **Step 1: Download and verify font assets from live site**
- [ ] **Step 2: Download and verify sound effect assets (`click.mp3`, `fx.mp3`)**
- [ ] **Step 3: Download and verify video asset (`render-big.mp4`) and noise texture (`noise.png`)**
- [ ] **Step 4: Download representative high-resolution cover images for test articles and album art**
- [ ] **Step 5: Run verification script to ensure all assets exist and are non-empty**

---

### Task 2: Centralized CMS Data Store (`site-data.js`)

**Files:**
- Create: `site-data.js`
- Test: Unit/browser test validating `TLBStore` methods: `get()`, `save()`, `reset()`, `exportJSON()`, `importJSON()`, `BroadcastChannel` events.

- [ ] **Step 1: Define comprehensive default seed data structure (`TLB_DEFAULT_DATA`) with 20+ rich articles across multiple months, complete tracklist, about content, and site settings**
- [ ] **Step 2: Implement `TLBStore` singleton with `localStorage` persistence, draft/publish states, and fallback defaults**
- [ ] **Step 3: Implement `BroadcastChannel('tlb_cms_sync')` listener and emitter for cross-tab live updates**
- [ ] **Step 4: Implement export and import helper functions with JSON validation and XSS sanitization**
- [ ] **Step 5: Verify `site-data.js` runs cleanly in Node and browser environments without errors**

---

### Task 3: Public Website HTML & Shell (`index.html`)

**Files:**
- Create: `index.html`

- [ ] **Step 1: Construct semantic HTML5 document with meta tags, favicon links, and preloaded fonts**
- [ ] **Step 2: Add Sound Gate Intro modal markup (`#sound-gate`, "Enter with sound" / "...or without")**
- [ ] **Step 3: Add Top Navigation Bar (view links, dynamic title `Better Off® THE LOOKBACK`, audio player widget with marquee and tracklist dropdown)**
- [ ] **Step 4: Add Main Container with 4 view sections: `#view-timeline`, `#view-surf`, `#view-articles` (Index), `#view-about`**
- [ ] **Step 5: Add Slide-in Article Detail Drawer markup (`#article-drawer`) and backdrop**
- [ ] **Step 6: Add Fixed Mobile Segmented Navigation Bar (`#mobile-nav`)**
- [ ] **Step 7: Add Noise grain overlay element**

---

### Task 4: Production Styling & Responsive Design System (`styles.css`)

**Files:**
- Create: `styles.css`

- [ ] **Step 1: Configure `@font-face` definitions, design tokens (colors, spacing, z-index scale, easing)**
- [ ] **Step 2: Style Global shell, background grain animation (`@keyframes noise`), header, and navigation**
- [ ] **Step 3: Style Audio Jukebox widget (marquee scrolling text, tracklist dropdown, album art, play/pause indicator)**
- [ ] **Step 4: Style Timeline view (horizontal carousel, card aspect ratios, hover states, index numbers, bottom ruler ticks)**
- [ ] **Step 5: Style Surf 3D view (perspective container, 3D transformed ribbon wave, inertia scrolling)**
- [ ] **Step 6: Style Index view (responsive masonry-style grid grouped by months)**
- [ ] **Step 7: Style About view (centered rotating globe video container, typography, columns, footer)**
- [ ] **Step 8: Style Article Drawer (sliding panel, close button, source link, typography, video embeds)**
- [ ] **Step 9: Style Mobile navigation pill and mobile responsive breakpoints (<= 768px)**

---

### Task 5: Frontend Interactive Runtime (`app.js`)

**Files:**
- Create: `app.js`

- [ ] **Step 1: Implement view routing engine (Timeline, Surf, Index, About, and Article slug hashes)**
- [ ] **Step 2: Implement Audio Player engine (playlist queue, play/pause, timeupdate, volume, click sound effects on UI interactions)**
- [ ] **Step 3: Implement Timeline horizontal pan/drag controller with mouse/touch support and ruler tick synchronization**
- [ ] **Step 4: Implement Surf 3D interactive wave with mousemove / touch inertia and perspective transforms**
- [ ] **Step 5: Implement Article Drawer open/close transitions, keyboard shortcuts (`Esc`), and dynamic content population**
- [ ] **Step 6: Wire real-time `TLBStore` subscription so edits in Admin Panel immediately update the DOM**

---

### Task 6: Admin CMS Studio (`admin.html`, `admin.css`, `admin.js`)

**Files:**
- Create: `admin.html`
- Create: `admin.css`
- Create: `admin.js`

- [ ] **Step 1: Build Admin Dashboard layout with sidebar navigation tabs: Articles, Audio Tracks, About Page, Site Settings, Media Library**
- [ ] **Step 2: Build Articles Manager (create, edit, reorder, delete, filter by month, image upload/picker, rich text)**
- [ ] **Step 3: Build Audio Tracks Manager (add track, edit title, artist, audio URL, upload album art, reorder)**
- [ ] **Step 4: Build About Page & General Settings Editor (manifesto text, sections, globe video URL, SEO meta)**
- [ ] **Step 5: Build Media Library & Local Image Uploader (drag-and-drop file upload to Base64, media browser)**
- [ ] **Step 6: Implement Publish, Draft, Export JSON, Import JSON, Reset to Default, and Toast notification system**
- [ ] **Step 7: Style Admin interface with responsive, clean, studio-grade UI matching `carousel-gallery-play` / `vivmgmt`**

---

### Task 7: Comprehensive Testing, Verification, Security & Code Quality

**Files:**
- Test scripts & browser tests

- [ ] **Step 1: Test all navigation tabs and view routing in desktop and mobile viewports**
- [ ] **Step 2: Test audio playback, playlist switching, track marquee, and click sound feedback**
- [ ] **Step 3: Test Admin Panel CRUD operations and verify live synchronization across browser windows**
- [ ] **Step 4: Conduct Security & Code Quality Audit: eliminate redundant code/duplicates, ensure strict HTML sanitization, check CSP compliance**
- [ ] **Step 5: Verify mobile responsiveness on 390px viewport**

---

### Task 8: Graphify Knowledge Graph Generation

**Files:**
- Create: `.graphifyignore`
- Generate: `graphify-out/`

- [ ] **Step 1: Configure `.graphifyignore` to skip large media files and binary blobs**
- [ ] **Step 2: Run `graphify` extraction on the completed codebase**
- [ ] **Step 3: Verify knowledge graph output in `graphify-out/`**
