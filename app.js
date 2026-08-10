/**
 * COMPASSION OF JESUS GLOBAL MISSION, ILORIN - APPLICATION LOGIC
 * Features: 
 * - Priority Relevance Search Engine (Title & Pastor Matches Ranked First)
 * - Persistent Light/Dark Mode Preference (localStorage)
 * - Emblem Logo Container Layout
 * - OpenGraph Social Sharing Card Engine
 * - Toast Notification System
 * - Hamburger Navigation Drawer
 * - Floating In-Page Audio Player
 * - Fastly Global CDN 0-Lag Audio Streaming
 */

// Global App State
let currentPlayingSermon = null;
let activeSpeaker = "All";
let searchQuery = "";
let currentPage = 1;
const pageSize = 9;

// Initialize App on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initThemeSwitcher();
  renderChurchDetails();
  renderFeaturedSermon();
  renderSermonGrid();
});

/**
 * 📋 TOAST NOTIFICATION CONTROLLER
 */
function showToast(message) {
  const toast = document.getElementById("toastNotification");
  const toastText = document.getElementById("toastText");
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/**
 * 🍔 HAMBURGER NAVIGATION DRAWER CONTROLLER
 */
function toggleDrawer(open) {
  const drawer = document.getElementById("navDrawer");
  const overlay = document.getElementById("drawerOverlay");
  if (!drawer || !overlay) return;

  if (open) {
    overlay.classList.add("active");
    drawer.classList.add("active");
  } else {
    overlay.classList.remove("active");
    drawer.classList.remove("active");
  }
}

/**
 * 🌙 PERSISTENT LIGHT / DARK MODE THEME SWITCHER (Saved via localStorage)
 */
function initThemeSwitcher() {
  const toggleBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");
  const metaThemeColor = document.getElementById("metaThemeColor");

  // Read saved theme preference from localStorage (Default to light)
  const savedTheme = localStorage.getItem("cjgm_theme_preference") || "light";
  applyTheme(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isDark = document.body.classList.contains("dark");
      const nextTheme = isDark ? "light" : "dark";
      localStorage.setItem("cjgm_theme_preference", nextTheme);
      applyTheme(nextTheme);
    });
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.body.classList.add("dark");
      if (themeIcon) themeIcon.className = "ph ph-sun";
      if (metaThemeColor) metaThemeColor.setAttribute("content", "#0f172a");
    } else {
      document.body.classList.remove("dark");
      if (themeIcon) themeIcon.className = "ph ph-moon";
      if (metaThemeColor) metaThemeColor.setAttribute("content", "#fffcf9");
    }
  }
}

/**
 * DIRECT INLINE SEARCH & SPEAKER HANDLERS
 */
function handleSearch(val) {
  searchQuery = val || "";
  currentPage = 1;
  renderSermonGrid();
}

function handleSpeaker(speaker, btnElement) {
  const filterButtons = document.querySelectorAll("#speakerFilterTags .tag-btn");
  filterButtons.forEach(b => b.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");
  
  activeSpeaker = speaker || "All";
  currentPage = 1;
  renderSermonGrid();
}

/**
 * GOOGLE DRIVE / ARCHIVE.ORG / FASTLY CDN LINK RESOLVER
 */
function getDriveUrls(driveUrl) {
  if (!driveUrl) return { downloadUrl: "", listenTabUrl: "" };

  if (driveUrl.includes("github.com") || driveUrl.includes("archive.org") || driveUrl.endsWith(".mp3")) {
    return {
      downloadUrl: driveUrl,
      listenTabUrl: driveUrl
    };
  }

  const fileIdMatch = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                      driveUrl.match(/id=([a-zA-Z0-9_-]+)/);

  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    return {
      downloadUrl: `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`,
      listenTabUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`
    };
  }

  return {
    downloadUrl: driveUrl,
    listenTabUrl: driveUrl
  };
}

/**
 * 🎶 FLOATING IN-PAGE AUDIO PLAYER ENGINE (Inline SVG + Persistent Audio Tag)
 */
let globalAudioElem = null;
let isUserScrubbing = false;

const SVG_PLAY = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
const SVG_PAUSE = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
const SVG_SPINNER = `<svg class="spin" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="9" stroke-dasharray="36" stroke-linecap="round"/></svg>`;

function getGlobalAudio() {
  if (!globalAudioElem) {
    globalAudioElem = document.getElementById("globalAudioPlayer");
    if (globalAudioElem) {
      globalAudioElem.addEventListener("timeupdate", updatePlayerProgress);
      globalAudioElem.addEventListener("loadedmetadata", onAudioMetadataLoaded);
      globalAudioElem.addEventListener("play", () => setPlayPauseIcon(true));
      globalAudioElem.addEventListener("pause", () => setPlayPauseIcon(false));
      globalAudioElem.addEventListener("ended", () => setPlayPauseIcon(false));
      globalAudioElem.addEventListener("waiting", () => showPlayerBuffering(true));
      globalAudioElem.addEventListener("stalled", () => showPlayerBuffering(true));
      globalAudioElem.addEventListener("canplay", () => showPlayerBuffering(false));
      globalAudioElem.addEventListener("playing", () => showPlayerBuffering(false));
    }
  }
  return globalAudioElem;
}

function streamOnline(sermonId) {
  const sermon = sermonsData.find(s => s.id === sermonId);
  if (!sermon) return;

  currentPlayingSermon = sermon;
  const urls = getDriveUrls(sermon.driveUrl);

  const audio = getGlobalAudio();
  if (audio) {
    if (audio.src !== urls.listenTabUrl) {
      audio.src = urls.listenTabUrl;
    }
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.log("Audio play error:", err);
        setPlayPauseIcon(false);
      });
    }
  }

  const playerContainer = document.getElementById("floatingPlayerContainer");
  if (!playerContainer) return;

  playerContainer.innerHTML = `
    <div class="floating-player-bar">
      <div class="player-container">
        
        <!-- Track Info & Prominent Play/Pause -->
        <div class="player-info-group">
          <button class="player-play-btn" id="customPlayPauseBtn" onclick="togglePlayPause()" title="Play / Pause">
            <span id="playPauseIconSlot">${SVG_PAUSE}</span>
          </button>

          <div class="player-text-box">
            <div class="player-title">${escapeHtml(sermon.title)}</div>
            <div class="player-speaker">${escapeHtml(sermon.speaker)} • ${escapeHtml(sermon.scripture)}</div>
          </div>
        </div>

        <!-- Scrubber Progress Bar -->
        <div class="player-scrubber-group">
          <span class="player-time" id="playerCurrentTime">${audio ? formatTime(audio.currentTime) : '0:00'}</span>
          <input 
            type="range" 
            id="customPlayerProgress" 
            class="player-progress-bar" 
            value="${audio && audio.duration ? (audio.currentTime / audio.duration) * 100 : 0}" 
            min="0" 
            max="100" 
            step="0.1" 
            oninput="onScrubbing(this.value)"
            onchange="seekAudio(this.value)"
          >
          <span class="player-time" id="playerTotalDuration">${escapeHtml(sermon.duration || (audio && audio.duration ? formatTime(audio.duration) : '0:00'))}</span>
        </div>

        <!-- Action Controls (Mute, Share, Download, Close) -->
        <div class="player-actions-group">
          <button onclick="toggleMute()" class="player-action-btn" title="Mute / Unmute">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.8-1-3.3-2.5-4v8c1.5-.7 2.5-2.2 2.5-4z"/></svg>
          </button>
          <button onclick="shareSermon('${sermon.id}')" class="player-action-btn" title="Share Sermon on WhatsApp">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--brand-whatsapp)"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 1 .9-2.9-.2-.3A8 8 0 1 1 12 20zm4.5-5.9c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.6 6.6 0 0 1-2.1-1.3 7.3 7.3 0 0 1-1.5-1.8c-.1-.2 0-.4.1-.5l.4-.5c.1-.1.2-.3.3-.4a.4.4 0 0 0 0-.4c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3a2.9 2.9 0 0 0-.9 2.1c0 1.2.9 2.4 1 2.6s1.8 2.8 4.4 3.9c.6.3 1.1.4 1.5.5.6.2 1.2.1 1.7.1a2.7 2.7 0 0 0 1.8-1.3c.2-.3.2-.6.2-.7s-.1-.2-.3-.3z"/></svg>
          </button>
          <button onclick="triggerDownload('${sermon.id}')" class="player-action-btn" title="Download MP3">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          </button>
          <button onclick="closePlayer()" class="player-close-btn" title="Close Player">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>
          </button>
        </div>

      </div>
    </div>
  `;

  renderSermonGrid();
  renderFeaturedSermon();
}

function showPlayerBuffering(isBuffering) {
  const slot = document.getElementById("playPauseIconSlot");
  if (!slot) return;
  const audio = getGlobalAudio();
  if (isBuffering) {
    slot.innerHTML = SVG_SPINNER;
  } else if (audio) {
    setPlayPauseIcon(!audio.paused);
  }
}

function togglePlayPause() {
  const audio = getGlobalAudio();
  if (!audio) return;
  if (audio.paused) {
    audio.play().catch(e => console.log("Toggle play:", e));
  } else {
    audio.pause();
  }
}

function setPlayPauseIcon(isPlaying) {
  const slot = document.getElementById("playPauseIconSlot");
  if (slot) {
    slot.innerHTML = isPlaying ? SVG_PAUSE : SVG_PLAY;
  }
}

function onScrubbing(value) {
  isUserScrubbing = true;
  const audio = getGlobalAudio();
  if (!audio || !audio.duration) return;
  const seekTo = (value / 100) * audio.duration;
  const currentTimeLabel = document.getElementById("playerCurrentTime");
  if (currentTimeLabel) {
    currentTimeLabel.textContent = formatTime(seekTo);
  }
}

function seekAudio(value) {
  const audio = getGlobalAudio();
  if (!audio || !audio.duration) return;
  const seekTo = (value / 100) * audio.duration;
  audio.currentTime = seekTo;
  isUserScrubbing = false;
  
  if (audio.paused) {
    audio.play().catch(e => console.log("Seek play:", e));
  }
}

function updatePlayerProgress() {
  const audio = getGlobalAudio();
  if (!audio || isUserScrubbing) return;
  const progressInput = document.getElementById("customPlayerProgress");
  const currentTimeLabel = document.getElementById("playerCurrentTime");

  if (audio.duration) {
    const pct = (audio.currentTime / audio.duration) * 100;
    if (progressInput) progressInput.value = pct;
  }

  if (currentTimeLabel) {
    currentTimeLabel.textContent = formatTime(audio.currentTime);
  }
}

function onAudioMetadataLoaded() {
  const audio = getGlobalAudio();
  if (!audio) return;
  const totalDurationLabel = document.getElementById("playerTotalDuration");
  if (totalDurationLabel && audio.duration) {
    totalDurationLabel.textContent = formatTime(audio.duration);
  }
}

function toggleMute() {
  const audio = getGlobalAudio();
  if (!audio) return;
  audio.muted = !audio.muted;
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function closePlayer() {
  const audio = getGlobalAudio();
  if (audio) {
    audio.pause();
  }
  const playerContainer = document.getElementById("floatingPlayerContainer");
  if (playerContainer) playerContainer.innerHTML = "";
  currentPlayingSermon = null;
  renderSermonGrid();
}

/**
 * 📲 SHARE SERMON HANDLER (WhatsApp & Copy Link Toast)
 */
function shareSermon(sermonId) {
  const sermon = sermonsData.find(s => s.id === sermonId);
  if (!sermon) return;

  const pageUrl = window.location.href;
  const shareText = `Listen to this powerful sermon: "${sermon.title}" by ${sermon.speaker} (${sermon.scripture}) on Compassion of Jesus Global Mission Audio Library! 🎧\n\n`;

  showToast("Opening WhatsApp to share sermon...");

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + pageUrl)}`;
  window.open(whatsappUrl, "_blank");
}

/**
 * DIRECT MP3 DOWNLOAD HANDLER
 */
function triggerDownload(sermonId) {
  const sermon = sermonsData.find(s => s.id === sermonId);
  if (!sermon) return;

  showToast("Starting MP3 download...");
  const urls = getDriveUrls(sermon.driveUrl);
  window.open(urls.downloadUrl, "_blank");
}

/**
 * Render Church Info
 */
function renderChurchDetails() {
  if (typeof churchDetails === "undefined") return;

  const brandTitle = document.getElementById("brandTitle");
  const heroTitle = document.getElementById("heroTitle");
  const heroSubtitle = document.getElementById("heroSubtitle");

  if (brandTitle) brandTitle.textContent = churchDetails.name;
  if (heroTitle) heroTitle.innerHTML = 'CJGM Ilorin <span style="color: var(--brand-red);">Audio Messages</span>';
  if (heroSubtitle) heroSubtitle.textContent = churchDetails.welcomeMessage;

  const serviceList = document.getElementById("serviceTimesList");
  if (serviceList && churchDetails.serviceTimes) {
    serviceList.innerHTML = churchDetails.serviceTimes.map(st => `
      <li><strong>${st.day}:</strong> ${st.time}</li>
    `).join("");
  }
}

/**
 * Render Most Recent Message Banner
 */
function renderFeaturedSermon() {
  const container = document.getElementById("featuredSermonContainer");
  if (!container || typeof sermonsData === "undefined" || sermonsData.length === 0) return;

  const latestSermon = [...sermonsData].sort((a, b) => new Date(b.date || "2026-01-01") - new Date(a.date || "2026-01-01"))[0];
  if (!latestSermon) return;

  container.innerHTML = `
    <div class="featured-card">
      <div class="featured-content">
        <span class="featured-badge">Most Recent Message</span>
        <h2 class="featured-title">${escapeHtml(latestSermon.title)}</h2>
        <div class="featured-meta">
          <span class="meta-item"><i class="ph ph-user"></i> ${escapeHtml(latestSermon.speaker)}</span>
          <span class="meta-item"><i class="ph ph-calendar-blank"></i> ${escapeHtml(latestSermon.formattedDate)}</span>
          <span class="meta-item"><i class="ph ph-book-open"></i> ${escapeHtml(latestSermon.scripture)}</span>
          <span class="meta-item"><i class="ph ph-clock"></i> ${escapeHtml(latestSermon.duration)}</span>
        </div>
        <p class="featured-desc">${escapeHtml(latestSermon.description)}</p>
      </div>

      <div class="featured-buttons">
        <button class="btn btn-blue" onclick="streamOnline('${latestSermon.id}')">
          <i class="ph ph-headphones"></i> Listen Online
        </button>
        <button class="btn btn-primary" onclick="triggerDownload('${latestSermon.id}')">
          <i class="ph ph-download-simple"></i> Download MP3
        </button>
        <button class="btn btn-share-icon" onclick="shareSermon('${latestSermon.id}')" title="Share Message on WhatsApp">
          <i class="ph ph-whatsapp-logo" style="color: var(--brand-whatsapp); font-size: 1.2rem;"></i>
        </button>
      </div>
    </div>
  `;
}

/**
 * 🔍 PRIORITY RELEVANCE SEARCH ENGINE (Title & Speaker Matches Highest Priority)
 */
function renderSermonGrid() {
  const container = document.getElementById("sermonsGrid");
  const countBadge = document.getElementById("pageCountBadge");
  if (!container || typeof sermonsData === "undefined") return;

  const q = searchQuery.toLowerCase().trim();
  let filtered = [];

  if (q === "") {
    filtered = sermonsData.filter(sermon => 
      activeSpeaker === "All" || (sermon.speaker || "").includes(activeSpeaker)
    );
    // Chronological default when search is empty
    filtered.sort((a, b) => new Date(b.date || "2026-01-01") - new Date(a.date || "2026-01-01"));
  } else {
    // Relevance Scoring Engine: Title & Speaker Ranked Highest
    sermonsData.forEach(sermon => {
      const matchesSpeakerFilter = activeSpeaker === "All" || (sermon.speaker || "").includes(activeSpeaker);
      if (!matchesSpeakerFilter) return;

      const titleStr = (sermon.title || "").toLowerCase();
      const speakerStr = (sermon.speaker || "").toLowerCase();
      const scriptureStr = (sermon.scripture || "").toLowerCase();
      const seriesStr = (sermon.series || "").toLowerCase();
      const descStr = (sermon.description || "").toLowerCase();

      let score = 0;

      // 🥇 TOP PRIORITY: Exact or Partial Title & Pastor Name Matches
      if (titleStr === q) {
        score += 100;
      } else if (titleStr.startsWith(q)) {
        score += 80;
      } else if (titleStr.includes(q)) {
        score += 60;
      }

      if (speakerStr === q) {
        score += 90;
      } else if (speakerStr.includes(q)) {
        score += 50;
      }

      // 🥈 SECONDARY PRIORITY: Scripture & Series Matches
      if (scriptureStr.includes(q)) {
        score += 30;
      }
      if (seriesStr.includes(q)) {
        score += 20;
      }

      // 🥉 TERTIARY PRIORITY: Description Body Matches
      if (descStr.includes(q)) {
        score += 10;
      }

      if (score > 0) {
        filtered.push({ sermon, score });
      }
    });

    // Sort by Relevance Score first (Title/Pastor matches top), then Date
    filtered.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(b.sermon.date || "2026-01-01") - new Date(a.sermon.date || "2026-01-01");
    });

    filtered = filtered.map(item => item.sermon);
  }

  const totalItems = filtered.length;

  if (totalItems === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="ph ph-magnifying-glass empty-icon"></i>
        <h3>No sermon messages found</h3>
        <p style="color: var(--text-secondary); margin-top: 4px; font-size: 0.88rem;">Try searching for a different title, pastor, or scripture.</p>
      </div>
    `;
    if (countBadge) countBadge.textContent = "Showing 0 messages";
    renderPagination(0);
    return;
  }

  // Calculate Sliced Page
  const totalPages = Math.ceil(totalItems / pageSize);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedSermons = filtered.slice(startIndex, endIndex);

  if (countBadge) {
    countBadge.textContent = `Showing ${startIndex + 1} – ${endIndex} of ${totalItems}`;
  }

  container.innerHTML = pagedSermons.map(sermon => {
    const isCurrent = currentPlayingSermon && currentPlayingSermon.id === sermon.id;

    return `
      <div class="sermon-card ${isCurrent ? 'active-playing' : ''}">
        <div>
          <div class="card-header">
            <span class="card-category">${escapeHtml(sermon.category)}</span>
            <span class="card-date">${escapeHtml(sermon.formattedDate)}</span>
          </div>
          <h3 class="card-title">${escapeHtml(sermon.title)}</h3>
          <div class="card-speaker"><i class="ph ph-user"></i> ${escapeHtml(sermon.speaker)}</div>
          <div class="card-scripture"><i class="ph ph-book-bookmark"></i> ${escapeHtml(sermon.scripture)}</div>
          <p class="card-desc">${escapeHtml(sermon.description)}</p>
        </div>

        <div class="card-actions">
          <button class="btn-play-sm" onclick="streamOnline('${sermon.id}')">
            <i class="ph ph-headphones"></i>
            <span>Listen</span>
          </button>
          
          <div style="display: flex; align-items: center; gap: 8px;">
            <button onclick="shareSermon('${sermon.id}')" class="btn-share-icon" title="Share Message on WhatsApp">
              <i class="ph ph-whatsapp-logo" style="color: var(--brand-whatsapp)"></i>
            </button>

            <button onclick="triggerDownload('${sermon.id}')" class="btn-download-icon" title="Download MP3 Directly">
              <i class="ph ph-download-simple"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  renderPagination(totalItems);
}

/**
 * 📄 RENDER SLEEK PAGINATION CONTROLS
 */
function renderPagination(totalItems) {
  const container = document.getElementById("paginationContainer");
  if (!container) return;

  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `
    <button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
      <i class="ph ph-caret-left"></i> Previous
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-num-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }

  html += `
    <button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
      Next <i class="ph ph-caret-right"></i>
    </button>
  `;

  container.innerHTML = html;
}

/**
 * Change Page with Smooth Scroll
 */
function changePage(newPage) {
  const totalPages = Math.ceil(sermonsData.length / pageSize);
  if (newPage < 1 || newPage > totalPages) return;

  currentPage = newPage;
  renderSermonGrid();

  const archiveHeader = document.querySelector(".section-title-bar");
  if (archiveHeader) {
    archiveHeader.scrollIntoView({ behavior: "smooth" });
  }
}

// Helpers
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}
