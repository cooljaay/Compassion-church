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
 * 🎶 FLOATING IN-PAGE AUDIO PLAYER ENGINE
 */
/**
 * 🎶 FLOATING IN-PAGE AUDIO PLAYER ENGINE (Custom HTML/JS Controls)
 */
let activeAudioElem = null;
let isUserScrubbing = false;

function streamOnline(sermonId) {
  const sermon = sermonsData.find(s => s.id === sermonId);
  if (!sermon) return;

  currentPlayingSermon = sermon;
  const urls = getDriveUrls(sermon.driveUrl);

  const playerContainer = document.getElementById("floatingPlayerContainer");
  if (!playerContainer) return;

  playerContainer.innerHTML = `
    <div class="floating-player-bar">
      <div class="player-container">
        
        <!-- Track Info & Prominent Play/Pause -->
        <div class="player-info-group">
          <button class="player-play-btn" id="customPlayPauseBtn" onclick="togglePlayPause()" title="Play / Pause">
            <i class="ph ph-pause-fill" id="playPauseIcon"></i>
          </button>

          <div class="player-text-box">
            <div class="player-title">${escapeHtml(sermon.title)}</div>
            <div class="player-speaker">${escapeHtml(sermon.speaker)} • ${escapeHtml(sermon.scripture)}</div>
          </div>
        </div>

        <!-- Scrubber Progress Bar -->
        <div class="player-scrubber-group">
          <span class="player-time" id="playerCurrentTime">0:00</span>
          <input 
            type="range" 
            id="customPlayerProgress" 
            class="player-progress-bar" 
            value="0" 
            min="0" 
            max="100" 
            step="0.1" 
            oninput="onScrubbing(this.value)"
            onchange="seekAudio(this.value)"
          >
          <span class="player-time" id="playerTotalDuration">${escapeHtml(sermon.duration || '0:00')}</span>
        </div>

        <!-- Action Controls (Mute, Share, Download, Close) -->
        <div class="player-actions-group">
          <button onclick="toggleMute()" class="player-action-btn" title="Mute / Unmute">
            <i class="ph ph-speaker-high" id="muteIcon"></i>
          </button>
          <button onclick="shareSermon('${sermon.id}')" class="player-action-btn" title="Share Sermon on WhatsApp">
            <i class="ph ph-whatsapp-logo" style="color: var(--brand-whatsapp)"></i>
          </button>
          <button onclick="triggerDownload('${sermon.id}')" class="player-action-btn" title="Download MP3">
            <i class="ph ph-download-simple"></i>
          </button>
          <button onclick="closePlayer()" class="player-close-btn" title="Close Player">
            <i class="ph ph-x"></i>
          </button>
        </div>

      </div>
    </div>
    <audio id="activeAudioElement" src="${urls.listenTabUrl}" preload="metadata" autoplay></audio>
  `;

  activeAudioElem = document.getElementById("activeAudioElement");

  if (activeAudioElem) {
    activeAudioElem.addEventListener("timeupdate", updatePlayerProgress);
    activeAudioElem.addEventListener("loadedmetadata", onAudioMetadataLoaded);
    activeAudioElem.addEventListener("play", () => setPlayPauseIcon(true));
    activeAudioElem.addEventListener("pause", () => setPlayPauseIcon(false));
    activeAudioElem.addEventListener("ended", () => setPlayPauseIcon(false));
    activeAudioElem.addEventListener("waiting", () => showPlayerBuffering(true));
    activeAudioElem.addEventListener("stalled", () => showPlayerBuffering(true));
    activeAudioElem.addEventListener("canplay", () => showPlayerBuffering(false));
    activeAudioElem.addEventListener("playing", () => showPlayerBuffering(false));
    
    // Play automatically
    activeAudioElem.play().catch(err => {
      console.log("Autoplay waiting for user interaction:", err);
      setPlayPauseIcon(false);
    });
  }

  renderSermonGrid();
  renderFeaturedSermon();
}

function showPlayerBuffering(isBuffering) {
  const icon = document.getElementById("playPauseIcon");
  if (!icon) return;
  if (isBuffering) {
    icon.className = "ph ph-spinner-gap spin";
  } else if (activeAudioElem) {
    setPlayPauseIcon(!activeAudioElem.paused);
  }
}

function togglePlayPause() {
  if (!activeAudioElem) return;
  if (activeAudioElem.paused) {
    activeAudioElem.play();
  } else {
    activeAudioElem.pause();
  }
}

function setPlayPauseIcon(isPlaying) {
  const icon = document.getElementById("playPauseIcon");
  if (icon) {
    icon.className = isPlaying ? "ph ph-pause-fill" : "ph ph-play-fill";
  }
}

function onScrubbing(value) {
  isUserScrubbing = true;
  if (!activeAudioElem || !activeAudioElem.duration) return;
  const seekTo = (value / 100) * activeAudioElem.duration;
  const currentTimeLabel = document.getElementById("playerCurrentTime");
  if (currentTimeLabel) {
    currentTimeLabel.textContent = formatTime(seekTo);
  }
}

function seekAudio(value) {
  if (!activeAudioElem || !activeAudioElem.duration) return;
  const seekTo = (value / 100) * activeAudioElem.duration;
  activeAudioElem.currentTime = seekTo;
  isUserScrubbing = false;
  
  if (activeAudioElem.paused) {
    activeAudioElem.play().catch(e => console.log("Seek play:", e));
  }
}

function updatePlayerProgress() {
  if (!activeAudioElem || isUserScrubbing) return;
  const progressInput = document.getElementById("customPlayerProgress");
  const currentTimeLabel = document.getElementById("playerCurrentTime");

  if (activeAudioElem.duration) {
    const pct = (activeAudioElem.currentTime / activeAudioElem.duration) * 100;
    if (progressInput) progressInput.value = pct;
  }

  if (currentTimeLabel) {
    currentTimeLabel.textContent = formatTime(activeAudioElem.currentTime);
  }
}

function onAudioMetadataLoaded() {
  if (!activeAudioElem) return;
  const totalDurationLabel = document.getElementById("playerTotalDuration");
  if (totalDurationLabel && activeAudioElem.duration) {
    totalDurationLabel.textContent = formatTime(activeAudioElem.duration);
  }
}

function toggleMute() {
  if (!activeAudioElem) return;
  activeAudioElem.muted = !activeAudioElem.muted;
  const icon = document.getElementById("muteIcon");
  if (icon) {
    icon.className = activeAudioElem.muted ? "ph ph-speaker-slash" : "ph ph-speaker-high";
  }
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function closePlayer() {
  if (activeAudioElem) {
    activeAudioElem.pause();
    activeAudioElem = null;
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
