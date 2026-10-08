/**
 * QRCraft Studio - Core Application Logic
 * Pure Client-Side QR Code Engine with Custom Styling, Frames, Scanner, and History
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------
  const state = {
    activeType: 'url',
    qrData: 'https://example.com',
    dotsType: 'rounded',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
    
    // Coloring
    dotsColorMode: 'gradient', // 'solid' | 'gradient'
    dotsColor: '#6366f1',
    dotsGradientColor2: '#8b5cf6',
    dotsGradientType: 'linear',
    dotsGradientRotation: 45,

    cornersSquareColorMode: 'match', // 'match' | 'custom'
    cornersSquareColor: '#6366f1',

    cornersDotColorMode: 'match', // 'match' | 'custom'
    cornersDotColor: '#8b5cf6',

    bgColorMode: 'solid', // 'transparent' | 'solid'
    bgColor: '#ffffff',

    // Frame
    frameStyle: 'badge-bottom', // 'none' | 'badge-bottom' | 'polaroid' | 'banner-top' | 'neon-glow'
    frameText: 'SCAN ME',
    frameColor: '#6366f1',
    frameTextColor: '#ffffff',
    frameFont: "'Outfit', sans-serif",

    // Logo
    logoSrc: null,
    logoSize: 0.32,
    logoMargin: 6,
    logoBackgroundShape: 'circle', // 'none' | 'circle' | 'rounded'
    logoBgColor: '#ffffff',
    hideDotsBehindLogo: true,

    // Specs
    errorCorrectionLevel: 'H',
    margin: 16,
    exportResolution: 1024,
    theme: localStorage.getItem('qrcraft_theme') || 'dark'
  };

  // Preset Designer Themes
  const THEME_PRESETS = [
    {
      id: 'cyber-neon',
      name: 'Cyber Neon',
      dotsType: 'rounded',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',
      dotsColorMode: 'gradient',
      dotsColor: '#06b6d4',
      dotsGradientColor2: '#ec4899',
      dotsGradientRotation: 45,
      bgColorMode: 'solid',
      bgColor: '#0f172a',
      frameStyle: 'neon-glow',
      frameText: 'SCAN HERE',
      frameColor: '#06b6d4',
      frameTextColor: '#38bdf8'
    },
    {
      id: 'midnight-luxe',
      name: 'Midnight Luxe',
      dotsType: 'classy-rounded',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',
      dotsColorMode: 'gradient',
      dotsColor: '#f59e0b',
      dotsGradientColor2: '#d97706',
      dotsGradientRotation: 90,
      bgColorMode: 'solid',
      bgColor: '#111827',
      frameStyle: 'polaroid',
      frameText: 'EXCLUSIVE ACCESS',
      frameColor: '#1f2937',
      frameTextColor: '#fbbf24'
    },
    {
      id: 'emerald-mint',
      name: 'Emerald Mint',
      dotsType: 'dots',
      cornersSquareType: 'dot',
      cornersDotType: 'dot',
      dotsColorMode: 'gradient',
      dotsColor: '#059669',
      dotsGradientColor2: '#10b981',
      dotsGradientRotation: 135,
      bgColorMode: 'solid',
      bgColor: '#ffffff',
      frameStyle: 'badge-bottom',
      frameText: 'SCAN TO CONNECT',
      frameColor: '#059669',
      frameTextColor: '#ffffff'
    },
    {
      id: 'sunset-horizon',
      name: 'Sunset Horizon',
      dotsType: 'extra-rounded',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',
      dotsColorMode: 'gradient',
      dotsColor: '#f43f5e',
      dotsGradientColor2: '#8b5cf6',
      dotsGradientRotation: 45,
      bgColorMode: 'solid',
      bgColor: '#ffffff',
      frameStyle: 'badge-bottom',
      frameText: 'SCAN ME',
      frameColor: '#f43f5e',
      frameTextColor: '#ffffff'
    },
    {
      id: 'oceanic-blue',
      name: 'Oceanic Blue',
      dotsType: 'rounded',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',
      dotsColorMode: 'gradient',
      dotsColor: '#1d4ed8',
      dotsGradientColor2: '#06b6d4',
      dotsGradientRotation: 90,
      bgColorMode: 'solid',
      bgColor: '#ffffff',
      frameStyle: 'badge-bottom',
      frameText: 'VISIT WEBSITE',
      frameColor: '#1d4ed8',
      frameTextColor: '#ffffff'
    },
    {
      id: 'sleek-mono',
      name: 'Minimal Mono',
      dotsType: 'square',
      cornersSquareType: 'square',
      cornersDotType: 'square',
      dotsColorMode: 'solid',
      dotsColor: '#0f172a',
      bgColorMode: 'solid',
      bgColor: '#ffffff',
      frameStyle: 'polaroid',
      frameText: 'SCAN ME',
      frameColor: '#f8fafc',
      frameTextColor: '#0f172a'
    }
  ];

  // ---------------------------------------------------------------------------
  // Core QR Renderer Instance
  // ---------------------------------------------------------------------------
  let qrStylingInstance = null;
  const rawQrContainer = document.getElementById('qr-code-raw-target');
  const compositeCanvas = document.getElementById('qr-composite-canvas');
  const compositeCtx = compositeCanvas.getContext('2d');

  // Initialize Application
  function initApp() {
    applyTheme(state.theme);
    renderPresetSwatches();
    populateIconPicker();
    setupEventListeners();
    updateQRDataFromForm();
    initQRCodeStyling();
    loadHistoryList();
    checkContrastRatio();
  }

  // ---------------------------------------------------------------------------
  // Theme Toggle (Dark/Light)
  // ---------------------------------------------------------------------------
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('qrcraft_theme', theme);
    const themeIcon = document.getElementById('theme-toggle-icon');
    if (themeIcon) {
      themeIcon.innerHTML = theme === 'dark' 
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    }
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  // ---------------------------------------------------------------------------
  // Presets & Icons
  // ---------------------------------------------------------------------------
  function renderPresetSwatches() {
    const container = document.getElementById('presets-container');
    if (!container) return;
    container.innerHTML = '';

    THEME_PRESETS.forEach(preset => {
      const chip = document.createElement('div');
      chip.className = 'preset-chip';
      chip.dataset.id = preset.id;

      const previewDots = document.createElement('div');
      previewDots.className = 'preset-preview-dots';
      previewDots.style.background = preset.bgColorMode === 'transparent' ? '#334155' : preset.bgColor;
      
      const dot1 = document.createElement('div');
      dot1.style.width = '12px';
      dot1.style.height = '12px';
      dot1.style.borderRadius = preset.dotsType === 'dots' ? '50%' : '2px';
      dot1.style.background = preset.dotsColor;

      const dot2 = document.createElement('div');
      dot2.style.width = '12px';
      dot2.style.height = '12px';
      dot2.style.borderRadius = preset.dotsType === 'dots' ? '50%' : '2px';
      dot2.style.background = preset.dotsGradientColor2 || preset.dotsColor;

      previewDots.appendChild(dot1);
      previewDots.appendChild(dot2);

      const name = document.createElement('span');
      name.className = 'preset-name';
      name.textContent = preset.name;

      chip.appendChild(previewDots);
      chip.appendChild(name);

      chip.addEventListener('click', () => applyPresetTheme(preset));
      container.appendChild(chip);
    });
  }

  function applyPresetTheme(preset) {
    state.dotsType = preset.dotsType;
    state.cornersSquareType = preset.cornersSquareType;
    state.cornersDotType = preset.cornersDotType;
    state.dotsColorMode = preset.dotsColorMode;
    state.dotsColor = preset.dotsColor;
    if (preset.dotsGradientColor2) state.dotsGradientColor2 = preset.dotsGradientColor2;
    state.dotsGradientRotation = preset.dotsGradientRotation;
    state.bgColorMode = preset.bgColorMode;
    state.bgColor = preset.bgColor;
    state.frameStyle = preset.frameStyle;
    state.frameText = preset.frameText;
    state.frameColor = preset.frameColor;
    state.frameTextColor = preset.frameTextColor;

    syncUIFromState();
    triggerQRUpdate();
    showToast(`Applied preset: ${preset.name}`, 'info');
  }

  function populateIconPicker() {
    const container = document.getElementById('icon-picker-grid');
    if (!container || typeof PRESET_ICONS === 'undefined') return;
    container.innerHTML = '';

    PRESET_ICONS.forEach(icon => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'icon-chip-btn';
      btn.title = icon.name;
      btn.innerHTML = icon.svg;
      btn.addEventListener('click', () => {
        state.logoSrc = getSvgDataUri(icon.svg);
        showLogoPreviewBar(state.logoSrc, icon.name);
        triggerQRUpdate();
        showToast(`Selected icon: ${icon.name}`, 'info');
      });
      container.appendChild(btn);
    });
  }

  // ---------------------------------------------------------------------------
  // Data Generation for All Types
  // ---------------------------------------------------------------------------
  function updateQRDataFromForm() {
    const type = state.activeType;
    let data = '';

    switch (type) {
      case 'url': {
        let val = (document.getElementById('input-url')?.value || '').trim();
        if (val && !/^https?:\/\//i.test(val)) {
          val = 'https://' + val;
        }
        data = val || 'https://example.com';
        break;
      }
      case 'text': {
        data = document.getElementById('input-text')?.value || 'Hello World!';
        break;
      }
      case 'wifi': {
        const ssid = document.getElementById('wifi-ssid')?.value || 'MyWiFi';
        const pass = document.getElementById('wifi-pass')?.value || '';
        const enc = document.getElementById('wifi-enc')?.value || 'WPA';
        const hidden = document.getElementById('wifi-hidden')?.checked || false;
        // Escape special chars
        const esc = s => s.replace(/([\\;,:"])/g, '\\$1');
        data = `WIFI:T:${enc};S:${esc(ssid)};P:${esc(pass)};H:${hidden ? 'true' : 'false'};;`;
        break;
      }
      case 'vcard': {
        const first = document.getElementById('vcard-first')?.value || 'Alex';
        const last = document.getElementById('vcard-last')?.value || 'Morgan';
        const org = document.getElementById('vcard-org')?.value || 'Tech Innovators';
        const title = document.getElementById('vcard-title')?.value || 'Product Designer';
        const phone = document.getElementById('vcard-phone')?.value || '+1234567890';
        const email = document.getElementById('vcard-email')?.value || 'alex@example.com';
        const web = document.getElementById('vcard-web')?.value || 'https://example.com';
        const city = document.getElementById('vcard-city')?.value || 'San Francisco';
        const country = document.getElementById('vcard-country')?.value || 'USA';

        data = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${last};${first};;;`,
          `FN:${first} ${last}`,
          `ORG:${org}`,
          `TITLE:${title}`,
          `TEL;TYPE=CELL:${phone}`,
          `EMAIL:${email}`,
          `URL:${web}`,
          `ADR:;;;${city};;;${country}`,
          'END:VCARD'
        ].join('\n');
        break;
      }
      case 'email': {
        const mail = document.getElementById('email-address')?.value || 'hello@example.com';
        const subj = document.getElementById('email-subject')?.value || '';
        const body = document.getElementById('email-body')?.value || '';
        const params = [];
        if (subj) params.push(`subject=${encodeURIComponent(subj)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        data = `mailto:${mail}${params.length ? '?' + params.join('&') : ''}`;
        break;
      }
      case 'phone': {
        const num = document.getElementById('phone-number')?.value || '+1234567890';
        data = `tel:${num}`;
        break;
      }
      case 'sms': {
        const num = document.getElementById('sms-number')?.value || '+1234567890';
        const msg = document.getElementById('sms-message')?.value || '';
        data = `smsto:${num}:${msg}`;
        break;
      }
      case 'whatsapp': {
        let num = (document.getElementById('wa-number')?.value || '+1234567890').replace(/[^0-9]/g, '');
        const msg = document.getElementById('wa-message')?.value || '';
        data = `https://wa.me/${num}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
        break;
      }
      case 'crypto': {
        const coin = document.getElementById('crypto-coin')?.value || 'bitcoin';
        const addr = document.getElementById('crypto-address')?.value || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
        const amt = document.getElementById('crypto-amount')?.value || '';
        data = `${coin}:${addr}${amt ? '?amount=' + amt : ''}`;
        break;
      }
      case 'event': {
        const summary = document.getElementById('event-title')?.value || 'Product Launch Event';
        const loc = document.getElementById('event-loc')?.value || 'Main Auditorium';
        const desc = document.getElementById('event-desc')?.value || 'Annual unveiling';
        const dtstart = (document.getElementById('event-start')?.value || '20261010T090000Z').replace(/[-:]/g, '');
        const dtend = (document.getElementById('event-end')?.value || '20261010T170000Z').replace(/[-:]/g, '');

        data = [
          'BEGIN:VEVENT',
          `SUMMARY:${summary}`,
          `LOCATION:${loc}`,
          `DESCRIPTION:${desc}`,
          `DTSTART:${dtstart}`,
          `DTEND:${dtend}`,
          'END:VEVENT'
        ].join('\n');
        break;
      }
      default:
        data = 'https://example.com';
    }

    state.qrData = data;
  }

  // ---------------------------------------------------------------------------
  // Build Options Object for QRCodeStyling
  // ---------------------------------------------------------------------------
  function buildQRCodeStylingOptions(targetSize = 420) {
    const opts = {
      width: targetSize,
      height: targetSize,
      data: state.qrData,
      margin: state.margin,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: state.errorCorrectionLevel
      },
      dotsOptions: {
        type: state.dotsType
      },
      cornersSquareOptions: {
        type: state.cornersSquareType
      },
      cornersDotOptions: {
        type: state.cornersDotType
      },
      backgroundOptions: {},
      imageOptions: {
        crossOrigin: 'anonymous',
        hideBackgroundDots: state.hideDotsBehindLogo,
        imageSize: state.logoSize,
        margin: state.logoMargin
      }
    };

    // Dots color & gradient
    if (state.dotsColorMode === 'gradient') {
      const rad = (state.dotsGradientRotation * Math.PI) / 180;
      opts.dotsOptions.gradient = {
        type: state.dotsGradientType || 'linear',
        rotation: rad,
        colorStops: [
          { offset: 0, color: state.dotsColor },
          { offset: 1, color: state.dotsGradientColor2 }
        ]
      };
    } else {
      opts.dotsOptions.color = state.dotsColor;
    }

    // Corner Square color
    if (state.cornersSquareColorMode === 'custom') {
      opts.cornersSquareOptions.color = state.cornersSquareColor;
    } else {
      opts.cornersSquareOptions.color = state.dotsColor;
    }

    // Corner Dot color
    if (state.cornersDotColorMode === 'custom') {
      opts.cornersDotOptions.color = state.cornersDotColor;
    } else {
      opts.cornersDotOptions.color = state.dotsGradientColor2 || state.dotsColor;
    }

    // Background color
    if (state.bgColorMode === 'transparent') {
      opts.backgroundOptions.color = 'rgba(0,0,0,0)';
    } else {
      opts.backgroundOptions.color = state.bgColor;
    }

    // Image/Logo
    if (state.logoSrc) {
      opts.image = state.logoSrc;
    } else {
      delete opts.image;
    }

    return opts;
  }

  // ---------------------------------------------------------------------------
  // Initialize and Update QR Code
  // ---------------------------------------------------------------------------
  function initQRCodeStyling() {
    if (!window.QRCodeStyling) {
      console.error('QRCodeStyling library not loaded!');
      return;
    }
    const options = buildQRCodeStylingOptions(420);
    qrStylingInstance = new QRCodeStyling(options);

    rawQrContainer.innerHTML = '';
    qrStylingInstance.append(rawQrContainer);

    // Initial render composite after short tick for canvas generation
    setTimeout(() => {
      renderCompositeToCanvas();
    }, 150);
  }

  let renderDebounceTimer = null;
  function triggerQRUpdate() {
    clearTimeout(renderDebounceTimer);
    renderDebounceTimer = setTimeout(() => {
      updateQRDataFromForm();
      const options = buildQRCodeStylingOptions(420);
      if (qrStylingInstance) {
        qrStylingInstance.update(options);
      }
      setTimeout(() => {
        renderCompositeToCanvas();
        checkContrastRatio();
      }, 100);
    }, 60);
  }

  // ---------------------------------------------------------------------------
  // Canvas Compositor (Renders QR + Frame + Badge + Typography)
  // ---------------------------------------------------------------------------
  function renderCompositeToCanvas(customSize = null) {
    const rawCanvas = rawQrContainer.querySelector('canvas');
    if (!rawCanvas) return;

    const baseSize = customSize || 420;
    const frame = state.frameStyle;

    let totalWidth = baseSize;
    let totalHeight = baseSize;
    let qrOffsetY = 0;
    let qrOffsetX = 0;
    let qrDrawSize = baseSize;

    // Calculate dimensions based on Frame style
    if (frame === 'badge-bottom') {
      totalHeight = baseSize + 72;
      qrOffsetY = 12;
      qrOffsetX = 0;
    } else if (frame === 'polaroid') {
      totalWidth = baseSize + 48;
      totalHeight = baseSize + 110;
      qrOffsetX = 24;
      qrOffsetY = 24;
    } else if (frame === 'banner-top') {
      totalHeight = baseSize + 64;
      qrOffsetY = 56;
      qrOffsetX = 0;
    } else if (frame === 'neon-glow') {
      totalWidth = baseSize + 36;
      totalHeight = baseSize + 90;
      qrOffsetX = 18;
      qrOffsetY = 18;
    }

    // Size composite canvas
    compositeCanvas.width = totalWidth;
    compositeCanvas.height = totalHeight;
    compositeCtx.clearRect(0, 0, totalWidth, totalHeight);

    // 1. Draw Frame Background & Borders
    if (frame === 'polaroid') {
      // Polaroid Card
      compositeCtx.fillStyle = state.frameColor || '#ffffff';
      roundRect(compositeCtx, 0, 0, totalWidth, totalHeight, 20);
      compositeCtx.fill();
      
      // Subtle inner shadow / border
      compositeCtx.strokeStyle = 'rgba(0,0,0,0.08)';
      compositeCtx.lineWidth = 2;
      roundRect(compositeCtx, 0, 0, totalWidth, totalHeight, 20);
      compositeCtx.stroke();

    } else if (frame === 'neon-glow') {
      // Cyber neon card background
      compositeCtx.fillStyle = state.bgColorMode === 'transparent' ? '#0a0d14' : state.bgColor;
      roundRect(compositeCtx, 4, 4, totalWidth - 8, totalHeight - 8, 16);
      compositeCtx.fill();

      // Glowing border
      compositeCtx.strokeStyle = state.frameColor;
      compositeCtx.lineWidth = 3;
      compositeCtx.shadowColor = state.frameColor;
      compositeCtx.shadowBlur = 18;
      roundRect(compositeCtx, 4, 4, totalWidth - 8, totalHeight - 8, 16);
      compositeCtx.stroke();
      compositeCtx.shadowBlur = 0; // Reset shadow

    } else if (state.bgColorMode !== 'transparent') {
      // Normal background
      compositeCtx.fillStyle = state.bgColor;
      compositeCtx.fillRect(0, 0, totalWidth, totalHeight);
    }

    // 2. Draw QR Code
    compositeCtx.drawImage(rawCanvas, qrOffsetX, qrOffsetY, qrDrawSize, qrDrawSize);

    // 3. Draw Frame Badges & Text
    if (frame === 'badge-bottom') {
      const badgeHeight = 44;
      const badgeY = baseSize + 16;
      const text = state.frameText || 'SCAN ME';

      compositeCtx.font = `700 16px ${state.frameFont}`;
      const textMetrics = compositeCtx.measureText(text);
      const badgeWidth = Math.max(textMetrics.width + 48, 150);
      const badgeX = (totalWidth - badgeWidth) / 2;

      // Pill Background
      compositeCtx.fillStyle = state.frameColor;
      roundRect(compositeCtx, badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2);
      compositeCtx.fill();

      // Pill Text
      compositeCtx.fillStyle = state.frameTextColor;
      compositeCtx.textAlign = 'center';
      compositeCtx.textBaseline = 'middle';
      compositeCtx.fillText(text, totalWidth / 2, badgeY + badgeHeight / 2);

    } else if (frame === 'polaroid') {
      const text = state.frameText || 'SCAN ME';
      compositeCtx.fillStyle = state.frameTextColor || '#0f172a';
      compositeCtx.font = `800 18px ${state.frameFont}`;
      compositeCtx.textAlign = 'center';
      compositeCtx.textBaseline = 'middle';
      compositeCtx.fillText(text, totalWidth / 2, baseSize + 66);

    } else if (frame === 'banner-top') {
      const bannerHeight = 42;
      const text = state.frameText || 'SCAN ME';

      compositeCtx.fillStyle = state.frameColor;
      roundRect(compositeCtx, 16, 8, totalWidth - 32, bannerHeight, 10);
      compositeCtx.fill();

      compositeCtx.fillStyle = state.frameTextColor;
      compositeCtx.font = `700 15px ${state.frameFont}`;
      compositeCtx.textAlign = 'center';
      compositeCtx.textBaseline = 'middle';
      compositeCtx.fillText(text, totalWidth / 2, 8 + bannerHeight / 2);

    } else if (frame === 'neon-glow') {
      const text = state.frameText || 'SCAN HERE';
      compositeCtx.fillStyle = state.frameTextColor || state.frameColor;
      compositeCtx.font = `700 15px ${state.frameFont}`;
      compositeCtx.textAlign = 'center';
      compositeCtx.textBaseline = 'middle';
      compositeCtx.fillText(text, totalWidth / 2, baseSize + 52);
    }
  }

  // Helper function to draw rounded rectangles
  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // ---------------------------------------------------------------------------
  // Live Contrast & Scannability Checker
  // ---------------------------------------------------------------------------
  function checkContrastRatio() {
    const fg = state.dotsColor;
    const bg = state.bgColorMode === 'transparent' ? '#ffffff' : state.bgColor;

    function getLuminance(hex) {
      const rgb = hexToRgb(hex);
      if (!rgb) return 0.5;
      const a = [rgb.r, rgb.g, rgb.b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    const lum1 = getLuminance(fg);
    const lum2 = getLuminance(bg);
    const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);

    const indicatorPill = document.getElementById('contrast-pill');
    const indicatorText = document.getElementById('contrast-status-text');
    const ratioNumber = document.getElementById('contrast-ratio-value');

    if (ratioNumber) ratioNumber.textContent = `${ratio.toFixed(1)}:1`;

    if (ratio >= 4.5) {
      if (indicatorPill) indicatorPill.style.background = 'var(--success)';
      if (indicatorText) indicatorText.textContent = 'Excellent Scannability';
    } else if (ratio >= 3.0) {
      if (indicatorPill) indicatorPill.style.background = 'var(--warning)';
      if (indicatorText) indicatorText.textContent = 'Fair (Test with Camera)';
    } else {
      if (indicatorPill) indicatorPill.style.background = 'var(--danger)';
      if (indicatorText) indicatorText.textContent = 'Low Contrast (May Not Scan)';
    }
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    if (isNaN(num)) return null;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  // ---------------------------------------------------------------------------
  // Export Suite (High Resolution PNG, SVG, JPEG, WEBP, Copy, Print)
  // ---------------------------------------------------------------------------
  async function downloadComposite(format = 'png') {
    const res = parseInt(state.exportResolution, 10) || 1024;
    showToast(`Generating ${res}px ${format.toUpperCase()}...`, 'info');

    if (format === 'svg' && state.frameStyle === 'none' && qrStylingInstance) {
      qrStylingInstance.download({ name: 'qrcraft-code', extension: 'svg' });
      saveToHistory();
      showToast('SVG Vector downloaded!', 'success');
      return;
    }

    // High resolution offscreen canvas rendering
    const offscreenOpts = buildQRCodeStylingOptions(res);
    const tempQr = new QRCodeStyling(offscreenOpts);
    const hiddenDiv = document.createElement('div');
    hiddenDiv.style.display = 'none';
    document.body.appendChild(hiddenDiv);
    tempQr.append(hiddenDiv);

    setTimeout(() => {
      const renderedCanvas = hiddenDiv.querySelector('canvas');
      if (!renderedCanvas) {
        document.body.removeChild(hiddenDiv);
        return;
      }

      const frame = state.frameStyle;
      let totalWidth = res;
      let totalHeight = res;
      let qrOffsetX = 0;
      let qrOffsetY = 0;

      const scale = res / 420;

      if (frame === 'badge-bottom') {
        totalHeight = res + Math.round(72 * scale);
        qrOffsetY = Math.round(12 * scale);
      } else if (frame === 'polaroid') {
        totalWidth = res + Math.round(48 * scale);
        totalHeight = res + Math.round(110 * scale);
        qrOffsetX = Math.round(24 * scale);
        qrOffsetY = Math.round(24 * scale);
      } else if (frame === 'banner-top') {
        totalHeight = res + Math.round(64 * scale);
        qrOffsetY = Math.round(56 * scale);
      } else if (frame === 'neon-glow') {
        totalWidth = res + Math.round(36 * scale);
        totalHeight = res + Math.round(90 * scale);
        qrOffsetX = Math.round(18 * scale);
        qrOffsetY = Math.round(18 * scale);
      }

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = totalWidth;
      exportCanvas.height = totalHeight;
      const ctx = exportCanvas.getContext('2d');

      // Draw background / frame
      if (frame === 'polaroid') {
        ctx.fillStyle = state.frameColor || '#ffffff';
        roundRect(ctx, 0, 0, totalWidth, totalHeight, 20 * scale);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 2 * scale;
        roundRect(ctx, 0, 0, totalWidth, totalHeight, 20 * scale);
        ctx.stroke();
      } else if (frame === 'neon-glow') {
        ctx.fillStyle = state.bgColorMode === 'transparent' ? '#0a0d14' : state.bgColor;
        roundRect(ctx, 4 * scale, 4 * scale, totalWidth - 8 * scale, totalHeight - 8 * scale, 16 * scale);
        ctx.fill();
        ctx.strokeStyle = state.frameColor;
        ctx.lineWidth = 3 * scale;
        ctx.shadowColor = state.frameColor;
        ctx.shadowBlur = 18 * scale;
        roundRect(ctx, 4 * scale, 4 * scale, totalWidth - 8 * scale, totalHeight - 8 * scale, 16 * scale);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (state.bgColorMode !== 'transparent') {
        ctx.fillStyle = state.bgColor;
        ctx.fillRect(0, 0, totalWidth, totalHeight);
      }

      // Draw QR image
      ctx.drawImage(renderedCanvas, qrOffsetX, qrOffsetY, res, res);

      // Draw text
      const text = state.frameText || 'SCAN ME';
      if (frame === 'badge-bottom') {
        const badgeHeight = Math.round(44 * scale);
        const badgeY = res + Math.round(16 * scale);
        ctx.font = `700 ${Math.round(16 * scale)}px ${state.frameFont}`;
        const metrics = ctx.measureText(text);
        const badgeWidth = Math.max(metrics.width + Math.round(48 * scale), 150 * scale);
        const badgeX = (totalWidth - badgeWidth) / 2;

        ctx.fillStyle = state.frameColor;
        roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2);
        ctx.fill();

        ctx.fillStyle = state.frameTextColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, totalWidth / 2, badgeY + badgeHeight / 2);
      } else if (frame === 'polaroid') {
        ctx.fillStyle = state.frameTextColor || '#0f172a';
        ctx.font = `800 ${Math.round(18 * scale)}px ${state.frameFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, totalWidth / 2, res + Math.round(66 * scale));
      } else if (frame === 'banner-top') {
        const bannerHeight = Math.round(42 * scale);
        ctx.fillStyle = state.frameColor;
        roundRect(ctx, 16 * scale, 8 * scale, totalWidth - 32 * scale, bannerHeight, 10 * scale);
        ctx.fill();
        ctx.fillStyle = state.frameTextColor;
        ctx.font = `700 ${Math.round(15 * scale)}px ${state.frameFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, totalWidth / 2, 8 * scale + bannerHeight / 2);
      } else if (frame === 'neon-glow') {
        ctx.fillStyle = state.frameTextColor || state.frameColor;
        ctx.font = `700 ${Math.round(15 * scale)}px ${state.frameFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, totalWidth / 2, res + Math.round(52 * scale));
      }

      // Convert to blob and download
      const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
      exportCanvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qrcraft-code-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        document.body.removeChild(hiddenDiv);
        saveToHistory();
        showToast(`Downloaded as ${format.toUpperCase()} (${res}px)!`, 'success');
      }, mime, 0.95);
    }, 160);
  }

  // Copy to Clipboard
  async function copyToClipboard() {
    try {
      compositeCanvas.toBlob(async blob => {
        if (!blob) throw new Error('Could not create blob');
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('QR Code copied to clipboard!', 'success');
      });
    } catch (err) {
      console.error(err);
      showToast('Clipboard copy failed. Try downloading instead.', 'error');
    }
  }

  // Print Dialog
  function printQRCode() {
    window.print();
  }

  // ---------------------------------------------------------------------------
  // Scanner Tool (Decode QR codes with jsQR)
  // ---------------------------------------------------------------------------
  function openScannerModal() {
    const modal = document.getElementById('scanner-modal');
    if (modal) modal.classList.add('open');
  }

  function closeScannerModal() {
    const modal = document.getElementById('scanner-modal');
    if (modal) modal.classList.remove('open');
  }

  function handleScannerFileUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const scanCanvas = document.createElement('canvas');
        scanCanvas.width = img.width;
        scanCanvas.height = img.height;
        const sctx = scanCanvas.getContext('2d');
        sctx.drawImage(img, 0, 0);

        const imgData = sctx.getImageData(0, 0, img.width, img.height);
        if (typeof jsQR !== 'undefined') {
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code) {
            handleDecodedQRData(code.data);
            closeScannerModal();
            showToast('QR Code Decoded Successfully!', 'success');
          } else {
            showToast('No readable QR code found in this image.', 'error');
          }
        } else {
          showToast('Scanner module unavailable.', 'error');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function handleDecodedQRData(decodedString) {
    // Detect content type and populate appropriate inputs
    if (/^https?:\/\//i.test(decodedString)) {
      switchTab('url');
      const input = document.getElementById('input-url');
      if (input) input.value = decodedString;
    } else if (/^WIFI:/i.test(decodedString)) {
      switchTab('wifi');
      const mSsid = decodedString.match(/S:([^;]+);/);
      const mPass = decodedString.match(/P:([^;]+);/);
      const mEnc = decodedString.match(/T:([^;]+);/);
      if (mSsid && document.getElementById('wifi-ssid')) document.getElementById('wifi-ssid').value = mSsid[1].replace(/\\([\\;,:"])/g, '$1');
      if (mPass && document.getElementById('wifi-pass')) document.getElementById('wifi-pass').value = mPass[1].replace(/\\([\\;,:"])/g, '$1');
      if (mEnc && document.getElementById('wifi-enc')) document.getElementById('wifi-enc').value = mEnc[1];
    } else if (/^BEGIN:VCARD/i.test(decodedString)) {
      switchTab('vcard');
      const fn = decodedString.match(/FN:([^\n\r]+)/);
      const tel = decodedString.match(/TEL.*:([^\n\r]+)/);
      const mail = decodedString.match(/EMAIL.*:([^\n\r]+)/);
      if (fn && document.getElementById('vcard-first')) document.getElementById('vcard-first').value = fn[1];
      if (tel && document.getElementById('vcard-phone')) document.getElementById('vcard-phone').value = tel[1];
      if (mail && document.getElementById('vcard-email')) document.getElementById('vcard-email').value = mail[1];
    } else {
      switchTab('text');
      const input = document.getElementById('input-text');
      if (input) input.value = decodedString;
    }

    triggerQRUpdate();
  }

  // ---------------------------------------------------------------------------
  // History Management (LocalStorage)
  // ---------------------------------------------------------------------------
  function saveToHistory() {
    try {
      const history = JSON.parse(localStorage.getItem('qrcraft_history') || '[]');
      const thumb = compositeCanvas.toDataURL('image/png', 0.5);
      const item = {
        id: 'qr_' + Date.now(),
        date: new Date().toLocaleDateString(),
        data: state.qrData,
        type: state.activeType,
        thumb: thumb,
        state: { ...state, logoSrc: null } // avoid storing big logo strings
      };
      // Keep latest 8 items
      history.unshift(item);
      if (history.length > 8) history.pop();
      localStorage.setItem('qrcraft_history', JSON.stringify(history));
      loadHistoryList();
    } catch (e) {
      console.warn('LocalStorage limit reached', e);
    }
  }

  function loadHistoryList() {
    const container = document.getElementById('history-items-grid');
    if (!container) return;
    const history = JSON.parse(localStorage.getItem('qrcraft_history') || '[]');

    if (history.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;padding:8px;">No saved codes yet. Create and download to save history!</div>';
      return;
    }

    container.innerHTML = '';
    history.forEach(item => {
      const card = document.createElement('div');
      card.className = 'preset-chip';
      card.title = item.data;

      const img = document.createElement('img');
      img.src = item.thumb;
      img.style.width = '48px';
      img.style.height = '48px';
      img.style.objectFit = 'contain';
      img.style.borderRadius = '4px';

      const label = document.createElement('span');
      label.className = 'preset-name';
      label.textContent = item.type.toUpperCase();

      card.appendChild(img);
      card.appendChild(label);

      card.addEventListener('click', () => {
        Object.assign(state, item.state);
        syncUIFromState();
        triggerQRUpdate();
        showToast('Restored QR design from history!', 'info');
      });

      container.appendChild(card);
    });
  }

  // ---------------------------------------------------------------------------
  // UI Synchronization from State
  // ---------------------------------------------------------------------------
  function syncUIFromState() {
    // Dot styles
    document.querySelectorAll('.shape-btn[data-shape-target="dots"]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.shape === state.dotsType);
    });
    // Corners Square
    document.querySelectorAll('.shape-btn[data-shape-target="cornersSquare"]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.shape === state.cornersSquareType);
    });
    // Corners Dot
    document.querySelectorAll('.shape-btn[data-shape-target="cornersDot"]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.shape === state.cornersDotType);
    });

    // Colors
    if (document.getElementById('dots-color-picker')) document.getElementById('dots-color-picker').value = state.dotsColor;
    if (document.getElementById('dots-color-hex')) document.getElementById('dots-color-hex').value = state.dotsColor;
    if (document.getElementById('dots-color-2-picker')) document.getElementById('dots-color-2-picker').value = state.dotsGradientColor2;
    if (document.getElementById('dots-color-2-hex')) document.getElementById('dots-color-2-hex').value = state.dotsGradientColor2;
    if (document.getElementById('bg-color-picker')) document.getElementById('bg-color-picker').value = state.bgColor;
    if (document.getElementById('bg-color-hex')) document.getElementById('bg-color-hex').value = state.bgColor;

    // Frame
    document.querySelectorAll('.frame-card-option').forEach(card => {
      card.classList.toggle('active', card.dataset.frame === state.frameStyle);
    });
    if (document.getElementById('frame-text-input')) document.getElementById('frame-text-input').value = state.frameText;
    if (document.getElementById('frame-color-picker')) document.getElementById('frame-color-picker').value = state.frameColor;
    if (document.getElementById('frame-text-color-picker')) document.getElementById('frame-text-color-picker').value = state.frameTextColor;
  }

  function switchTab(type) {
    state.activeType = type;
    document.querySelectorAll('.type-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });
    document.querySelectorAll('.content-form-section').forEach(sec => {
      sec.style.display = sec.dataset.type === type ? 'block' : 'none';
    });
  }

  function showLogoPreviewBar(src, name = 'Logo') {
    const previewBar = document.getElementById('logo-active-bar');
    const thumb = document.getElementById('logo-thumb-img');
    const label = document.getElementById('logo-name-display');
    if (previewBar && thumb) {
      thumb.src = src;
      if (label) label.textContent = name;
      previewBar.style.display = 'flex';
    }
  }

  function removeLogo() {
    state.logoSrc = null;
    const previewBar = document.getElementById('logo-active-bar');
    if (previewBar) previewBar.style.display = 'none';
    const logoFile = document.getElementById('logo-file-input');
    if (logoFile) logoFile.value = '';
    triggerQRUpdate();
    showToast('Removed logo', 'info');
  }

  // ---------------------------------------------------------------------------
  // Toast Notifications
  // ---------------------------------------------------------------------------
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span style="font-size:1.1rem">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // ---------------------------------------------------------------------------
  // Event Listeners Setup
  // ---------------------------------------------------------------------------
  function setupEventListeners() {
    // Theme Switcher
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // Content Type Tabs
    document.querySelectorAll('.type-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.dataset.type);
        triggerQRUpdate();
      });
    });

    // Form Inputs Change
    const editorRoot = document.getElementById('content-forms-container');
    if (editorRoot) {
      editorRoot.addEventListener('input', triggerQRUpdate);
      editorRoot.addEventListener('change', triggerQRUpdate);
    }

    // Dot Body Shape
    document.querySelectorAll('.shape-btn[data-shape-target="dots"]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.dotsType = btn.dataset.shape;
        document.querySelectorAll('.shape-btn[data-shape-target="dots"]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        triggerQRUpdate();
      });
    });

    // Corner Square Outer Shape
    document.querySelectorAll('.shape-btn[data-shape-target="cornersSquare"]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.cornersSquareType = btn.dataset.shape;
        document.querySelectorAll('.shape-btn[data-shape-target="cornersSquare"]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        triggerQRUpdate();
      });
    });

    // Corner Dot Inner Pupil Shape
    document.querySelectorAll('.shape-btn[data-shape-target="cornersDot"]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.cornersDotType = btn.dataset.shape;
        document.querySelectorAll('.shape-btn[data-shape-target="cornersDot"]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        triggerQRUpdate();
      });
    });

    // Color Pickers & Hex Inputs
    bindColorPair('dots-color-picker', 'dots-color-hex', val => { state.dotsColor = val; });
    bindColorPair('dots-color-2-picker', 'dots-color-2-hex', val => { state.dotsGradientColor2 = val; });
    bindColorPair('bg-color-picker', 'bg-color-hex', val => { state.bgColor = val; });
    bindColorPair('corner-square-color-picker', 'corner-square-color-hex', val => { 
      state.cornersSquareColor = val; 
      state.cornersSquareColorMode = 'custom';
    });
    bindColorPair('corner-dot-color-picker', 'corner-dot-color-hex', val => { 
      state.cornersDotColor = val; 
      state.cornersDotColorMode = 'custom';
    });
    bindColorPair('frame-color-picker', null, val => { state.frameColor = val; });
    bindColorPair('frame-text-color-picker', null, val => { state.frameTextColor = val; });

    // Dots Color Mode (Solid vs Gradient)
    document.querySelectorAll('.dots-mode-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.dots-mode-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.dotsColorMode = tab.dataset.mode;
        const gradControls = document.getElementById('dots-gradient-controls');
        if (gradControls) gradControls.style.display = state.dotsColorMode === 'gradient' ? 'block' : 'none';
        triggerQRUpdate();
      });
    });

    // Dots Gradient Angle Slider
    const angleSlider = document.getElementById('dots-gradient-angle');
    if (angleSlider) {
      angleSlider.addEventListener('input', e => {
        state.dotsGradientRotation = parseInt(e.target.value, 10);
        const display = document.getElementById('dots-angle-value');
        if (display) display.textContent = `${state.dotsGradientRotation}°`;
        triggerQRUpdate();
      });
    }

    // Background Transparent Toggle
    const bgTransToggle = document.getElementById('bg-transparent-toggle');
    if (bgTransToggle) {
      bgTransToggle.addEventListener('change', e => {
        state.bgColorMode = e.target.checked ? 'transparent' : 'solid';
        const bgPickerRow = document.getElementById('bg-color-picker-row');
        if (bgPickerRow) bgPickerRow.style.opacity = e.target.checked ? '0.4' : '1';
        triggerQRUpdate();
      });
    }

    // Frames Selection
    document.querySelectorAll('.frame-card-option').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.frame-card-option').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        state.frameStyle = card.dataset.frame;
        const frameOpts = document.getElementById('frame-custom-controls');
        if (frameOpts) frameOpts.style.display = state.frameStyle === 'none' ? 'none' : 'block';
        triggerQRUpdate();
      });
    });

    // Frame Text Input
    const frameTextInput = document.getElementById('frame-text-input');
    if (frameTextInput) {
      frameTextInput.addEventListener('input', e => {
        state.frameText = e.target.value;
        triggerQRUpdate();
      });
    }

    // Logo Upload Dropzone
    const dropzone = document.getElementById('logo-dropzone');
    const fileInput = document.getElementById('logo-file-input');
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', e => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
      dropzone.addEventListener('drop', e => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
          handleLogoFile(e.dataTransfer.files[0]);
        }
      });
      fileInput.addEventListener('change', e => {
        if (e.target.files.length) handleLogoFile(e.target.files[0]);
      });
    }

    const removeLogoBtn = document.getElementById('btn-remove-logo');
    if (removeLogoBtn) removeLogoBtn.addEventListener('click', removeLogo);

    // Logo Size Slider
    const logoSizeSlider = document.getElementById('logo-size-slider');
    if (logoSizeSlider) {
      logoSizeSlider.addEventListener('input', e => {
        state.logoSize = parseFloat(e.target.value);
        const display = document.getElementById('logo-size-value');
        if (display) display.textContent = `${Math.round(state.logoSize * 100)}%`;
        triggerQRUpdate();
      });
    }

    // Error Correction Level
    const ecSelect = document.getElementById('error-correction-select');
    if (ecSelect) {
      ecSelect.addEventListener('change', e => {
        state.errorCorrectionLevel = e.target.value;
        triggerQRUpdate();
      });
    }

    // Margin Slider
    const marginSlider = document.getElementById('margin-slider');
    if (marginSlider) {
      marginSlider.addEventListener('input', e => {
        state.margin = parseInt(e.target.value, 10);
        const display = document.getElementById('margin-value');
        if (display) display.textContent = `${state.margin}px`;
        triggerQRUpdate();
      });
    }

    // Export Resolution Select
    const resSelect = document.getElementById('export-resolution-select');
    if (resSelect) {
      resSelect.addEventListener('change', e => {
        state.exportResolution = parseInt(e.target.value, 10);
      });
    }

    // Accordions
    document.querySelectorAll('.custom-section-accordion').forEach(acc => {
      const header = acc.querySelector('.accordion-header');
      if (header) {
        header.addEventListener('click', () => {
          acc.classList.toggle('open');
        });
      }
    });

    // FAQ Accordion
    document.querySelectorAll('.faq-card').forEach(faq => {
      const q = faq.querySelector('.faq-question');
      if (q) {
        q.addEventListener('click', () => {
          faq.classList.toggle('open');
        });
      }
    });

    // Download Buttons
    document.getElementById('btn-download-png')?.addEventListener('click', () => downloadComposite('png'));
    document.getElementById('btn-download-svg')?.addEventListener('click', () => downloadComposite('svg'));
    document.getElementById('btn-download-jpeg')?.addEventListener('click', () => downloadComposite('jpeg'));
    document.getElementById('btn-download-webp')?.addEventListener('click', () => downloadComposite('webp'));
    document.getElementById('btn-copy-clipboard')?.addEventListener('click', copyToClipboard);
    document.getElementById('btn-print-qr')?.addEventListener('click', printQRCode);

    // Mobile Sticky Dock Actions
    document.getElementById('mobile-dock-jump-btn')?.addEventListener('click', () => {
      document.getElementById('live-preview-section')?.scrollIntoView({ behavior: 'smooth' });
    });
    document.getElementById('btn-mobile-download-png')?.addEventListener('click', () => downloadComposite('png'));
    document.getElementById('btn-mobile-copy')?.addEventListener('click', copyToClipboard);

    // Scanner Modal
    document.getElementById('btn-open-scanner')?.addEventListener('click', openScannerModal);
    document.getElementById('modal-close-scanner')?.addEventListener('click', closeScannerModal);
    document.getElementById('scanner-file-input')?.addEventListener('change', e => {
      if (e.target.files.length) handleScannerFileUpload(e.target.files[0]);
    });
  }

  function handleLogoFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please upload a PNG, JPG, or SVG image', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      state.logoSrc = e.target.result;
      showLogoPreviewBar(state.logoSrc, file.name);
      triggerQRUpdate();
      showToast('Custom logo uploaded!', 'success');
    };
    reader.readAsDataURL(file);
  }

  function bindColorPair(pickerId, hexId, onValue) {
    const picker = document.getElementById(pickerId);
    const hexInput = hexId ? document.getElementById(hexId) : null;

    if (picker) {
      picker.addEventListener('input', e => {
        const val = e.target.value;
        if (hexInput) hexInput.value = val;
        onValue(val);
        triggerQRUpdate();
      });
    }

    if (hexInput) {
      hexInput.addEventListener('input', e => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9a-f]{6}$/i.test(val)) {
          picker.value = val;
          onValue(val);
          triggerQRUpdate();
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Bootstrapping on DOM Load
  // ---------------------------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
