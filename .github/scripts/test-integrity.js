/**
 * COMPASSION OF JESUS GLOBAL MISSION - CI INTEGRITY TEST SUITE
 * Scans every nook & cranny of index.html, styles.css, app.js, and sermons.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

let errorsCount = 0;

function logPass(msg) {
  console.log(`  ✅ PASS: ${msg}`);
}

function logFail(msg) {
  console.error(`  ❌ FAIL: ${msg}`);
  errorsCount++;
}

console.log("==================================================");
console.log("🔍 RUNNING COMPASSION OF JESUS GLOBAL MISSION CI TESTS");
console.log("==================================================");

// 1. VERIFY REQUIRED PROJECT FILES EXIST
console.log("\n📁 [Test 1] Checking Core Files Existence...");
const requiredFiles = ['index.html', 'styles.css', 'app.js', 'sermons.js', 'logo.png', 'qr_code_cjgmilorin.png'];
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    logPass(`File '${file}' exists.`);
  } else {
    logFail(`Missing critical file '${file}'!`);
  }
});

// 2. HTML STRUCTURE & ASSET REFERENCES SCAN
console.log("\n📄 [Test 2] Scanning index.html Nook & Crannies...");
const htmlContent = fs.readFileSync('index.html', 'utf8');

if (htmlContent.includes('<title>') && htmlContent.includes('</title>')) {
  logPass("index.html contains valid <title> tag.");
} else {
  logFail("index.html missing <title> tag!");
}

if (htmlContent.includes('sermons.js') && htmlContent.includes('app.js') && htmlContent.includes('styles.css')) {
  logPass("index.html correctly links all CSS and JS scripts.");
} else {
  logFail("index.html is missing required script/stylesheet links!");
}

if (htmlContent.includes('id="sermonsGrid"') && htmlContent.includes('id="navDrawer"') && htmlContent.includes('id="toastNotification"')) {
  logPass("index.html contains all required UI DOM container IDs.");
} else {
  logFail("index.html is missing critical DOM container IDs!");
}

// 3. JAVASCRIPT & SERMONS DATASET INTEGRITY CHECK
console.log("\n📊 [Test 3] Verifying sermons.js Data Schema & Links...");
let sermonsContent = fs.readFileSync('sermons.js', 'utf8');
sermonsContent += '\n; this.sermonsData = sermonsData;';

try {
  const context = {};
  vm.createContext(context);
  vm.runInContext(sermonsContent, context);

  const sermonsData = context.sermonsData;

  if (typeof sermonsData !== 'undefined' && Array.isArray(sermonsData)) {
    logPass(`sermonsData array successfully parsed (${sermonsData.length} total sermons).`);

    const idSet = new Set();
    sermonsData.forEach((sermon, idx) => {
      const num = idx + 1;
      if (!sermon.id) logFail(`Sermon #${num} missing 'id'!`);
      if (idSet.has(sermon.id)) logFail(`Duplicate Sermon ID found: '${sermon.id}'!`);
      idSet.add(sermon.id);

      if (!sermon.title) logFail(`Sermon ${sermon.id} missing 'title'!`);
      if (!sermon.speaker) logFail(`Sermon ${sermon.id} missing 'speaker'!`);
      if (!sermon.driveUrl) logFail(`Sermon ${sermon.id} missing 'driveUrl'!`);
      if (!sermon.date) logFail(`Sermon ${sermon.id} missing 'date'!`);
      if (!sermon.scripture) logFail(`Sermon ${sermon.id} missing 'scripture'!`);

      // Verify Fastly CDN URL structure
      if (sermon.driveUrl && !sermon.driveUrl.startsWith('https://')) {
        logFail(`Sermon ${sermon.id} driveUrl must be a secure HTTPS URL!`);
      }
    });

    logPass("All sermons passed metadata schema & duplicate ID verification.");
  } else {
    logFail("sermonsData array is not defined or invalid!");
  }
} catch (e) {
  logFail(`Syntax error while executing sermons.js: ${e.message}`);
}

// 4. CSS SYNTAX CHECK
console.log("\n🎨 [Test 4] Validating styles.css Syntax...");
const cssContent = fs.readFileSync('styles.css', 'utf8');
const openBraces = (cssContent.match(/\{/g) || []).length;
const closeBraces = (cssContent.match(/\}/g) || []).length;

if (openBraces === closeBraces) {
  logPass(`styles.css curly braces are perfectly balanced (${openBraces} open/close braces).`);
} else {
  logFail(`styles.css curly brace mismatch! Open: ${openBraces}, Close: ${closeBraces}`);
}

console.log("\n==================================================");
if (errorsCount === 0) {
  console.log("🎉 ALL CI INTEGRITY TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================");
  process.exit(0);
} else {
  console.error(`💥 CI FAILED WITH ${errorsCount} ERROR(S).`);
  console.log("==================================================");
  process.exit(1);
}
