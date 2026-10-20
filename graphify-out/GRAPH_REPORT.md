# Graph Report - betteroff  (2026-10-20)

## Corpus Check
- 4 files · ~19,601 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 85 nodes · 177 edges · 10 communities
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.89)
- Token cost: 1,200 input · 650 output

## Community Hubs (Navigation)
- Data Storage & Unit Testing
- Admin Studio & Content Editor
- Core Router & Drawer Controller
- UI Templates & Architectural Specs
- About View & Conveyor Scroll Loop
- Surf 3D Ribbon & Physics Engine
- Timeline Inertia & Drag Physics
- Timeline Rendering & Date Navigation
- Sound Gate & Month Synchronization
- Audio Player & Track Control

## God Nodes (most connected - your core abstractions)
1. `escapeHtml()` - 11 edges
2. `escapeHtml()` - 9 edges
3. `switchView()` - 8 edges
4. `showToast()` - 7 edges
5. `renderTimeline()` - 7 edges
6. `renderAbout()` - 7 edges
7. `openArticleDrawer()` - 7 edges
8. `initAudioPlayer()` - 6 edges
9. `renderSurf()` - 6 edges
10. `startSurfAnimation()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `The Lookback System Architecture Spec` --references--> `Admin Studio Dashboard (admin.html)`  [EXTRACTED]
  docs/superpowers/specs/2026-10-20-the-lookback-design.md → admin.html
- `The Lookback System Architecture Spec` --references--> `The Lookback Webpage (index.html)`  [EXTRACTED]
  docs/superpowers/specs/2026-10-20-the-lookback-design.md → index.html
- `The Lookback Implementation Roadmap` --references--> `The Lookback System Architecture Spec`  [EXTRACTED]
  docs/superpowers/plans/2026-10-20-the-lookback-implementation.md → docs/superpowers/specs/2026-10-20-the-lookback-design.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **The Lookback Reactive System Architecture** — index_html, admin_html, site_data, app, admin [INFERRED 0.95]
- **Lookback Multi-View Presentation Architecture** — index_view_timeline, index_view_surf, index_view_about [INFERRED 0.95]

## Communities (10 total, 0 thin omitted)

### Community 0 - "Data Storage & Unit Testing"
Cohesion: 0.13
Nodes (12): sanitize(), sanitizeHtml(), art1, assert, data, deleted, foundNew, jsonStr (+4 more)

### Community 1 - "Admin Studio & Content Editor"
Cohesion: 0.31
Nodes (12): bindArticleCardEvents(), bindTrackCardEvents(), closeMediaPicker(), escapeHtml(), handleImageUpload(), openMediaPicker(), populateAboutForm(), renderArticles() (+4 more)

### Community 2 - "Core Router & Drawer Controller"
Cohesion: 0.33
Nodes (9): closeArticleDrawer(), handleHashChange(), openArticleDrawer(), sanitizeHtml(), stopAboutAnimation(), stopSurfAnimation(), switchView(), 3D Ribbon & Surf Navigation Engine (+1 more)

### Community 3 - "UI Templates & Architectural Specs"
Cohesion: 0.22
Nodes (9): Admin Studio Dashboard (admin.html), The Lookback Implementation Roadmap, The Lookback System Architecture Spec, Detail Drawer Panel, The Lookback Webpage (index.html), Audio Intro Sound Gate Modal, About Cinematic Dark View Container, Surf 3D Ribbon Viewport (+1 more)

### Community 4 - "About View & Conveyor Scroll Loop"
Cohesion: 0.39
Nodes (8): aboutAnimationLoop(), measureAboutBlocks(), renderAbout(), setupAboutPopovers(), setupAboutScroll(), startAboutAnimation(), updateAboutFrame(), wrap()

### Community 5 - "Surf 3D Ribbon & Physics Engine"
Cohesion: 0.48
Nodes (7): measureSurf(), renderSurf(), setupSurfEvents(), startSurfAnimation(), surfAnimationLoop(), updateSurfFrame(), updateSurfInfo()

### Community 6 - "Timeline Inertia & Drag Physics"
Cohesion: 0.40
Nodes (6): clampTimelineTarget(), playClick(), scrollToMonthGroup(), setupTimelineDrag(), startTimelineAnimation(), step()

### Community 7 - "Timeline Rendering & Date Navigation"
Cohesion: 0.60
Nodes (6): escapeHtml(), fullRender(), getArticleDateInfo(), renderIndex(), renderTimeline(), renderTimelineRuler()

### Community 8 - "Sound Gate & Month Synchronization"
Cohesion: 0.50
Nodes (4): checkActiveMonth(), initSoundGate(), onActiveMonthChanged(), playFx()

### Community 9 - "Audio Player & Track Control"
Cohesion: 0.67
Nodes (4): initAudioPlayer(), switchTrack(), toggleAudioPlayback(), updateCurrentTrackDisplay()

## Knowledge Gaps
- **8 isolated node(s):** `3D Ribbon & Surf Navigation Engine`, `Audio Jukebox Subsystem`, `The Lookback Implementation Roadmap`, `Audio Intro Sound Gate Modal`, `Timeline View Container` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 21 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Admin Studio Dashboard (admin.html)` connect `UI Templates & Architectural Specs` to `Data Storage & Unit Testing`, `Admin Studio & Content Editor`?**
  _High betweenness centrality (0.174) - this node is a cross-community bridge._
- **What connects `3D Ribbon & Surf Navigation Engine`, `Audio Jukebox Subsystem`, `The Lookback Implementation Roadmap` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Data Storage & Unit Testing` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._