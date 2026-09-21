/**
 * COMPASSION OF JESUS GLOBAL MISSION - STATIC SERMON PAGE GENERATOR
 * Generates SEO & OpenGraph rich preview landing pages for every message
 * Supports WhatsApp, Telegram, Twitter/X, Facebook, and iMessage rich preview cards
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function generateSlug(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}

function escapeAttr(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}

// 1. Read sermonsData from sermons.js
const sermonsJsPath = path.join(__dirname, '../../sermons.js');
let sermonsContent = fs.readFileSync(sermonsJsPath, 'utf8');
sermonsContent += '\n; this.sermonsData = sermonsData;';

const context = {};
vm.createContext(context);
vm.runInContext(sermonsContent, context);
const sermonsData = context.sermonsData;

if (!Array.isArray(sermonsData)) {
  console.error('❌ Failed to parse sermonsData from sermons.js');
  process.exit(1);
}

// 2. Ensure destination folders exist
const sermonsDir = path.join(__dirname, '../../sermons');
const messagesDir = path.join(__dirname, '../../messages');

if (!fs.existsSync(sermonsDir)) fs.mkdirSync(sermonsDir, { recursive: true });
if (!fs.existsSync(messagesDir)) fs.mkdirSync(messagesDir, { recursive: true });

console.log(`🚀 Generating rich OpenGraph preview pages for ${sermonsData.length} sermons...`);

let generatedCount = 0;

sermonsData.forEach(sermon => {
  const slug = generateSlug(sermon.title);
  const pageTitle = `${sermon.title} — ${sermon.speaker} | CJGM Ilorin`;
  const ogTitle = `${sermon.title} — ${sermon.speaker}`;
  const ogDesc = `📖 ${sermon.scripture} • ${sermon.category} (${sermon.formattedDate}) | ${sermon.description}`;
  const directUrl = `https://cjgmilorin.com/sermons/${slug}.html`;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeAttr(ogDesc)}">
  <meta name="theme-color" content="#e11d48">

  <!-- 🖼️ Favicon Icons -->
  <link rel="icon" type="image/png" href="../logo.png">
  <link rel="apple-touch-icon" href="../logo.png">

  <!-- 📱 OpenGraph Meta Tags for WhatsApp, Telegram, Facebook & Social Preview Cards -->
  <meta property="og:title" content="${escapeAttr(ogTitle)}">
  <meta property="og:description" content="${escapeAttr(ogDesc)}">
  <meta property="og:image" content="https://cjgmilorin.com/logo.png">
  <meta property="og:image:width" content="512">
  <meta property="og:image:height" content="512">
  <meta property="og:url" content="${escapeAttr(directUrl)}">
  <meta property="og:type" content="music.song">
  <meta property="og:site_name" content="Compassion of Jesus Global Mission, Ilorin">

  <!-- 🐦 Twitter / X Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttr(ogTitle)}">
  <meta name="twitter:description" content="${escapeAttr(ogDesc)}">
  <meta name="twitter:image" content="https://cjgmilorin.com/logo.png">

  <!-- 🔄 Instant Client Navigation to Main Interactive Player with Auto-Play -->
  <script>
    // Redirect human visitors immediately to the full interactive app while bots read metadata
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|whatsapp|telegram|facebookexternalhit|twitterbot/i.test(navigator.userAgent);
    if (!isBot) {
      window.location.replace("../?sermon=" + encodeURIComponent("${escapeAttr(sermon.id)}"));
    }
  </script>

  <!-- Google Fonts & Stylesheet -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/@phosphor-icons/web"></script>
  <link rel="stylesheet" href="../styles.css?v=1.1.6">

  <style>
    .single-sermon-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 40px 20px;
      background: var(--bg-primary);
    }
    .single-sermon-card {
      max-width: 650px;
      width: 100%;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-card);
      padding: 36px 30px;
      box-shadow: var(--card-shadow);
      text-align: center;
    }
    .single-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(225, 29, 72, 0.1);
      color: var(--brand-red);
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 5px 16px;
      border-radius: var(--radius-pill);
      margin-bottom: 16px;
    }
    .single-title {
      font-size: clamp(1.4rem, 4vw, 1.85rem);
      font-weight: 800;
      line-height: 1.3;
      margin-bottom: 12px;
      color: var(--text-primary);
    }
    .single-meta {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 14px;
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 20px;
    }
    .single-meta span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .single-scripture {
      color: var(--brand-gold);
      font-weight: 600;
    }
    .single-desc {
      font-size: 0.95rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .single-audio-player {
      width: 100%;
      margin-bottom: 24px;
      border-radius: var(--radius-pill);
    }
    .single-btn-group {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
    }
    .single-home-link {
      display: inline-block;
      margin-top: 24px;
      color: var(--brand-blue);
      font-weight: 600;
      text-decoration: none;
      font-size: 0.9rem;
    }
    .single-home-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>

  <div class="single-sermon-wrapper">
    <div class="single-sermon-card">
      <a href="../" style="display: inline-block; margin-bottom: 16px;">
        <img src="../logo.png" alt="Compassion of Jesus Global Mission" style="height: 60px; width: auto;">
      </a>

      <div>
        <span class="single-badge">${escapeHtml(sermon.category)}</span>
      </div>

      <h1 class="single-title">${escapeHtml(sermon.title)}</h1>

      <div class="single-meta">
        <span><i class="ph ph-user"></i> ${escapeHtml(sermon.speaker)}</span>
        <span class="single-scripture"><i class="ph ph-book-bookmark"></i> ${escapeHtml(sermon.scripture)}</span>
        <span><i class="ph ph-calendar-blank"></i> ${escapeHtml(sermon.formattedDate)}</span>
        <span><i class="ph ph-clock"></i> ${escapeHtml(sermon.duration)}</span>
      </div>

      <p class="single-desc">${escapeHtml(sermon.description)}</p>

      <audio controls class="single-audio-player" preload="metadata">
        <source src="${escapeAttr(sermon.driveUrl)}" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>

      <div class="single-btn-group">
        <a href="../?sermon=${escapeAttr(sermon.id)}" class="btn btn-blue">
          <i class="ph ph-headphones"></i> Open Interactive Player
        </a>
        <a href="${escapeAttr(sermon.driveUrl)}" download class="btn btn-primary" target="_blank">
          <i class="ph ph-download-simple"></i> Download MP3
        </a>
      </div>

      <div>
        <a href="../" class="single-home-link">
          <i class="ph ph-arrow-left"></i> Browse All Messages on CJGM Ilorin
        </a>
      </div>
    </div>
  </div>

</body>
</html>
`;

  // Write slug page: /sermons/{slug}.html
  fs.writeFileSync(path.join(sermonsDir, `${slug}.html`), htmlContent, 'utf8');

  // Write id page: /sermons/{id}.html
  fs.writeFileSync(path.join(sermonsDir, `${sermon.id}.html`), htmlContent, 'utf8');

  // Write alias: /messages/{id}.html
  fs.writeFileSync(path.join(messagesDir, `${sermon.id}.html`), htmlContent, 'utf8');

  generatedCount++;
});

console.log(`✅ Successfully generated ${generatedCount} sermon preview landing pages with rich OpenGraph metadata!`);
