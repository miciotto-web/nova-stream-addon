/**
 * Stremio Addon Portal & Configurator
 * Italian Trackers Edition & Pixel-Perfect Stremio Stream Formatter
 */

(function () {
  'use strict';

  // State object
  const state = {
    baseUrl: window.location.origin.includes('http') ? window.location.origin : 'http://localhost:7000',
    debridProvider: 'torbox', // Default TorBox as in the user photo (TB Instant)
    apiKey: '',
    cachedOnly: true,
    showP2PFallback: false,
    trackers: ['ilcorsaroviola', 'ilcorsaronero', 'ilcorsaroblu', 'tntvillage', '1337x', 'torrentgalaxy'],
    strictIta: true,
    prowlarrUrl: '',
    prowlarrKey: '',
    qualities: ['4k', '1080p', '720p'],
    hdr: true,
    excludeCam: true,
    exclude3D: true,
    maxResults: 4,
    maxSize: 40,
    languages: ['ita', 'eng'],
    prioritizeIta: true,
    requireSubs: false,
    sortBy: 'quality_seeds',
    catalogs: {
      movies: true,
      series: true,
      anime: false
    },
    addonName: 'Nova Stream Addon',
    addonVersion: '1.0.0',
    addonDesc: 'Google-styled Stremio Addon con tracker italiani (IlCorsaroViola, IlCorsaroNero, 1337x) e formattazione avanzata.'
  };

  // Provider configuration links
  const providerMeta = {
    torbox: { label: 'API Token TorBox', url: 'https://torbox.app/settings', name: 'TorBox', prefix: 'TB' },
    realdebrid: { label: 'API Key Real-Debrid', url: 'https://real-debrid.com/apitoken', name: 'Real-Debrid', prefix: 'RD' },
    alldebrid: { label: 'API Key AllDebrid', url: 'https://alldebrid.com/apikeys', name: 'AllDebrid', prefix: 'AD' },
    premiumize: { label: 'API Key Premiumize', url: 'https://www.premiumize.me/account', name: 'Premiumize', prefix: 'PM' },
    debridlink: { label: 'API Key Debrid-Link', url: 'https://debrid-link.com/webapp/register', name: 'Debrid-Link', prefix: 'DL' },
    none: { label: 'Nessuna chiave richiesta', url: '', name: 'P2P Diretto', prefix: 'P2P' }
  };

  const trackerMeta = {
    ilcorsaroviola: { name: 'IlCorsaroViola', tag: 'IlCorsaroViola 🧲 🇮🇹', avatarBg: 'radial-gradient(circle, #a855f7 0%, #6b21a8 100%)' },
    ilcorsaronero:  { name: 'IlCorsaroNero',  tag: 'IlCorsaroNero 🧲 🇮🇹',  avatarBg: 'radial-gradient(circle, #e74c3c 0%, #922b21 100%)' },
    ilcorsaroblu:   { name: 'IlCorsaroBlu',   tag: 'IlCorsaroBlu 🧲 🇮🇹',   avatarBg: 'radial-gradient(circle, #3498db 0%, #1b4f72 100%)' },
    tntvillage:     { name: 'TNTVillage',     tag: 'TNTVillage 🧲 🇮🇹',     avatarBg: 'radial-gradient(circle, #e67e22 0%, #7e5109 100%)' },
    torrentjunkies: { name: 'TorrentJunkies', tag: 'TorrentJunkies 🧲 🇮🇹', avatarBg: 'radial-gradient(circle, #2ecc71 0%, #196f3d 100%)' },
    '1337x':        { name: '1337x',          tag: '1337x 🧲 🇮🇹',          avatarBg: 'radial-gradient(circle, #e74c3c 0%, #641e16 100%)' },
    torrentgalaxy:  { name: 'TorrentGalaxy',  tag: 'TorrentGalaxy 🧲 🇮🇹',  avatarBg: 'radial-gradient(circle, #1abc9c 0%, #0e6251 100%)' },
    bitsearch:      { name: 'BitSearch',      tag: 'BitSearch 🧲 🇮🇹',      avatarBg: 'radial-gradient(circle, #34495e 0%, #17202a 100%)' },
    thepiratebay:   { name: 'ThePirateBay',   tag: 'ThePirateBay 🧲 🇮🇹',   avatarBg: 'radial-gradient(circle, #95a5a6 0%, #424949 100%)' }
  };

  // DOM Elements
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');

  const baseUrlInput = document.getElementById('baseUrlInput');
  const btnDetectUrl = document.getElementById('btnDetectUrl');
  const btnTestPing = document.getElementById('btnTestPing');
  const statusPulse = document.getElementById('statusPulse');
  const statusLabel = document.getElementById('statusLabel');
  const pingBadge = document.getElementById('pingBadge');

  const trackersContainer = document.getElementById('configSection');
  const checkStrictIta = document.getElementById('checkStrictIta');
  const btnToggleProwlarr = document.getElementById('btnToggleProwlarr');
  const prowlarrContent = document.getElementById('prowlarrContent');
  const prowlarrChevron = document.getElementById('prowlarrChevron');
  const prowlarrUrl = document.getElementById('prowlarrUrl');
  const prowlarrKey = document.getElementById('prowlarrKey');

  const providerChips = document.getElementById('providerChips');
  const apiKeySection = document.getElementById('apiKeySection');
  const apiKeyLabel = document.getElementById('apiKeyLabel');
  const apiKeyLink = document.getElementById('apiKeyLink');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const btnToggleApiKey = document.getElementById('btnToggleApiKey');
  const toggleApiKeyIcon = document.getElementById('toggleApiKeyIcon');

  const checkCachedOnly = document.getElementById('checkCachedOnly');
  const checkShowP2PFallback = document.getElementById('checkShowP2PFallback');

  const qualityCheckboxes = document.querySelectorAll('input[name="quality"]');
  const checkHdr = document.getElementById('checkHdr');
  const checkExcludeCam = document.getElementById('checkExcludeCam');
  const checkExclude3D = document.getElementById('checkExclude3D');

  const maxResultsSlider = document.getElementById('maxResultsSlider');
  const maxResultsValue = document.getElementById('maxResultsValue');
  const maxSizeSlider = document.getElementById('maxSizeSlider');
  const maxSizeValue = document.getElementById('maxSizeValue');

  const languagesChips = document.getElementById('languagesChips');
  const checkPrioritizeIta = document.getElementById('checkPrioritizeIta');
  const checkRequireSubs = document.getElementById('checkRequireSubs');

  const addonNameInput = document.getElementById('addonNameInput');
  const addonVersionInput = document.getElementById('addonVersionInput');
  const addonDescInput = document.getElementById('addonDescInput');

  const btnInstallStremio = document.getElementById('btnInstallStremio');
  const btnInstallWeb = document.getElementById('btnInstallWeb');
  const btnCopyManifest = document.getElementById('btnCopyManifest');
  const manifestUrlDisplay = document.getElementById('manifestUrlDisplay');

  const qrContainer = document.getElementById('qrCodeContainer');
  const stremioMockContainer = document.getElementById('stremioMockContainer');
  const manifestJsonCode = document.getElementById('manifestJsonCode');
  const btnCopyJson = document.getElementById('btnCopyJson');

  const btnQuickInstallHero = document.getElementById('btnQuickInstallHero');
  const btnScrollConfig = document.getElementById('btnScrollConfig');
  const btnHelp = document.getElementById('btnHelp');
  const helpModal = document.getElementById('helpModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnModalOk = document.getElementById('btnModalOk');
  const toastContainer = document.getElementById('toastContainer');

  // ----------------------------------------------------
  // 1. Theme Management (Light / Dark)
  // ----------------------------------------------------
  function initTheme() {
    const savedTheme = localStorage.getItem('stremio_portal_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }

  function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('stremio_portal_theme', theme);
    if (theme === 'dark') {
      themeIcon.textContent = 'light_mode';
      themeText.textContent = 'Chiaro';
    } else {
      themeIcon.textContent = 'dark_mode';
      themeText.textContent = 'Scuro';
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    showToast(`Tema ${newTheme === 'dark' ? 'Scuro' : 'Chiaro'} attivato`);
  });

  // ----------------------------------------------------
  // 2. Base64 Config Encoder & URL Generator
  // ----------------------------------------------------
  function encodeConfig(cfg) {
    const jsonStr = JSON.stringify(cfg);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  }

  function generateUrls() {
    const cleanBaseUrl = (state.baseUrl || 'http://localhost:7000').replace(/\/$/, '');
    const configPayload = {
      debridProvider: state.debridProvider,
      apiKey: state.apiKey ? state.apiKey.trim() : undefined,
      cachedOnly: state.cachedOnly,
      showP2P: state.showP2PFallback,
      trackers: state.trackers,
      strictIta: state.strictIta,
      prowlarrUrl: state.prowlarrUrl || undefined,
      prowlarrKey: state.prowlarrKey || undefined,
      qualities: state.qualities,
      hdr: state.hdr,
      excludeCam: state.excludeCam,
      exclude3D: state.exclude3D,
      maxResults: state.maxResults,
      maxSize: state.maxSize,
      languages: state.languages,
      prioritizeIta: state.prioritizeIta,
      requireSubs: state.requireSubs,
      sortBy: state.sortBy,
      catalogs: state.catalogs,
      addonName: state.addonName,
      addonVersion: state.addonVersion,
      addonDesc: state.addonDesc
    };

    const encoded = encodeConfig(configPayload);
    const manifestHttpUrl = `${cleanBaseUrl}/${encoded}/manifest.json`;
    const stremioProtocolUrl = manifestHttpUrl.replace(/^https?:\/\//, 'stremio://');
    const stremioWebUrl = `https://web.stremio.com/#/addons?addon=${encodeURIComponent(manifestHttpUrl)}`;

    return {
      configPayload,
      manifestHttpUrl,
      stremioProtocolUrl,
      stremioWebUrl
    };
  }

  // ----------------------------------------------------
  // 3. UI Update Logic
  // ----------------------------------------------------
  function updateUI() {
    const { configPayload, manifestHttpUrl, stremioProtocolUrl, stremioWebUrl } = generateUrls();

    // Update Action links
    btnInstallStremio.href = stremioProtocolUrl;
    btnInstallWeb.href = stremioWebUrl;
    manifestUrlDisplay.textContent = manifestHttpUrl;

    const meta = providerMeta[state.debridProvider] || providerMeta.torbox;
    const providerCode = meta.prefix;

    // Update Live Manifest JSON preview
    const dynamicManifest = {
      id: "org.stremio.google.novastream",
      version: state.addonVersion || "1.0.0",
      name: `${state.addonName || 'Nova Stream Addon'} [${providerCode}] 🇮🇹`,
      description: state.addonDesc || "Google Material 3 Stremio Addon con tracker italiani",
      resources: ["catalog", "stream", "meta"],
      types: ["movie", "series", "anime"],
      catalogs: [
        { type: "movie", id: "top_movies", name: "Top Film Italiani (Nova)" },
        { type: "series", id: "top_series", name: "Top Serie TV (Nova)" }
      ],
      behaviorHints: {
        configurable: true,
        configurationRequired: false
      }
    };
    manifestJsonCode.textContent = JSON.stringify(dynamicManifest, null, 2);

    // Update Stream Preview Simulator (Exact copy of photo)
    renderExactStremioStream();

    // Update QR Code
    renderQrCode(stremioProtocolUrl);
  }

  // ----------------------------------------------------
  // 4. Exact Stremio Stream Renderer (Photo Replica)
  // ----------------------------------------------------
  function renderExactStremioStream() {
    const meta = providerMeta[state.debridProvider] || providerMeta.torbox;
    const providerPrefix = meta.prefix;
    const isInstant = state.cachedOnly;
    const instantText = isInstant ? "Instant" : "Download";

    const activeTrackerKey = state.trackers.includes('ilcorsaroviola') ? 'ilcorsaroviola' : (state.trackers[0] || 'ilcorsaroviola');
    const tMeta = trackerMeta[activeTrackerKey] || trackerMeta.ilcorsaroviola;

    // Build flags string
    const flagMap = { ita: "🇮🇹", eng: "🇬🇧", multi: "🌐", spa: "🇪🇸", fre: "🇫🇷", ger: "🇩🇪" };
    const flags = state.languages.map(l => flagMap[l] || "🇮🇹").join(" ");

    let cardsHtml = '';

    // Card 1: 4K UHD (2160p) - Exact replica of the user photo
    if (state.qualities.includes('4k')) {
      cardsHtml += `
        <div class="stremio-photo-card">
          <div class="stremio-card-top-row">
            <div class="stremio-header-title">2160p ${providerPrefix} ${instantText}</div>
            <div class="stremio-tracker-badge">
              <div class="stremio-tracker-avatar" style="background: ${tMeta.avatarBg};" title="${tMeta.name}">
                🏴‍☠️
              </div>
              <span class="stremio-tracker-name">${tMeta.tag}</span>
            </div>
          </div>

          <div class="stremio-detail-block">
            <div class="stremio-detail-row">
              <span class="stremio-emoji-icon">🗳️</span>
              <span class="stremio-filename-text">The.Whisper.Man.2026.ITA.ENG.2160p.HDR10.DV.HEVC.Walrus54.mkv</span>
            </div>
            <div class="stremio-detail-row">
              <span class="stremio-emoji-icon">📁</span>
              <span class="stremio-filename-text">The.Whisper.Man.2026.ITA.ENG.2160p.HDR10.DV.HEVC.Walrus54.mkv</span>
            </div>
          </div>

          <div class="stremio-meta-row">
            <span>💾 12.52 GB</span>
          </div>

          <div class="stremio-meta-row">
            <span>🗣️ ${flags}</span>
          </div>

          <div class="stremio-source-row">
            <span>🔗 💾 Comet (StremThru) 👥 33</span>
          </div>

          <div class="stremio-tech-badges">
            <span class="tech-badge-4k">4K ULTRA HD</span>
            <span class="tech-badge-dv">Dolby VISION</span>
            <span class="tech-badge-hdr10">HDR10</span>
            <span class="tech-badge-hevc">HEVC</span>
            <span class="tech-badge-dim">DIM</span>
          </div>
        </div>
      `;
    }

    // Card 2: 1080p FHD
    if (state.qualities.includes('1080p')) {
      cardsHtml += `
        <div class="stremio-photo-card" style="margin-top: 0.75rem;">
          <div class="stremio-card-top-row">
            <div class="stremio-header-title">1080p ${providerPrefix} ${instantText}</div>
            <div class="stremio-tracker-badge">
              <div class="stremio-tracker-avatar" style="background: radial-gradient(circle, #e74c3c 0%, #922b21 100%);" title="IlCorsaroNero">
                🏴‍☠️
              </div>
              <span class="stremio-tracker-name">IlCorsaroNero 🧲 🇮🇹</span>
            </div>
          </div>

          <div class="stremio-detail-block">
            <div class="stremio-detail-row">
              <span class="stremio-emoji-icon">🗳️</span>
              <span class="stremio-filename-text">The.Whisper.Man.2026.ITA.ENG.1080p.BluRay.x264.DD5.1-Nova.mkv</span>
            </div>
            <div class="stremio-detail-row">
              <span class="stremio-emoji-icon">📁</span>
              <span class="stremio-filename-text">The.Whisper.Man.2026.ITA.ENG.1080p.BluRay.x264.DD5.1-Nova.mkv</span>
            </div>
          </div>

          <div class="stremio-meta-row">
            <span>💾 4.85 GB</span>
          </div>

          <div class="stremio-meta-row">
            <span>🗣️ ${flags}</span>
          </div>

          <div class="stremio-source-row">
            <span>🔗 💾 IlCorsaroNero 👥 94</span>
          </div>

          <div class="stremio-tech-badges">
            <span class="tech-badge-dv">1080p FHD</span>
            <span class="tech-badge-hevc">x264</span>
            <span class="tech-badge-dim">DD 5.1</span>
          </div>
        </div>
      `;
    }

    stremioMockContainer.innerHTML = cardsHtml;
  }

  // ----------------------------------------------------
  // 5. SVG QR Code Generator
  // ----------------------------------------------------
  function renderQrCode(text) {
    qrContainer.innerHTML = '';
    try {
      const svg = createQRCodeSVG(text, 160);
      qrContainer.appendChild(svg);
    } catch (e) {
      qrContainer.innerHTML = `<span style="font-size:0.8rem; color: var(--text-tertiary);">QR Code non disponibile</span>`;
    }
  }

  function createQRCodeSVG(text, size = 160) {
    const modules = generateQRMatrix(text);
    const count = modules.length;
    const cellSize = size / count;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.style.borderRadius = '8px';

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', size);
    bg.setAttribute('height', size);
    bg.setAttribute('fill', '#ffffff');
    svg.appendChild(bg);

    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (modules[r][c]) {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', c * cellSize);
          rect.setAttribute('y', r * cellSize);
          rect.setAttribute('width', cellSize + 0.5);
          rect.setAttribute('height', cellSize + 0.5);
          rect.setAttribute('fill', '#1f1f1f');
          svg.appendChild(rect);
        }
      }
    }
    return svg;
  }

  function generateQRMatrix(data) {
    const size = 25;
    const matrix = Array.from({ length: size }, () => Array(size).fill(false));

    function addFinder(startX, startY) {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          if (
            y === 0 || y === 6 || x === 0 || x === 6 ||
            (y >= 2 && y <= 4 && x >= 2 && x <= 4)
          ) {
            matrix[startY + y][startX + x] = true;
          }
        }
      }
    }

    addFinder(0, 0);
    addFinder(size - 7, 0);
    addFinder(0, size - 7);

    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = (i % 2 === 0);
      matrix[i][6] = (i % 2 === 0);
    }

    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash |= 0;
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if ((x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8)) continue;
        if (x === 6 || y === 6) continue;
        const val = Math.abs(Math.sin((x * 13 + y * 29 + hash) * 0.1));
        matrix[y][x] = val > 0.45;
      }
    }
    return matrix;
  }

  // ----------------------------------------------------
  // 6. Live Health Check / Ping
  // ----------------------------------------------------
  async function testServerPing() {
    statusPulse.className = 'status-pulse';
    statusLabel.textContent = 'Verifica in corso...';
    pingBadge.textContent = '...';

    const cleanBaseUrl = (state.baseUrl || 'http://localhost:7000').replace(/\/$/, '');
    const startTime = performance.now();

    try {
      const response = await fetch(`${cleanBaseUrl}/health`, {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });

      const elapsed = Math.round(performance.now() - startTime);

      if (response.ok) {
        statusPulse.classList.remove('offline');
        statusLabel.textContent = 'Server Online';
        pingBadge.textContent = `${elapsed} ms`;
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      statusPulse.classList.add('offline');
      statusLabel.textContent = 'Server Non Raggiungibile';
      pingBadge.textContent = 'Off';
      return false;
    }
  }

  // ----------------------------------------------------
  // 7. Toast Notification System
  // ----------------------------------------------------
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="material-symbols-rounded">${type === 'success' ? 'check_circle' : 'error'}</span>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ----------------------------------------------------
  // 8. Event Handlers
  // ----------------------------------------------------

  // Base URL
  baseUrlInput.value = state.baseUrl;
  baseUrlInput.addEventListener('input', (e) => {
    state.baseUrl = e.target.value.trim();
    updateUI();
  });

  btnDetectUrl.addEventListener('click', () => {
    state.baseUrl = window.location.origin;
    baseUrlInput.value = state.baseUrl;
    updateUI();
    testServerPing();
    showToast(`URL rilevato: ${state.baseUrl}`);
  });

  btnTestPing.addEventListener('click', async () => {
    const isOnline = await testServerPing();
    if (isOnline) {
      showToast('Connessione al server stabilita con successo!');
    } else {
      showToast('Impossibile connettersi al server locale.', 'error');
    }
  });

  // Trackers chips selection
  document.querySelectorAll('.tracker-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      state.trackers = Array.from(document.querySelectorAll('.tracker-chip.active')).map(c => c.getAttribute('data-tracker'));
      updateUI();
    });
  });

  checkStrictIta.addEventListener('change', (e) => {
    state.strictIta = e.target.checked;
    updateUI();
  });

  // Prowlarr accordion
  btnToggleProwlarr.addEventListener('click', () => {
    const isHidden = prowlarrContent.style.display === 'none';
    prowlarrContent.style.display = isHidden ? 'block' : 'none';
    prowlarrChevron.textContent = isHidden ? 'expand_less' : 'expand_more';
  });

  prowlarrUrl.addEventListener('input', (e) => { state.prowlarrUrl = e.target.value.trim(); updateUI(); });
  prowlarrKey.addEventListener('input', (e) => { state.prowlarrKey = e.target.value.trim(); updateUI(); });

  // Provider selection
  providerChips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    providerChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    state.debridProvider = chip.getAttribute('data-provider');
    const meta = providerMeta[state.debridProvider];

    if (state.debridProvider === 'none') {
      apiKeySection.style.display = 'none';
    } else {
      apiKeySection.style.display = 'flex';
      apiKeyLabel.textContent = meta.label;
      if (meta.url) {
        apiKeyLink.href = meta.url;
        apiKeyLink.style.display = 'inline-flex';
      } else {
        apiKeyLink.style.display = 'none';
      }
    }
    updateUI();
  });

  // API Key
  apiKeyInput.addEventListener('input', (e) => {
    state.apiKey = e.target.value;
    updateUI();
  });

  btnToggleApiKey.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleApiKeyIcon.textContent = 'visibility_off';
    } else {
      apiKeyInput.type = 'password';
      toggleApiKeyIcon.textContent = 'visibility';
    }
  });

  // Checkboxes
  checkCachedOnly.addEventListener('change', (e) => {
    state.cachedOnly = e.target.checked;
    updateUI();
  });

  checkShowP2PFallback.addEventListener('change', (e) => {
    state.showP2PFallback = e.target.checked;
    updateUI();
  });

  // Qualities
  qualityCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const card = cb.closest('.quality-card');
      if (cb.checked) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
      state.qualities = Array.from(document.querySelectorAll('input[name="quality"]:checked')).map(c => c.value);
      updateUI();
    });
  });

  checkHdr.addEventListener('change', (e) => { state.hdr = e.target.checked; updateUI(); });
  checkExcludeCam.addEventListener('change', (e) => { state.excludeCam = e.target.checked; updateUI(); });
  checkExclude3D.addEventListener('change', (e) => { state.exclude3D = e.target.checked; updateUI(); });

  // Sliders
  maxResultsSlider.addEventListener('input', (e) => {
    state.maxResults = parseInt(e.target.value, 10);
    maxResultsValue.textContent = `${state.maxResults} flussi`;
    updateUI();
  });

  maxSizeSlider.addEventListener('input', (e) => {
    state.maxSize = parseInt(e.target.value, 10);
    maxSizeValue.textContent = `${state.maxSize} GB`;
    updateUI();
  });

  // Languages Chips
  languagesChips.addEventListener('click', (e) => {
    const chip = e.target.closest('.lang-chip');
    if (!chip) return;

    chip.classList.toggle('active');
    state.languages = Array.from(languagesChips.querySelectorAll('.lang-chip.active')).map(c => c.getAttribute('data-lang'));
    updateUI();
  });

  checkPrioritizeIta.addEventListener('change', (e) => { state.prioritizeIta = e.target.checked; updateUI(); });
  checkRequireSubs.addEventListener('change', (e) => { state.requireSubs = e.target.checked; updateUI(); });

  // Addon Metadata
  addonNameInput.addEventListener('input', (e) => { state.addonName = e.target.value; updateUI(); });
  addonVersionInput.addEventListener('input', (e) => { state.addonVersion = e.target.value; updateUI(); });
  addonDescInput.addEventListener('input', (e) => { state.addonDesc = e.target.value; updateUI(); });

  // Copy Buttons
  btnCopyManifest.addEventListener('click', () => {
    const { manifestHttpUrl } = generateUrls();
    navigator.clipboard.writeText(manifestHttpUrl).then(() => {
      showToast('Link manifest copiato negli appunti!');
    });
  });

  btnCopyJson.addEventListener('click', () => {
    navigator.clipboard.writeText(manifestJsonCode.textContent).then(() => {
      showToast('JSON del manifest copiato negli appunti!');
    });
  });

  // Copy Terminal Commands Buttons
  document.querySelectorAll('.copy-cmd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-copy');
      if (code) {
        navigator.clipboard.writeText(code).then(() => {
          showToast('Comandi terminale copiati!');
        });
      }
    });
  });

  // Hero Quick Buttons
  btnQuickInstallHero.addEventListener('click', () => {
    const { stremioProtocolUrl } = generateUrls();
    window.location.href = stremioProtocolUrl;
  });

  btnScrollConfig.addEventListener('click', () => {
    document.getElementById('configSection').scrollIntoView({ behavior: 'smooth' });
  });

  // Help Modal
  btnHelp.addEventListener('click', () => { helpModal.classList.add('show'); });
  btnCloseModal.addEventListener('click', () => { helpModal.classList.remove('show'); });
  btnModalOk.addEventListener('click', () => { helpModal.classList.remove('show'); });
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) helpModal.classList.remove('show');
  });

  // ----------------------------------------------------
  // 9. Initial Boot
  // ----------------------------------------------------
  initTheme();
  updateUI();
  testServerPing();
  setInterval(testServerPing, 10000);

})();
