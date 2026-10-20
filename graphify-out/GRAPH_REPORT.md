# Graph Report - betteroff  (2026-10-20)

## Corpus Check
- Corpus is ~16,140 words - fits in a single context window. You may not need a graph.

## Summary
- 57 nodes · 107 edges · 9 communities (8 shown, 1 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Store Test Suite
- App Lifecycle & Navigation Routing
- Admin Article & Settings Management
- Content Rendering & Drawer Engine
- Architecture & Data Core
- Admin Media & Toast UI
- Audio Player & Jukebox Controller
- Timeline Interaction & Physics Drag
- Admin Jukebox Track Editor

## God Nodes (most connected - your core abstractions)
1. `showToast()` - 7 edges
2. `escapeHtml()` - 7 edges
3. `openArticleDrawer()` - 7 edges
4. `escapeHtml()` - 7 edges
5. `initAudioPlayer()` - 6 edges
6. `fullRender()` - 6 edges
7. `openMediaPicker()` - 5 edges
8. `renderTimeline()` - 5 edges
9. `bindArticleCardEvents()` - 4 edges
10. `bindTrackCardEvents()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `The Lookback System Architecture Spec` --references--> `The Lookback Webpage (index.html)`  [EXTRACTED]
  docs/superpowers/specs/2026-10-20-the-lookback-design.md → index.html
- `The Lookback System Architecture Spec` --references--> `Admin Studio Dashboard (admin.html)`  [EXTRACTED]
  docs/superpowers/specs/2026-10-20-the-lookback-design.md → admin.html
- `The Lookback Implementation Roadmap` --references--> `The Lookback System Architecture Spec`  [EXTRACTED]
  docs/superpowers/plans/2026-10-20-the-lookback-implementation.md → docs/superpowers/specs/2026-10-20-the-lookback-design.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **The Lookback Reactive System Architecture** — index_html, admin_html, site_data, app, admin [INFERRED 0.95]

## Communities (9 total, 1 thin omitted)

### Community 0 - "Store Test Suite"
Cohesion: 0.18
Nodes (9): art1, assert, data, deleted, foundNew, jsonStr, newArt, storeModule (+1 more)

### Community 1 - "App Lifecycle & Navigation Routing"
Cohesion: 0.33
Nodes (7): closeArticleDrawer(), handleHashChange(), initSoundGate(), playFx(), switchView(), 3D Ribbon & Surf Navigation Engine, Audio Jukebox Subsystem

### Community 2 - "Admin Article & Settings Management"
Cohesion: 0.39
Nodes (5): bindArticleCardEvents(), closeMediaPicker(), openMediaPicker(), renderArticles(), renderPickerLibrary()

### Community 3 - "Content Rendering & Drawer Engine"
Cohesion: 0.39
Nodes (8): escapeHtml(), fullRender(), openArticleDrawer(), renderAbout(), renderIndex(), renderSurf(), sanitizeHtml(), setupSurfDrag()

### Community 4 - "Architecture & Data Core"
Cohesion: 0.33
Nodes (5): Admin Studio Dashboard (admin.html), The Lookback Implementation Roadmap, The Lookback System Architecture Spec, The Lookback Webpage (index.html), BroadcastChannel Live State Sync Bus

### Community 5 - "Admin Media & Toast UI"
Cohesion: 0.70
Nodes (5): escapeHtml(), handleImageUpload(), populateAboutForm(), renderMediaLibrary(), showToast()

### Community 6 - "Audio Player & Jukebox Controller"
Cohesion: 0.67
Nodes (4): initAudioPlayer(), switchTrack(), toggleAudioPlayback(), updateCurrentTrackDisplay()

### Community 7 - "Timeline Interaction & Physics Drag"
Cohesion: 0.67
Nodes (3): renderTimeline(), renderTimelineRuler(), setupTimelineDrag()

## Knowledge Gaps
- **3 isolated node(s):** `The Lookback Implementation Roadmap`, `Audio Jukebox Subsystem`, `3D Ribbon & Surf Navigation Engine`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 17 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `The Lookback Webpage (index.html)` connect `Architecture & Data Core` to `App Lifecycle & Navigation Routing`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `The Lookback Implementation Roadmap`, `Audio Jukebox Subsystem`, `3D Ribbon & Surf Navigation Engine` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Why does `Admin Studio Dashboard (admin.html)` connect `Architecture & Data Core` to `Admin Article & Settings Management`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._