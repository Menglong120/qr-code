# QRCraft Studio 🚀

> **The Ultimate Client-Side Custom QR Code Designer & Generator**
> Built with pure HTML5, CSS3, and JavaScript — 100% frontend-only, SEO-optimized, and Google AdSense-monetized.

![QRCraft Studio Preview](https://raw.githubusercontent.com/Menglong120/qr-code/main/preview.png)

---

## ✨ Features

- **10 QR Content Types**:
  - Website URL (with auto `https://`)
  - Plain Text & Notes
  - Wi-Fi Network (SSID, Password, WPA/WPA2/WPA3, Hidden SSID toggle)
  - vCard Digital Contact Card (vCard 3.0 standard)
  - Email (Recipient, Subject, Body)
  - Direct Phone Call
  - SMS Message
  - WhatsApp Direct Chat Link
  - Cryptocurrency (Bitcoin, Ethereum, Solana, USDT)
  - iCal Calendar Event
- **Extensive Styling & Customization**:
  - **Body Shapes**: Square, Rounded, Dots, Classy, Classy Rounded, Smooth Extra-Rounded
  - **Corner Eye Shapes**: Square, Rounded, Circle Dot
  - **Coloring**: Solid Color & Multi-Stop Linear Gradient with interactive $0^\circ - 360^\circ$ angle slider
  - **Independent Eye Colors**: Customize inner pupil and outer frame colors independently
  - **Transparent Background**: Toggle transparent background for stickers and overlays
  - **Logo & Icons**: Drag-and-drop custom logo upload + 18 built-in SVG vector brand icons
  - **"Scan Me" Call-to-Action Frames**: Bottom Pill Badge, Polaroid Card, Top Banner, Neon Cyber Glow
- **Fully Responsive**:
  - Mobile-First layout: Live preview is pinned at the top on mobile and tablet devices
  - Floating mobile action dock with quick 1-tap download
  - Auto-scaling canvas that smoothly adapts down to 320px screens without overflow
- **Export & Quality**:
  - High-Resolution PNG (512px up to 4096px Ultra-HD / 300 DPI)
  - Lossless Vector SVG for professional print production
  - JPEG & next-gen WebP
  - 1-Click Clipboard Copy & Direct Print dialog
  - Error correction levels: Low (7%), Medium (15%), Quartile (25%), High (30% for logos)
  - Live Contrast & Scannability indicator
- **QR Scanner & Decoder**:
  - Upload any QR image to decode and automatically pre-fill the generator
- **100% Client-Side Privacy**:
  - No data is ever transmitted to any remote server. Everything renders directly inside the browser.
- **Monetization & SEO Ready**:
  - Google AdSense verified (`ads.txt`, meta verification, and IAB responsive ad units)
  - Schema.org JSON-LD structured data (`WebApplication` and `FAQPage`)
  - Semantic HTML5, `robots.txt`, and `sitemap.xml`

---

## 🛠️ Technology Stack

- **Core**: Vanilla HTML5, Vanilla JavaScript (ES6+)
- **Styling**: Vanilla CSS (CSS Custom Properties, Glassmorphism, CSS Grid, Flexbox)
- **Engines**: Local embedded `qr-code-styling` engine & `jsQR` scanner engine

---

## 🚀 Getting Started

Since QRCraft Studio is 100% frontend-only, no build step or node installation is needed!

### Option 1: Open Directly
Double-click `index.html` to open it in any modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Run Local Server
```bash
# Python
python -m http.server 8080

# Or with Node
npx serve .
```
Navigate to `http://localhost:8080`.

---

## 📄 License

MIT License — Feel free to use and customize for personal or commercial projects.
