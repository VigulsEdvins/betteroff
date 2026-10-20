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
  function renderTimeline() {
    if (!timelineTrack) return;
    const articles = siteData.articles || [];

    timelineTrack.innerHTML = articles.map((article, idx) => `
      <article class="timeline-card" data-slug="${escapeHtml(article.slug)}" data-index="${idx}">
        <span class="timeline-card__badge-top">${article.index || (idx + 1)}</span>
        <div class="timeline-card__media">
          <img src="${article.cover}" alt="${escapeHtml(article.title)}" class="timeline-card__img" loading="lazy" />
        </div>
        <span class="timeline-card__badge-bottom">${escapeHtml(article.tag || 'INSPIRE')} (${escapeHtml(article.month || '')})</span>
      </article>
    `).join('');

    renderTimelineRuler();
    setupTimelineDrag();
  }

  function renderTimelineRuler() {
    if (!rulerTicks || !rulerMonths) return;

    // Render 60 ticks
    let ticksHtml = '';
    for (let i = 0; i < 60; i++) {
      const isMajor = i % 5 === 0;
      ticksHtml += `<div class="ruler-tick ${isMajor ? 'ruler-tick--major' : ''}"></div>`;
    }
    rulerTicks.innerHTML = ticksHtml;

    // Render month markers
    const months = ['MARCH', 'FEBRUARY', 'JANUARY', 'DECEMBER', 'NOVEMBER', 'OCTOBER', 'SEPTEMBER', 'AUGUST', 'JULY', 'JUNE', 'MAY', 'APRIL'];
    rulerMonths.innerHTML = months.map(m => `<span>${m}</span>`).join('');
  }

  function setupTimelineDrag() {
    if (!timelineViewport) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let draggedDist = 0;

    timelineViewport.addEventListener('mousedown', (e) => {
      isDown = true;
      timelineViewport.classList.add('is-dragging');
      startX = e.pageX - timelineViewport.offsetLeft;
      scrollLeft = timelineViewport.scrollLeft;
      draggedDist = 0;
    });

    timelineViewport.addEventListener('mouseleave', () => {
      isDown = false;
      timelineViewport.classList.remove('is-dragging');
    });

    timelineViewport.addEventListener('mouseup', () => {
      isDown = false;
      timelineViewport.classList.remove('is-dragging');
    });

    timelineViewport.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - timelineViewport.offsetLeft;
      const walk = (x - startX) * 1.5;
      draggedDist += Math.abs(walk);
      timelineViewport.scrollLeft = scrollLeft - walk;
    });

    // Click handler on card
    timelineViewport.addEventListener('click', (e) => {
      const card = e.target.closest('.timeline-card');
      if (card && draggedDist < 10) {
        const slug = card.dataset.slug;
        openArticleDrawer(slug);
      }
    });

    // Touch support for timeline
    let touchStartX = 0;
    timelineViewport.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].pageX;
      draggedDist = 0;
    }, { passive: true });

    timelineViewport.addEventListener('touchmove', (e) => {
      const touchX = e.touches[0].pageX;
      draggedDist += Math.abs(touchX - touchStartX);
    }, { passive: true });

    timelineViewport.addEventListener('touchend', (e) => {
      if (draggedDist < 10) {
        const card = e.target.closest('.timeline-card');
        if (card) {
          const slug = card.dataset.slug;
          openArticleDrawer(slug);
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     6. Surf 3D View Controller
     -------------------------------------------------------------------------- */
  function renderSurf() {
    if (!surfRibbon) return;
    const articles = (siteData.articles || []).slice(0, 36);

    surfRibbon.innerHTML = articles.map((article, idx) => `
      <div class="surf-card" data-slug="${escapeHtml(article.slug)}" data-index="${idx}">
        <img src="${article.cover}" alt="${escapeHtml(article.title)}" loading="lazy" />
      </div>
    `).join('');

    setupSurfDrag();
  }

  function setupSurfDrag() {
    if (!surfContainer) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let draggedDist = 0;

    surfContainer.addEventListener('mousedown', (e) => {
      isDown = true;
      surfContainer.classList.add('is-dragging');
      startX = e.pageX - surfContainer.offsetLeft;
      scrollLeft = surfContainer.scrollLeft;
      draggedDist = 0;
    });

    surfContainer.addEventListener('mouseleave', () => {
      isDown = false;
      surfContainer.classList.remove('is-dragging');
    });

    surfContainer.addEventListener('mouseup', () => {
      isDown = false;
      surfContainer.classList.remove('is-dragging');
    });

    surfContainer.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - surfContainer.offsetLeft;
      const walk = (x - startX) * 1.8;
      draggedDist += Math.abs(walk);
      surfContainer.scrollLeft = scrollLeft - walk;
    });

    surfContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.surf-card');
      if (card && draggedDist < 10) {
        const slug = card.dataset.slug;
        openArticleDrawer(slug);
      }
    });
  }

  /* --------------------------------------------------------------------------
     7. Index View Controller (Grouped by Month)
     -------------------------------------------------------------------------- */
  function renderIndex() {
    if (!indexGrid) return;
    const articles = siteData.articles || [];

    // Group articles by month in chronological order
    const monthsOrder = ['MARCH', 'FEBRUARY', 'JANUARY', 'DECEMBER', 'NOVEMBER', 'OCTOBER', 'SEPTEMBER', 'AUGUST', 'JULY', 'JUNE', 'MAY', 'APRIL'];
    const groups = {};
    monthsOrder.forEach(m => groups[m] = []);

    articles.forEach(a => {
      const m = a.month || 'MARCH';
      if (!groups[m]) groups[m] = [];
      groups[m].push(a);
    });

    let html = '';
    monthsOrder.forEach(m => {
      const list = groups[m] || [];
      if (!list.length) return;

      html += `
        <div class="index-month-section">
          <div class="index-month-header">
            <span>${m}</span>
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

    indexGrid.querySelectorAll('.index-card').forEach(card => {
      card.addEventListener('click', () => {
        const slug = card.dataset.slug;
        openArticleDrawer(slug);
      });
    });
  }

  /* --------------------------------------------------------------------------
     8. About View Controller
     -------------------------------------------------------------------------- */
  function renderAbout() {
    const about = siteData.about || {};
    const badgeLeft = document.getElementById('about-badge-left');
    const badgeRight = document.getElementById('about-badge-right');
    const title = document.getElementById('about-title');
    const yearLabel = document.getElementById('about-year-label');
    const heroHeading = document.getElementById('about-hero-heading');
    const manifesto1 = document.getElementById('about-manifesto-1');
    const manifesto2 = document.getElementById('about-manifesto-2');
    const pillarsContainer = document.getElementById('about-pillars');
    const thanksHeading = document.getElementById('about-thanks-heading');
    const tagline = document.getElementById('about-tagline');
    const copyright = document.getElementById('about-copyright');
    const contactLink = document.getElementById('about-contact-link');

    if (badgeLeft) badgeLeft.textContent = about.badgeLeft || '( TLB )';
    if (badgeRight) badgeRight.textContent = about.badgeRight || '( 24-26 )';
    if (title) title.textContent = about.title || '"THE LOOKBACK"';
    if (yearLabel) yearLabel.textContent = about.yearLabel || '(TLB/2026)';
    if (heroHeading) heroHeading.textContent = about.heroHeading || 'YOUR LIVING ARCHIVE OF BETTER OFF®';
    if (manifesto1) manifesto1.textContent = about.manifesto1 || '';
    if (manifesto2) manifesto2.textContent = about.manifesto2 || '';
    if (thanksHeading) thanksHeading.innerHTML = (about.thanksHeading || '').replace(/\\n/g, '<br />');
    if (tagline) tagline.textContent = about.tagline || 'STAY MOVING. STAY BETTER OFF®.';
    if (copyright) copyright.textContent = about.copyright || '©Better Off®/2026';
    if (contactLink && about.contactEmail) {
      contactLink.href = `mailto:${about.contactEmail}`;
    }

    if (pillarsContainer && about.pillars) {
      pillarsContainer.innerHTML = about.pillars.map(p => `
        <div class="pillar-item">
          <span class="pillar-num">${escapeHtml(p.num)}</span>
          <h4 class="pillar-title">${escapeHtml(p.title)}</h4>
          <p class="pillar-text">${escapeHtml(p.text)}</p>
        </div>
      `).join('');
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
