# Free Step-by-Step Guide: Publishing Website for Compassion of Jesus Global Mission, Ilorin

Website Target Domain: **cjgmmessages.com**  
Total Hosting Cost: **$0/month** (100% Free Forever using Netlify or GitHub Pages)

---

## 1. Preview Your Website Locally Right Now

1. Open File Explorer on your computer and navigate to:  
   `C:\Users\Josh\.gemini\antigravity\scratch\church-website`
2. Double-click **`index.html`**.
3. It will immediately open in Google Chrome, Microsoft Edge, or Safari with your official **Compassion of Jesus Global Mission** logo, audio player, sermon grid, and download buttons!

---

## 2. Publish Live Online for $0/Month (Netlify Drop)

1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop) in your web browser.
2. Drag and drop the **`church-website`** folder onto the Netlify webpage.
3. Your site is instantly live at a free web link (e.g., `https://cjgmmessages.netlify.app`)!

---

## 3. How to Connect Your Custom Domain (`cjgmmessages.com`)

If you register the domain **`cjgmmessages.com`** (from Namecheap, Porkbun, or Google Domains for ~$10/year):

1. **In Netlify**:
   - Go to **Domain Settings &rarr; Add Custom Domain**.
   - Type in `cjgmmessages.com` and click Save.
2. **In Your Domain Registrar (where you bought cjgmmessages.com)**:
   - Change your Domain Nameservers (DNS) to Netlify's free nameservers (Netlify provides 4 simple nameserver links like `dns1.p01.nsone.net`).
3. Netlify will automatically activate **free SSL (HTTPS security certificate)** for `cjgmmessages.com` at no extra cost!

---

## 4. How to Add New Sermons from Google Drive (60 Seconds)

Whenever a new sermon is recorded at church:

1. **Upload Audio File to Google Drive**:
   - Drag your recorded `.mp3` or `.m4a` file into your Google Drive account.
2. **Copy Share Link**:
   - Right-click the file in Google Drive &rarr; Click **Share**.
   - Change access from *Restricted* to **"Anyone with the link can view"**.
   - Click **Copy Link**.
3. **Add Sermon to `sermons.js`**:
   - Open `sermons.js` in Notepad.
   - Copy one of the sermon blocks and paste your new sermon details at the top:

```javascript
{
  id: "sermon-7",
  title: "Your New Message Title",
  speaker: "Pastor Name",
  date: "2026-08-09",
  formattedDate: "August 9, 2026",
  category: "Sunday Service",
  series: "Series Title",
  scripture: "Mark 16:15",
  duration: "45:00",
  description: "Brief summary of the sermon...",
  driveUrl: "PASTE_YOUR_GOOGLE_DRIVE_LINK_HERE",
  featured: true
}
```

4. Save `sermons.js` and drag the folder onto Netlify again—your entire congregation will immediately see and download the new sermon on `cjgmmessages.com`!
