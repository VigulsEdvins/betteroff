/**
 * Better Off® — THE LOOKBACK Interactive Frontend Runtime (`app.js`)
 */

(function () {
  'use strict';

  // State Management
  let siteData = window.TLBStore ? window.TLBStore.get() : {};
  let currentView = 'timeline';
  let activeArticleSlug = null;

  // Audio Engine State
  let isSoundEnabled = false;
  let isAudioPlaying = false;
  let currentTrackIndex = 0;
  const audioElement = document.getElementById('site-audio');
  const clickAudio = new Audio('./assets/audio/click.mp3');
  const fxAudio = new Audio('./assets/audio/fx.mp3');

  // DOM Elements
  const soundGate = document.getElementById('sound-gate');
  const btnEnterSound = document.getElementById('btn-enter-sound');
  const btnEnterSilent = document.getElementById('btn-enter-silent');
  const siteNav = document.querySelector('.site-nav');
  const mobileNav = document.getElementById('mobile-nav');
  const audioPill = document.getElementById('audio-pill');
  const audioPlayToggle = document.getElementById('audio-play-toggle');
  const audioMarqueeText = document.getElementById('audio-marquee-text');
  const audioTracklist = document.getElementById('audio-tracklist');
  const audioTrackCount = document.getElementById('audio-track-count');

  // Views DOM
  const viewTimeline = document.getElementById('view-timeline');
  const viewSurf = document.getElementById('view-surf');
  const viewArticles = document.getElementById('view-articles');
  const viewAbout = document.getElementById('view-about');
  const timelineTrack = document.getElementById('timeline-track');
  const timelineViewport = document.getElementById('timeline-viewport');
  const rulerTicks = document.getElementById('timeline-ruler-ticks');
  const rulerMonths = document.getElementById('timeline-ruler-months');
  const surfRibbon = document.getElementById('surf-ribbon');
  const surfContainer = document.getElementById('surf-container');
  const indexGrid = document.getElementById('index-grid');

  // Article Drawer DOM
  const articleDrawer = document.getElementById('article-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerBtnClose = document.getElementById('drawer-btn-close');
  const drawerBadgeTag = document.getElementById('drawer-badge-tag');
  const drawerBadgeMonth = document.getElementById('drawer-badge-month');
  const drawerSourceLink = document.getElementById('drawer-source-link');
  const drawerTitle = document.getElementById('drawer-title');
  const drawerMedia = document.getElementById('drawer-media');
  const drawerBody = document.getElementById('drawer-body');

  /* --------------------------------------------------------------------------
     1. Sound Effects & Micro-Interactions
     -------------------------------------------------------------------------- */
  function playClick() {
    if (!isSoundEnabled) return;
    try {
      clickAudio.currentTime = 0;
      clickAudio.volume = 0.35;
      clickAudio.play().catch(() => {});
    } catch (e) {}
  }

  function playFx() {
    if (!isSoundEnabled) return;
    try {
      fxAudio.currentTime = 0;
      fxAudio.volume = 0.4;
      fxAudio.play().catch(() => {});
    } catch (e) {}
  }

  // Bind click sound to all interactive elements
  document.addEventListener('click', (e) => {
    if (e.target.closest('a, button, .timeline-card, .surf-card, .index-card')) {
      playClick();
    }
  });

  /* --------------------------------------------------------------------------
     2. Audio Jukebox Engine
     -------------------------------------------------------------------------- */
  function initAudioPlayer() {
    const tracks = siteData.tracks || [];
    if (!tracks.length) return;

    if (audioTrackCount) audioTrackCount.textContent = tracks.length;

    // Render dropdown tracklist
    if (audioTracklist) {
      audioTracklist.innerHTML = tracks.map((track, idx) => `
        <button type="button" class="track-item ${idx === currentTrackIndex ? 'is-active' : ''}" data-index="${idx}">
          <img src="${track.thumbnail || './assets/images/favicon.gif'}" alt="" class="track-thumb" />
          <div class="track-meta">
            <span class="track-title">${escapeHtml(track.title)}</span>
            <span class="track-artist">${escapeHtml(track.artist)}</span>
          </div>
        </button>
      `).join('');

      audioTracklist.querySelectorAll('.track-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index, 10);
          switchTrack(idx, true);
        });
      });
    }

    updateCurrentTrackDisplay();

    // Player events
    if (audioPlayToggle) {
      audioPlayToggle.addEventListener('click', toggleAudioPlayback);
    }

    if (audioElement) {
      audioElement.addEventListener('ended', () => {
        const nextIdx = (currentTrackIndex + 1) % tracks.length;
        switchTrack(nextIdx, true);
      });

      audioElement.addEventListener('play', () => {
        isAudioPlaying = true;
        if (audioPill) {
          audioPill.classList.add('is-playing');
          audioPill.classList.remove('is-paused');
        }
      });

      audioElement.addEventListener('pause', () => {
        isAudioPlaying = false;
        if (audioPill) {
          audioPill.classList.remove('is-playing');
          audioPill.classList.add('is-paused');
        }
      });
    }
  }

  function updateCurrentTrackDisplay() {
    const tracks = siteData.tracks || [];
    const track = tracks[currentTrackIndex];
    if (!track) return;

    if (audioMarqueeText) {
      const text = `${track.artist} - ${track.title} / `;
      audioMarqueeText.innerHTML = `<span>${text.repeat(4)}</span>`;
    }

    if (audioTracklist) {
      audioTracklist.querySelectorAll('.track-item').forEach((item, idx) => {
        item.classList.toggle('is-active', idx === currentTrackIndex);
      });
    }
  }

  function switchTrack(index, playImmediately = false) {
    const tracks = siteData.tracks || [];
    if (index < 0 || index >= tracks.length) return;

    currentTrackIndex = index;
    const track = tracks[currentTrackIndex];
    updateCurrentTrackDisplay();

    if (audioElement && track.audioUrl) {
      audioElement.src = track.audioUrl;
      if (playImmediately && isSoundEnabled) {
        audioElement.play().catch(err => {
          console.warn('Playback interrupted:', err);
        });
      }
    }
  }

  function toggleAudioPlayback() {
    if (!audioElement) return;
    if (audioElement.paused) {
      isSoundEnabled = true;
      if (!audioElement.src && siteData.tracks && siteData.tracks[currentTrackIndex]) {
        audioElement.src = siteData.tracks[currentTrackIndex].audioUrl;
      }
      audioElement.play().catch(() => {});
    } else {
      audioElement.pause();
    }
  }

  /* --------------------------------------------------------------------------
     3. Sound Gate Intro & Stats
     -------------------------------------------------------------------------- */
  function initSoundGate() {
    const statsContainer = document.getElementById('sound-gate-stats');
    if (statsContainer) {
      // Calculate monthly stats from articles
      const articles = siteData.articles || [];
      const monthMap = {};
      articles.forEach(a => {
        const m = a.month || 'OTHER';
        if (!monthMap[m]) monthMap[m] = { articles: 0, inspiration: 0, showcase: 0 };
        monthMap[m].articles++;
        if (a.tag === 'INSPIRE') monthMap[m].inspiration++;
        if (a.tag === 'SHOWCASE') monthMap[m].showcase++;
      });

      const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
      statsContainer.innerHTML = months.map(m => {
        const count = monthMap[m]?.articles || 0;
        return `
          <div class="sound-gate__month-col">
            <strong>${m}</strong>
            <span>ARTICLES (${count})</span>
            <span>MUSIC (${siteData.tracks?.length || 15})</span>
          </div>
        `;
      }).join('');
    }

    if (btnEnterSound) {
      btnEnterSound.addEventListener('click', () => {
        isSoundEnabled = true;
        soundGate.classList.add('is-hidden');
        document.body.classList.remove('is-loading');
        playFx();
        switchTrack(currentTrackIndex, true);
      });
    }

    if (btnEnterSilent) {
      btnEnterSilent.addEventListener('click', () => {
        isSoundEnabled = false;
        soundGate.classList.add('is-hidden');
        document.body.classList.remove('is-loading');
      });
    }
  }

  /* --------------------------------------------------------------------------
     4. Navigation & View Routing
     -------------------------------------------------------------------------- */
  function switchView(viewName) {
    if (currentView === viewName) return;
    currentView = viewName;
    playFx();

    // Toggle active section
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.toggle('is-active', sec.dataset.view === viewName);
    });

    // Update Desktop Nav
    document.querySelectorAll('.site-nav .nav-link').forEach(link => {
      link.classList.toggle('is-active', link.dataset.view === viewName);
    });

    // Update Mobile Nav
    document.querySelectorAll('.mobile-nav__btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.view === viewName);
    });

    // Handle branding appearance per view
    const branding = document.getElementById('site-branding');
    if (branding) {
      if (viewName === 'about') {
        branding.style.opacity = '0';
        branding.style.pointerEvents = 'none';
      } else {
        branding.style.opacity = '1';
        branding.style.pointerEvents = 'auto';
      }
    }

    // Close drawer if open when switching views
    closeArticleDrawer();

    if (viewName === 'surf') {
      startSurfAnimation();
    } else {
      stopSurfAnimation();
    }

    if (viewName === 'about') {
      document.body.classList.add('is-about');
      startAboutAnimation();
    } else {
      document.body.classList.remove('is-about');
      stopAboutAnimation();
    }
  }

  function handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (!hash || hash === 'timeline') {
      switchView('timeline');
    } else if (hash === 'surf') {
      switchView('surf');
    } else if (hash === 'articles') {
      switchView('articles');
    } else if (hash === 'about') {
      switchView('about');
    } else if (hash.startsWith('articles/')) {
      const slug = hash.replace('articles/', '');
      openArticleDrawer(slug);
    }
  }

  /* --------------------------------------------------------------------------
     5. Timeline View Controller
     -------------------------------------------------------------------------- */
  /* --------------------------------------------------------------------------
     5. Timeline View Controller (Smooth Inertia & Wheel Physics)
     -------------------------------------------------------------------------- */
  let timelineTargetX = 0;
  let timelineCurrentX = 0;
  let timelineMaxX = 0;
  let timelineAnimId = null;
  let currentActiveMonth = '';

  const MONTH_NAMES = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  function getArticleDateInfo(article) {
    let year = 2026;
    let monthIdx = 2; // Default to March

    if (article.date && typeof article.date === 'string') {
      const parts = article.date.split('-');
      if (parts.length >= 2) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (!isNaN(y)) year = y;
        if (!isNaN(m) && m >= 1 && m <= 12) monthIdx = m - 1;
      }
    } else if (article.year) {
      year = parseInt(article.year, 10) || 2026;
    }

    if (article.month) {
      const mIdx = MONTH_NAMES.indexOf(String(article.month).toUpperCase());
      if (mIdx !== -1) monthIdx = mIdx;
    }

    const monthName = MONTH_NAMES[monthIdx];
    const shortYear = String(year).slice(-2);
    const sortVal = (year * 100) + monthIdx;

    return {
      year,
      shortYear,
      monthName,
      monthIdx,
      sortVal,
      groupKey: `${monthName} '${shortYear}`
    };
  }

  function renderTimeline() {
    if (!timelineTrack) return;
    const rawArticles = siteData.articles || [];

    // Sort articles chronologically descending (newest year/month first, e.g. 2027 January before 2026 March)
    const articles = rawArticles.slice().sort((a, b) => {
      const infoA = getArticleDateInfo(a);
      const infoB = getArticleDateInfo(b);
      if (infoA.sortVal !== infoB.sortVal) {
        return infoB.sortVal - infoA.sortVal;
      }
      return (a.index || 0) - (b.index || 0);
    });

    let currentGroup = '';
    timelineTrack.innerHTML = articles.map((article, idx) => {
      const info = getArticleDateInfo(article);
      const isNewGroup = info.groupKey !== currentGroup;
      if (isNewGroup) {
        currentGroup = info.groupKey;
      }
      return `
        <article class="timeline-card" data-slug="${escapeHtml(article.slug)}" data-month="${escapeHtml(info.monthName)}" data-year="${info.year}" data-group="${escapeHtml(info.groupKey)}" data-index="${idx}">
          ${isNewGroup ? `<div class="timeline-month-flag"><span>${escapeHtml(info.monthName)}</span> <span>'${info.shortYear}</span></div>` : ''}
          <span class="timeline-card__badge-top">${article.index || (idx + 1)}</span>
          <div class="timeline-card__media" style="aspect-ratio: ${article.aspect || 1.25};">
            <img src="${article.cover}" alt="${escapeHtml(article.title)}" class="timeline-card__img" loading="lazy" />
          </div>
          <span class="timeline-card__badge-bottom">${escapeHtml(article.tag || 'INSPIRE')} (${escapeHtml(info.monthName)})</span>
        </article>
      `;
    }).join('');

    renderTimelineRuler();
    setupTimelineDrag();
    setTimeout(() => {
      checkActiveMonth();
    }, 50);
  }

  function renderTimelineRuler() {
    if (!rulerTicks || !rulerMonths) return;

    // Render 120 ticks
    let ticksHtml = '';
    for (let i = 0; i < 120; i++) {
      const isMajor = i % 5 === 0;
      ticksHtml += `<div class="ruler-tick ${isMajor ? 'ruler-tick--major' : ''}" data-tick="${i}"></div>`;
    }
    rulerTicks.innerHTML = ticksHtml;

    // Extract month groups in chronological order
    const rawArticles = siteData.articles || [];
    const groups = [];
    const seenGroups = new Set();

    // Sort to extract groups in chronological order
    rawArticles.slice().sort((a, b) => getArticleDateInfo(b).sortVal - getArticleDateInfo(a).sortVal).forEach(a => {
      const info = getArticleDateInfo(a);
      if (!seenGroups.has(info.groupKey)) {
        seenGroups.add(info.groupKey);
        groups.push(info);
      }
    });

    if (groups.length === 0) {
      groups.push({ groupKey: "MARCH '26", monthName: "MARCH", year: 2026, shortYear: "26" });
    }

    rulerMonths.innerHTML = groups.map((g, idx) => `
      <button type="button" class="ruler-month-btn ${idx === 0 ? 'is-active' : ''}" data-month="${escapeHtml(g.monthName)}" data-year="${g.year}" data-group="${escapeHtml(g.groupKey)}">
        ${escapeHtml(g.groupKey)}
      </button>
    `).join('');

    // Bind click events on month buttons to jump directly to that month group
    rulerMonths.querySelectorAll('.ruler-month-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetGroup = btn.dataset.group;
        scrollToMonthGroup(targetGroup);
      });
    });
  }

  function scrollToMonthGroup(groupKey) {
    if (!timelineTrack || !timelineViewport) return;
    const cards = Array.from(timelineTrack.querySelectorAll('.timeline-card'));
    const targetCard = cards.find(c => c.dataset.group === groupKey);
    if (targetCard) {
      timelineTargetX = Math.max(0, targetCard.offsetLeft - 80);
      clampTimelineTarget();
      startTimelineAnimation();
      playClick();
    }
  }

  function clampTimelineTarget() {
    if (!timelineTrack || !timelineViewport) return;
    timelineMaxX = Math.max(0, timelineTrack.scrollWidth - timelineViewport.clientWidth);
    timelineTargetX = Math.max(0, Math.min(timelineTargetX, timelineMaxX));
  }

  function startTimelineAnimation() {
    if (timelineAnimId) return;

    function step() {
      if (!timelineViewport || !timelineTrack) return;
      const diff = timelineTargetX - timelineCurrentX;
      const velocity = diff * 0.16;
      timelineCurrentX += velocity;

      timelineViewport.scrollLeft = timelineCurrentX;

      // 3D card tilt based on velocity (matches real lookback site)
      const tilt = Math.max(-10, Math.min(10, -velocity * 0.08));
      const mediaList = timelineTrack.querySelectorAll('.timeline-card__media');
      mediaList.forEach(m => {
        m.style.transform = Math.abs(tilt) > 0.2 ? `rotateY(${tilt}deg)` : '';
      });

      // Shift ruler ticks continuously to create mechanical tick ruler illusion
      if (rulerTicks) {
        const tickShift = -(timelineCurrentX % 70);
        rulerTicks.style.transform = `translate3d(${tickShift}px, 0, 0)`;
      }

      // Check active month under center viewport
      checkActiveMonth();

      if (Math.abs(diff) > 0.5) {
        timelineAnimId = requestAnimationFrame(step);
      } else {
        timelineCurrentX = timelineTargetX;
        timelineViewport.scrollLeft = timelineCurrentX;
        mediaList.forEach(m => { m.style.transform = ''; });
        timelineAnimId = null;
      }
    }

    timelineAnimId = requestAnimationFrame(step);
  }

  function checkActiveMonth() {
    if (!timelineViewport || !timelineTrack) return;
    const cards = timelineTrack.querySelectorAll('.timeline-card');
    if (!cards.length) return;

    let activeCard = null;

    // If near the end of timeline scroll, pick the last card
    if (timelineMaxX > 0 && timelineCurrentX >= timelineMaxX - 80) {
      activeCard = cards[cards.length - 1];
    } else {
      const focalPoint = timelineCurrentX + 120;
      let minDistance = Infinity;

      cards.forEach(card => {
        const cardLeft = card.offsetLeft;
        const dist = Math.abs(cardLeft - focalPoint);
        if (dist < minDistance) {
          minDistance = dist;
          activeCard = card;
        }
      });
    }

    if (activeCard) {
      const groupKey = activeCard.dataset.group || '';
      if (groupKey !== currentActiveMonth) {
        currentActiveMonth = groupKey;
        onActiveMonthChanged(activeCard);
      }
    }
  }

  function onActiveMonthChanged(activeCard) {
    const month = (activeCard.dataset.month || 'MARCH').toUpperCase();
    const shortYear = activeCard.dataset.year ? String(activeCard.dataset.year).slice(-2) : '26';
    const groupKey = activeCard.dataset.group || `${month} '${shortYear}`;

    // 1. Update ruler buttons
    if (rulerMonths) {
      rulerMonths.querySelectorAll('.ruler-month-btn').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.group === groupKey);
      });
      const activeBtn = rulerMonths.querySelector(`.ruler-month-btn[data-group="${groupKey}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }

    // 2. Update header branding row (BO®S/MONTH 'YEAR)
    const brandRow3 = document.getElementById('brand-row-3');
    if (brandRow3) {
      brandRow3.innerHTML = `(BO®S/${escapeHtml(month)} '${shortYear})`;
    }

    // 3. Play tick SFX
    playFx();
  }

  let timelineListenersBound = false;
  function setupTimelineDrag() {
    if (!timelineViewport || timelineListenersBound) return;
    timelineListenersBound = true;

    // Mouse Drag with inertia fling
    let isDown = false;
    let startX = 0;
    let dragStartTarget = 0;
    let draggedDist = 0;
    let lastMoveTime = 0;
    let lastMoveX = 0;
    let dragVelocity = 0;

    timelineViewport.addEventListener('mousedown', (e) => {
      isDown = true;
      timelineViewport.classList.add('is-dragging');
      startX = e.pageX;
      lastMoveX = e.pageX;
      lastMoveTime = Date.now();
      dragStartTarget = timelineTargetX;
      draggedDist = 0;
      dragVelocity = 0;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const now = Date.now();
      const dt = now - lastMoveTime || 16;
      const dx = e.pageX - lastMoveX;
      dragVelocity = dx / dt;
      lastMoveX = e.pageX;
      lastMoveTime = now;

      const totalDx = e.pageX - startX;
      draggedDist += Math.abs(dx);
      timelineTargetX = dragStartTarget - (totalDx * 1.5);
      clampTimelineTarget();
      startTimelineAnimation();
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      timelineViewport.classList.remove('is-dragging');
      if (Math.abs(dragVelocity) > 0.15) {
        timelineTargetX -= dragVelocity * 200;
        clampTimelineTarget();
        startTimelineAnimation();
      }
    });

    // Wheel scrolling on timeline (translates vertical wheel to horizontal scroll with inertia)
    const handleWheel = (e) => {
      const section = document.getElementById('view-timeline');
      if (!section || !section.classList.contains('is-active')) return;
      if (activeArticleSlug) return;

      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      timelineTargetX += delta * 1.5;
      clampTimelineTarget();
      startTimelineAnimation();
    };

    timelineViewport.addEventListener('wheel', handleWheel, { passive: false });
    const timelineSec = document.getElementById('view-timeline');
    if (timelineSec) {
      timelineSec.addEventListener('wheel', handleWheel, { passive: false });
    }

    // Keyboard Arrow navigation
    window.addEventListener('keydown', (e) => {
      const section = document.getElementById('view-timeline');
      if (!section || !section.classList.contains('is-active')) return;
      if (activeArticleSlug) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        timelineTargetX += 340;
        clampTimelineTarget();
        startTimelineAnimation();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        timelineTargetX -= 340;
        clampTimelineTarget();
        startTimelineAnimation();
      }
    });

    // Click handler on card
    timelineViewport.addEventListener('click', (e) => {
      const card = e.target.closest('.timeline-card');
      if (card && draggedDist < 10) {
        const slug = card.dataset.slug;
        openArticleDrawer(slug);
      }
    });

    // Touch support (Mobile swipe with inertia)
    let touchStartX = 0;
    let touchStartTarget = 0;
    let touchLastX = 0;
    let touchLastTime = 0;
    let touchVelocity = 0;

    timelineViewport.addEventListener('touchstart', (e) => {
      if (!e.touches.length) return;
      touchStartX = e.touches[0].pageX;
      touchLastX = touchStartX;
      touchLastTime = Date.now();
      touchStartTarget = timelineTargetX;
      draggedDist = 0;
      touchVelocity = 0;
    }, { passive: true });

    timelineViewport.addEventListener('touchmove', (e) => {
      if (!e.touches.length) return;
      const currentX = e.touches[0].pageX;
      const now = Date.now();
      const dt = now - touchLastTime || 16;
      const dx = currentX - touchLastX;
      touchVelocity = dx / dt;
      touchLastX = currentX;
      touchLastTime = now;

      const totalDx = currentX - touchStartX;
      draggedDist += Math.abs(dx);
      timelineTargetX = touchStartTarget - (totalDx * 1.3);
      clampTimelineTarget();
      startTimelineAnimation();
    }, { passive: true });

    timelineViewport.addEventListener('touchend', (e) => {
      if (Math.abs(touchVelocity) > 0.15) {
        timelineTargetX -= touchVelocity * 200;
        clampTimelineTarget();
        startTimelineAnimation();
      }
      if (draggedDist < 10) {
        const card = e.target.closest('.timeline-card');
        if (card && card.dataset.slug) {
          openArticleDrawer(card.dataset.slug);
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     6. Surf 3D View Controller (Exact Sine-Wave Ribbon from Real Site)
     -------------------------------------------------------------------------- */
  let surfCurrentScroll = 0;
  let surfTargetScroll = 0;
  let surfVelocity = 0;
  let surfWaveTime = 0;
  let surfAnimId = null;
  let surfItems = [];
  let surfTotalWidth = 0;
  let surfStepX = 80;
  let surfStepY = 40;
  let surfRestAmplitude = 14;
  let surfHoveredIndex = -1;
  const surfFloatingInfo = document.getElementById('surf-floating-info');
  let surfListenersBound = false;

  function renderSurf() {
    if (!surfRibbon) return;
    const articles = (siteData.articles || []).slice(0, 48);
    if (!articles.length) return;

    surfRibbon.innerHTML = articles.map((article, idx) => `
      <article class="surf-carousel-item js-slide" data-slug="${escapeHtml(article.slug)}" data-index="${idx}">
        <div class="surf-carousel-item__content js-slide-content">
          <div class="surf-carousel-item__media">
            <img src="${article.cover}" alt="${escapeHtml(article.title)}" loading="lazy" />
          </div>
        </div>
      </article>
    `).join('');

    measureSurf();
    setupSurfEvents();
    if (currentView === 'surf') {
      startSurfAnimation();
    }
  }

  function measureSurf() {
    if (!surfRibbon) return;
    const itemEls = Array.from(surfRibbon.querySelectorAll('.surf-carousel-item'));
    if (!itemEls.length) return;

    const ww = window.innerWidth;
    const wh = window.innerHeight;
    const isSmall = ww < 768;
    const P = isSmall ? 6 : 18;
    surfStepX = ww / P;
    surfStepY = wh / (P * 1.5);
    surfRestAmplitude = surfStepY * 0.35;

    const cardWidth = itemEls[0]?.offsetWidth || (isSmall ? 224 : 304);

    surfItems = itemEls.map((el, idx) => {
      const left = surfStepX * idx;
      const width = cardWidth;
      const end = left + width;
      const start = left - width - ww;
      const article = (siteData.articles || [])[idx] || {};

      el.onmouseenter = () => {
        surfHoveredIndex = idx;
        updateSurfInfo(article, idx);
      };
      el.onmouseleave = () => {
        if (surfHoveredIndex === idx) {
          surfHoveredIndex = -1;
          updateSurfInfo(null, -1);
        }
      };

      return {
        el,
        index: idx,
        slug: el.dataset.slug,
        article,
        left,
        width,
        start,
        end
      };
    });

    surfTotalWidth = Math.max(0, (surfStepX * (surfItems.length - 1)) + cardWidth);
  }

  function updateSurfInfo(article, idx) {
    if (!surfFloatingInfo) return;
    if (idx >= 0 && article) {
      const tag = article.tag || 'EDITORIAL';
      const month = article.month || 'MARCH';
      surfFloatingInfo.textContent = `(${idx + 1}) ${tag} / ${month}`;
    } else {
      surfFloatingInfo.textContent = '';
    }
  }

  function wrap(min, max, value) {
    const range = max - min;
    if (range <= 0) return min;
    return ((((value - min) % range) + range) % range) + min;
  }

  function updateSurfFrame() {
    if (!surfItems.length) return;
    const ww = window.innerWidth;
    const wh = window.innerHeight;

    // Smooth lerp:
    const diff = surfTargetScroll - surfCurrentScroll;
    surfVelocity = diff * 0.12;
    surfCurrentScroll += surfVelocity;
    surfWaveTime += 0.022;

    const absVel = Math.abs(surfVelocity);

    surfItems.forEach(item => {
      const minWrap = -(surfTotalWidth - item.end);
      const maxWrap = item.end;
      const n = wrap(minWrap, maxWrap, surfCurrentScroll);

      const inside = n > item.start && n < item.end;
      if (!inside) {
        item.el.style.visibility = 'hidden';
        return;
      }
      item.el.style.visibility = 'visible';

      const o = Math.max(0, Math.min(1, 1 + (n - item.left - item.width) / (ww + item.width)));
      const p = 1 - (1 - o);
      const x = p - 0.5;
      const wave = Math.sin(surfWaveTime + x * Math.PI * 2) * surfRestAmplitude * (1 + absVel * 0.015);
      const translateY = (wh * 0.45 * x) + wave;
      const translateX = item.left - n;
      const rotateY = -(15 * p) - 70;

      const zIndex = surfHoveredIndex === item.index ? 1000 : Math.round(p * 100) + 10;
      item.el.style.zIndex = zIndex;

      item.el.style.transform = `translate3d(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px, 0px) rotateY(${rotateY.toFixed(1)}deg)`;
    });
  }

  function surfAnimationLoop() {
    if (currentView !== 'surf') {
      surfAnimId = null;
      return;
    }
    updateSurfFrame();
    surfAnimId = requestAnimationFrame(surfAnimationLoop);
  }

  function startSurfAnimation() {
    if (surfAnimId) return;
    measureSurf();
    surfAnimId = requestAnimationFrame(surfAnimationLoop);
  }

  function stopSurfAnimation() {
    if (surfAnimId) {
      cancelAnimationFrame(surfAnimId);
      surfAnimId = null;
    }
  }

  function setupSurfEvents() {
    if (!surfContainer || surfListenersBound) return;
    surfListenersBound = true;

    const isSmall = () => window.innerWidth < 768;
    const dragMultiplier = () => (isSmall() ? 3.5 : 2.0);

    let isDown = false;
    let startX = 0;
    let startY = 0;
    let dragStartScroll = 0;
    let draggedDist = 0;
    let lastX = 0;
    let lastTime = 0;
    let dragVelocity = 0;

    // Mouse drag
    surfContainer.addEventListener('mousedown', (e) => {
      isDown = true;
      surfContainer.classList.add('is-dragging');
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      lastTime = Date.now();
      dragStartScroll = surfTargetScroll;
      draggedDist = 0;
      dragVelocity = 0;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const now = Date.now();
      const dt = now - lastTime || 16;
      const dx = e.clientX - lastX;
      dragVelocity = dx / dt;
      lastX = e.clientX;
      lastTime = now;

      const totalDx = e.clientX - startX;
      draggedDist += Math.abs(dx);
      surfTargetScroll = dragStartScroll - (totalDx * dragMultiplier());
      if (!surfAnimId) startSurfAnimation();
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      surfContainer.classList.remove('is-dragging');
      if (Math.abs(dragVelocity) > 0.15) {
        surfTargetScroll -= dragVelocity * 220;
      }
    });

    // Touch events
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartScroll = 0;
    let touchVelocity = 0;
    let lastTouchX = 0;
    let lastTouchTime = 0;
    let isTouchDragging = false;

    surfContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      lastTouchX = touchStartX;
      lastTouchTime = Date.now();
      touchStartScroll = surfTargetScroll;
      touchVelocity = 0;
      draggedDist = 0;
      isTouchDragging = true;
    }, { passive: true });

    surfContainer.addEventListener('touchmove', (e) => {
      if (!isTouchDragging || e.touches.length !== 1) return;
      const now = Date.now();
      const dt = now - lastTouchTime || 16;
      const cx = e.touches[0].clientX;
      const cy = e.touches[0].clientY;
      const dx = cx - lastTouchX;
      touchVelocity = dx / dt;
      lastTouchX = cx;
      lastTouchTime = now;

      const totalDx = cx - touchStartX;
      const totalDy = cy - touchStartY;

      if (Math.abs(totalDx) > Math.abs(totalDy) && e.cancelable) {
        e.preventDefault();
      }

      draggedDist += Math.abs(dx);
      surfTargetScroll = touchStartScroll - (totalDx * dragMultiplier());
      if (!surfAnimId) startSurfAnimation();
    }, { passive: false });

    surfContainer.addEventListener('touchend', () => {
      if (!isTouchDragging) return;
      isTouchDragging = false;
      if (Math.abs(touchVelocity) > 0.15) {
        surfTargetScroll -= touchVelocity * 220;
      }
    });

    // Wheel scrolling
    surfContainer.addEventListener('wheel', (e) => {
      if (currentView !== 'surf') return;
      if (activeArticleSlug) return;

      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      surfTargetScroll += delta * 1.5;
      if (!surfAnimId) startSurfAnimation();
    }, { passive: false });

    // Keyboard ArrowLeft / ArrowRight
    window.addEventListener('keydown', (e) => {
      if (currentView !== 'surf' || activeArticleSlug) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        surfTargetScroll += surfStepX * 4;
        if (!surfAnimId) startSurfAnimation();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        surfTargetScroll -= surfStepX * 4;
        if (!surfAnimId) startSurfAnimation();
      }
    });

    // Card click
    surfContainer.addEventListener('click', (e) => {
      if (draggedDist > 10) return;
      const card = e.target.closest('.surf-carousel-item');
      if (card && card.dataset.slug) {
        openArticleDrawer(card.dataset.slug);
      }
    });

    // Window resize
    window.addEventListener('resize', () => {
      if (currentView === 'surf') {
        measureSurf();
        updateSurfFrame();
      }
    });
  }

  /* --------------------------------------------------------------------------
     7. Index View Controller (Grouped by Month with Quick Jump)
     -------------------------------------------------------------------------- */
  function renderIndex() {
    if (!indexGrid) return;
    const rawArticles = siteData.articles || [];

    const groups = {};
    const groupOrder = [];

    // Sort newest year and month first
    const sorted = rawArticles.slice().sort((a, b) => getArticleDateInfo(b).sortVal - getArticleDateInfo(a).sortVal);

    sorted.forEach(a => {
      const info = getArticleDateInfo(a);
      if (!groups[info.groupKey]) {
        groups[info.groupKey] = { info, list: [] };
        groupOrder.push(info.groupKey);
      }
      groups[info.groupKey].list.push(a);
    });

    let html = `
      <div class="index-month-nav" id="index-month-nav">
        ${groupOrder.map(k => `
          <button type="button" class="index-month-nav-btn" data-target="index-group-${escapeHtml(k.replace(/\s+/g, '-').replace(/'/g, ''))}">
            ${escapeHtml(k)} (${groups[k].list.length})
          </button>
        `).join('')}
      </div>
    `;

    groupOrder.forEach(k => {
      const { info, list } = groups[k];
      const sectionId = `index-group-${escapeHtml(k.replace(/\s+/g, '-').replace(/'/g, ''))}`;
      html += `
        <div class="index-month-section" id="${sectionId}">
          <div class="index-month-header">
            <span>${escapeHtml(info.monthName)} '${info.shortYear}</span>
            <span>(${list.length} ITEMS)</span>
          </div>
          <div class="index-cards-row">
            ${list.map(a => `
              <div class="index-card" data-slug="${escapeHtml(a.slug)}">
                <img src="${a.cover}" alt="${escapeHtml(a.title)}" class="index-card__thumb" loading="lazy" />
                <h4 class="index-card__title">${escapeHtml(a.title)}</h4>
                <span class="index-card__meta">${escapeHtml(a.tag || 'INSPIRE')}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    indexGrid.innerHTML = html;

    // Month nav click jump
    indexGrid.querySelectorAll('.index-month-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const targetElem = document.getElementById(targetId);
        if (targetElem) {
          targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
          playClick();
        }
      });
    });

    indexGrid.querySelectorAll('.index-card').forEach(card => {
      card.addEventListener('click', () => {
        const slug = card.dataset.slug;
        openArticleDrawer(slug);
      });
    });
  }

  /* --------------------------------------------------------------------------
     8. About View Controller (Dark Cinematic Atmosphere, Virtual Scroll, & 3D Trajectory)
     -------------------------------------------------------------------------- */
  let aboutTargetY = 0;
  let aboutCurrentY = 0;
  let aboutAnimId = null;
  let aboutListenersBound = false;
  const soundGil = new Audio('./assets/audio/sound-gil.mp3');
  const soundJesper = new Audio('./assets/audio/sound-jesper.mp3');

  function renderAbout() {
    const about = siteData.about || {};
    const badgeLeft = document.getElementById('about-badge-left');
    const badgeRight = document.getElementById('about-badge-right');
    const title = document.getElementById('about-title');
    const manifesto1 = document.getElementById('about-manifesto-1');
    const manifesto2 = document.getElementById('about-manifesto-2');
    const pillarsContainer = document.getElementById('about-pillars');
    const copyright = document.getElementById('about-copyright');

    if (badgeLeft) badgeLeft.textContent = about.badgeLeft || '(TLB)';
    if (badgeRight) badgeRight.textContent = about.badgeRight || '(24-26)';
    if (title) {
      title.innerHTML = `"The Lookback"<br />(TLB/2026)<br />Your living<br />archive of<br />Better Off®`;
    }
    if (manifesto1) manifesto1.textContent = about.manifesto1 || '';
    if (manifesto2) manifesto2.textContent = about.manifesto2 || '';
    if (copyright) copyright.textContent = about.copyright || '©Better Off®/2026';

    const pillars = about.pillars || [
      {
        num: '(1)',
        title: 'OUR HIGHLIGHTS',
        text: 'THE WINS, THE WORK, THE MOMENTS THAT DEFINED THE YEAR—SIGNATURE PROJECTS, RECOGNITIONS, AND MILESTONES TO SHOWCASE WHAT PUSHES US FORWARD.'
      },
      {
        num: '(2)',
        title: 'WHAT INSPIRED US',
        text: 'THE INSPIRATIONAL CURRENTS, PRODUCT DROPS, COLLABORATIONS, AND SOUNDS THAT KEPT OUR THINKING SHARP AND OUR KEYBOARDS HUMMING.'
      },
      {
        num: '(3)',
        title: 'LOOKING FORWARD',
        text: 'WHAT\'S NEXT. THE IDEAS IN MOTION, THE VISION IN DEVELOPMENT, AND THE DIRECTION WE\'RE STEPPING TOWARD—ON PURPOSE.'
      }
    ];

    if (pillarsContainer) {
      pillarsContainer.innerHTML = pillars.map(p => `
        <li class="about-pillar-item">
          <div class="about-pillar-num">${escapeHtml(p.num)}</div>
          <div class="about-pillar-body">
            <h3 class="about-pillar-title">${escapeHtml(p.title)}</h3>
            <p class="about-pillar-desc">${escapeHtml(p.text)}</p>
          </div>
        </li>
      `).join('');
    }

    setupAboutPopovers();
    setupAboutScroll();
  }

  function setupAboutPopovers() {
    // Credits popover
    const btnCredits = document.getElementById('btn-site-credits');
    const popoverCredits = document.getElementById('credits-popover');
    const creditGil = document.getElementById('credit-gil');
    const creditJesper = document.getElementById('credit-jesper');

    if (btnCredits && popoverCredits) {
      btnCredits.onclick = (e) => {
        e.stopPropagation();
        popoverCredits.classList.toggle('is-hidden');
      };

      if (creditGil) {
        creditGil.onmouseenter = () => {
          if (isSoundEnabled) {
            soundGil.currentTime = 0;
            soundGil.play().catch(() => {});
          }
        };
      }

      if (creditJesper) {
        creditJesper.onmouseenter = () => {
          if (isSoundEnabled) {
            soundJesper.currentTime = 0;
            soundJesper.play().catch(() => {});
          }
        };
      }
    }

    // Contact popover & copy email
    const btnContact = document.getElementById('btn-contact-us');
    const popoverContact = document.getElementById('contact-popover');
    const btnCopyEmail = document.getElementById('btn-copy-email');

    if (btnContact && popoverContact) {
      btnContact.onclick = (e) => {
        e.stopPropagation();
        popoverContact.classList.toggle('is-hidden');
      };
    }

    if (btnCopyEmail) {
      btnCopyEmail.onclick = async (e) => {
        e.stopPropagation();
        const email = siteData.about?.contactEmail || 'info@betteroff.studio';
        try {
          await navigator.clipboard.writeText(email);
          btnCopyEmail.textContent = 'Copied!';
          setTimeout(() => {
            btnCopyEmail.textContent = 'Copy email';
            if (popoverContact) popoverContact.classList.add('is-hidden');
          }, 2000);
        } catch {
          btnCopyEmail.textContent = email;
        }
      };
    }

    // Close popovers on click outside
    window.addEventListener('click', () => {
      if (popoverCredits) popoverCredits.classList.add('is-hidden');
      if (popoverContact) popoverContact.classList.add('is-hidden');
    });
  }

  function setupAboutScroll() {
    if (aboutListenersBound) return;
    aboutListenersBound = true;

    const scroller = document.getElementById('about-scroller');
    if (!scroller) return;

    // Wheel scrolling
    window.addEventListener('wheel', (e) => {
      if (currentView !== 'about') return;
      if (activeArticleSlug) return;
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      aboutTargetY += delta * 1.3;
      clampAboutTarget();
      startAboutAnimation();
    }, { passive: false });

    // Touch events
    let touchStartY = 0;
    let touchStartScroll = 0;
    let touchVelocity = 0;
    let lastTouchY = 0;
    let lastTouchTime = 0;
    let isTouchDragging = false;

    scroller.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      touchStartY = e.touches[0].clientY;
      lastTouchY = touchStartY;
      lastTouchTime = Date.now();
      touchStartScroll = aboutTargetY;
      touchVelocity = 0;
      isTouchDragging = true;
    }, { passive: true });

    scroller.addEventListener('touchmove', (e) => {
      if (!isTouchDragging || e.touches.length !== 1) return;
      const now = Date.now();
      const dt = now - lastTouchTime || 16;
      const cy = e.touches[0].clientY;
      const dy = cy - lastTouchY;
      touchVelocity = dy / dt;
      lastTouchY = cy;
      lastTouchTime = now;

      const totalDy = cy - touchStartY;
      aboutTargetY = touchStartScroll - (totalDy * 1.8);
      clampAboutTarget();
      startAboutAnimation();
    }, { passive: true });

    scroller.addEventListener('touchend', () => {
      if (!isTouchDragging) return;
      isTouchDragging = false;
      if (Math.abs(touchVelocity) > 0.15) {
        aboutTargetY -= touchVelocity * 200;
        clampAboutTarget();
        startAboutAnimation();
      }
    });
  }

  function clampAboutTarget() {
    const scroller = document.getElementById('about-scroller');
    const content = document.getElementById('about-content');
    if (!scroller || !content) return;
    const maxScroll = Math.max(0, content.offsetHeight - window.innerHeight);
    aboutTargetY = Math.max(0, Math.min(maxScroll, aboutTargetY));
  }

  function startAboutAnimation() {
    if (aboutAnimId) return;

    function step() {
      if (currentView !== 'about') {
        aboutAnimId = null;
        return;
      }

      const diff = aboutTargetY - aboutCurrentY;
      aboutCurrentY += diff * 0.12;

      const scroller = document.getElementById('about-scroller');
      const content = document.getElementById('about-content');
      const globeMedia = document.getElementById('about-globe-media');

      if (scroller) {
        scroller.scrollTop = aboutCurrentY;
      }

      // Compute globe trajectory
      if (globeMedia && content) {
        const maxScroll = Math.max(1, content.offsetHeight - window.innerHeight);
        const progress = Math.max(0, Math.min(1, aboutCurrentY / maxScroll));
        const ww = window.innerWidth;
        const wh = window.innerHeight;

        if (ww >= 900) {
          let x = 0;
          let y = 0;
          let scale = 1.0;

          if (progress <= 0.12) {
            // Hero center
            x = 0;
            y = 0;
            scale = 1.0;
          } else if (progress <= 0.42) {
            // Move smoothly to bottom-left (next to highlights)
            const t = (progress - 0.12) / 0.30;
            const ease = Math.sin(t * Math.PI / 2);
            x = - (ww * 0.28 * ease);
            y = (wh * 0.22 * ease);
            scale = 1.0 - (0.45 * ease);
          } else if (progress <= 0.72) {
            // Move across to bottom-right/center (under looking forward)
            const t = (progress - 0.42) / 0.30;
            const ease = Math.sin(t * Math.PI / 2);
            const startX = - (ww * 0.28);
            const targetX = (ww * 0.08);
            x = startX + (targetX - startX) * ease;
            y = (wh * 0.22) + (wh * 0.04 * ease);
            scale = 0.55 - (0.05 * ease);
          } else {
            // Return towards center for thanks block
            const t = (progress - 0.72) / 0.28;
            const ease = Math.sin(t * Math.PI / 2);
            const startX = (ww * 0.08);
            x = startX * (1 - ease);
            y = (wh * 0.26) * (1 - ease);
            scale = 0.50 + (0.35 * ease);
          }

          globeMedia.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0px) scale(${scale.toFixed(3)})`;
        } else {
          globeMedia.style.transform = '';
        }
      }

      if (Math.abs(diff) > 0.5) {
        aboutAnimId = requestAnimationFrame(step);
      } else {
        aboutCurrentY = aboutTargetY;
        if (scroller) scroller.scrollTop = aboutCurrentY;
        aboutAnimId = null;
      }
    }

    aboutAnimId = requestAnimationFrame(step);
  }

  function stopAboutAnimation() {
    if (aboutAnimId) {
      cancelAnimationFrame(aboutAnimId);
      aboutAnimId = null;
    }
  }

  /* --------------------------------------------------------------------------
     9. Article Detail Drawer Controller
     -------------------------------------------------------------------------- */
  function openArticleDrawer(slug) {
    if (!slug) return;
    const article = (siteData.articles || []).find(a => a.slug === slug);
    if (!article) return;

    activeArticleSlug = slug;
    window.location.hash = `articles/${slug}`;

    if (drawerTitle) drawerTitle.textContent = article.title;
    if (drawerBadgeTag) drawerBadgeTag.textContent = article.tag || 'INSPIRE';
    if (drawerBadgeMonth) drawerBadgeMonth.textContent = `( ${article.month || 'MARCH'} )`;

    if (drawerSourceLink) {
      if (article.url) {
        drawerSourceLink.href = article.url;
        drawerSourceLink.style.display = 'inline-flex';
      } else {
        drawerSourceLink.style.display = 'none';
      }
    }

    if (drawerMedia) {
      drawerMedia.innerHTML = `
        <img src="${article.cover}" alt="${escapeHtml(article.title)}" />
      `;
    }

    if (drawerBody) {
      let contentHtml = article.content || `<p>${escapeHtml(article.excerpt || '')}</p>`;
      // Check for video embed (YouTube or Vimeo)
      if (article.url && article.url.includes('youtube.com/watch?v=')) {
        const vidId = article.url.split('v=')[1]?.split('&')[0];
        if (vidId) {
          contentHtml += `
            <div class="article-drawer__embed">
              <iframe src="https://www.youtube.com/embed/${vidId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
          `;
        }
      }
      drawerBody.innerHTML = sanitizeHtml(contentHtml);
    }

    if (articleDrawer) {
      articleDrawer.classList.add('is-open');
      articleDrawer.setAttribute('aria-hidden', 'false');
    }
  }

  function closeArticleDrawer() {
    activeArticleSlug = null;
    if (articleDrawer) {
      articleDrawer.classList.remove('is-open');
      articleDrawer.setAttribute('aria-hidden', 'true');
    }
    if (window.location.hash.startsWith('#articles/')) {
      window.location.hash = `#${currentView}`;
    }
  }

  if (drawerBtnClose) drawerBtnClose.addEventListener('click', closeArticleDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeArticleDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && articleDrawer?.classList.contains('is-open')) {
      closeArticleDrawer();
    }
  });

  /* --------------------------------------------------------------------------
     10. Utility Functions
     -------------------------------------------------------------------------- */
  function escapeHtml(str) {
    if (window.TLBStore && typeof window.TLBStore.escapeHtml === 'function') {
      return window.TLBStore.escapeHtml(str);
    }
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  function sanitizeHtml(dirty) {
    if (typeof dirty !== 'string') return '';
    let clean = dirty
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^>]*>/gi, '')
      .replace(/on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
      .replace(/javascript:/gi, '');

    clean = clean.replace(/<iframe\b([^>]*)>/gi, (match, attrs) => {
      if (/src=["']https:\/\/(www\.youtube\.com|player\.vimeo\.com)\//i.test(attrs)) {
        return `<iframe ${attrs}>`;
      }
      return '';
    });
    return clean;
  }

  /* --------------------------------------------------------------------------
     11. Real-Time Store Subscription & Initialization
     -------------------------------------------------------------------------- */
  function fullRender() {
    renderTimeline();
    renderSurf();
    renderIndex();
    renderAbout();
    initAudioPlayer();
  }

  // Subscribe to live changes from Admin CMS
  if (window.TLBStore) {
    window.TLBStore.subscribe((newData) => {
      console.log('[App] Received live data update from CMS Studio');
      siteData = newData;
      fullRender();
      if (activeArticleSlug) {
        openArticleDrawer(activeArticleSlug);
      }
    });
  }

  // Mobile nav buttons bind
  if (mobileNav) {
    mobileNav.querySelectorAll('.mobile-nav__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        window.location.hash = `#${view}`;
      });
    });
  }

  // Hash route bind
  window.addEventListener('hashchange', handleHashChange);

  // Initialize
  initSoundGate();
  fullRender();
  handleHashChange();

})();
