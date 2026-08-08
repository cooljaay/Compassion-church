/**
 * COMPASSION OF JESUS GLOBAL MISSION, ILORIN - APPLICATION LOGIC
 * Features: 
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
 * LIGHT / DARK MODE THEME SWITCHER
 */
function initThemeSwitcher() {
  const toggleBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");
  const metaThemeColor = document.getElementById("metaThemeColor");

  applyTheme("light");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isDark = document.body.classList.contains("dark");
      applyTheme(isDark ? "light" : "dark");
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
        <div class="player-info">
          <div class="player-icon"><i class="ph ph-waveform"></i></div>
          <div>
            <div class="player-title">${escapeHtml(sermon.title)}</div>
            <div class="player-speaker">${escapeHtml(sermon.speaker)} • ${escapeHtml(sermon.scripture)}</div>
          </div>
        </div>

        <audio controls autoplay class="player-audio-elem">
          <source src="${urls.listenTabUrl}" type="audio/mpeg">
          Your browser does not support the audio player.
        </audio>

        <button onclick="closePlayer()" class="player-close-btn" title="Close Player">
          <i class="ph ph-x"></i>
        </button>
      </div>
    </div>
  `;

  renderSermonGrid();
  renderFeaturedSermon();
}

function closePlayer() {
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
 * 🔍 SERMON GRID FILTER & DISPLAY ENGINE (Chronological Recent Uploads)
 */
function renderSermonGrid() {
  const container = document.getElementById("sermonsGrid");
  const countBadge = document.getElementById("pageCountBadge");
  if (!container || typeof sermonsData === "undefined") return;

  const q = searchQuery.toLowerCase().trim();

  let filtered = sermonsData.filter(sermon => {
    const matchesSpeaker = activeSpeaker === "All" || (sermon.speaker || "").includes(activeSpeaker);

    const titleStr = (sermon.title || "").toLowerCase();
    const speakerStr = (sermon.speaker || "").toLowerCase();
    const scriptureStr = (sermon.scripture || "").toLowerCase();
    const seriesStr = (sermon.series || "").toLowerCase();
    const descStr = (sermon.description || "").toLowerCase();

    const matchesSearch = q === "" || 
      titleStr.includes(q) ||
      speakerStr.includes(q) ||
      scriptureStr.includes(q) ||
      seriesStr.includes(q) ||
      descStr.includes(q);

    return matchesSpeaker && matchesSearch;
  });

  // Always Sort Chronologically (Newest Recent Uploads First)
  filtered.sort((a, b) => new Date(b.date || "2026-01-01") - new Date(a.date || "2026-01-01"));

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
