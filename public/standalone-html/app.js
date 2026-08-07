// Anti-Inspect & DevTools Hiding Script
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});

document.addEventListener('keydown', function (e) {
  if (
    e.keyCode === 123 || // F12
    (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || // Ctrl+Shift+I/J/C
    (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
    (e.ctrlKey && e.keyCode === 83)    // Ctrl+S
  ) {
    e.preventDefault();
    return false;
  }
});

document.addEventListener('dragstart', function (e) {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'SVG' || e.target.tagName === 'CANVAS') {
    e.preventDefault();
  }
});

// Override Console & Auto-Clear Logs
(function () {
  var noop = function () {};
  window.console.log = noop;
  window.console.warn = noop;
  window.console.error = noop;
  window.console.info = noop;
  window.console.debug = noop;
  window.console.dir = noop;
  setInterval(function () {
    console.clear();
  }, 300);
})();

// Debugger Trap & DevTools Detector
(function () {
  setInterval(function () {
    (function () {
      return false;
    })['constructor']('debugger')['call']();
  }, 500);
})();

// HH GOA 2026 - Standalone JavaScript Engine
let activeFormat = 'formatA';
let userPhoto = null;
let nameVal = '';
let roleVal = '';
let builderTitleVal = 'SMART CONTRACT WIZARD';
let superpowerVal = 'Converting Coffee & Feni into Zero-Bug Code';
let zoomVal = 1.0;
let panXVal = 0;
let panYVal = 0;
let activePreset = 'emerald';

const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('photoUpload');

// Color Tokens matching exact spec:
// --bg: #042f1b, --bg2: #08361f, --primary: #FFD400, --accent: #FF1F8F, --secondary: #22C55E, --white: #F9FAFB, --muted: #9CA3AF, --divider: #165B37
const PALETTES = {
  emerald: { bg: '#042f1b', bg2: '#08361f', accent: '#FFD400', highlight: '#FF1F8F', secondary: '#22C55E', white: '#F9FAFB', muted: '#9CA3AF', divider: '#165B37' },
  sunset: { bg: '#4A1503', bg2: '#C84B15', accent: '#FFD400', highlight: '#FF8800', secondary: '#FFC870', white: '#F9FAFB', muted: '#9CA3AF', divider: '#882200' },
  cyber: { bg: '#040B18', bg2: '#0B1D3A', accent: '#00FFCC', highlight: '#FF1F8F', secondary: '#00FF9D', white: '#F9FAFB', muted: '#9CA3AF', divider: '#0A3B5C' },
  midnight: { bg: '#011212', bg2: '#062B2B', accent: '#FFD400', highlight: '#FF1F8F', secondary: '#00FF9D', white: '#F9FAFB', muted: '#005C5C', divider: '#005C5C' }
};

// Handle Tab Switching
function setFormat(fmt) {
  activeFormat = fmt;
  document.getElementById('tabA').classList.toggle('active', fmt === 'formatA');
  document.getElementById('tabB').classList.toggle('active', fmt === 'formatB');
  renderCanvas();
}

// Handle Photo Upload
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        userPhoto = img;
        panXVal = 0;
        panYVal = 0;
        zoomVal = 1.0;
        renderCanvas();
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Canvas Click Triggers Upload
canvas.addEventListener('click', () => {
  fileInput.click();
});

// Render Function
function renderCanvas() {
  const w = canvas.width;
  const h = canvas.height;
  const pal = PALETTES[activePreset] || PALETTES.emerald;

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, pal.bg2);
  bgGrad.addColorStop(1, pal.bg);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Outer Border
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(16, 16, w - 32, h - 32, 24);
  ctx.stroke();

  // Corner Sparkles
  ctx.fillStyle = pal.accent;
  ctx.font = '22px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('✦', 34, 38);
  ctx.fillText('✦', w - 34, 38);

  if (activeFormat === 'formatA') {
    // Format A PFP Render
    const framePadding = 65;
    const cropW = w - framePadding * 2;
    const cropH = h - framePadding * 2 - 120;
    const cropX = framePadding;
    const cropY = framePadding + 65;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cropX, cropY, cropW, cropH, 32);
    ctx.clip();

    ctx.fillStyle = pal.bg;
    ctx.fillRect(cropX, cropY, cropW, cropH);

    if (userPhoto) {
      const imgAspect = userPhoto.width / userPhoto.height;
      const cropAspect = cropW / cropH;
      let drawW, drawH;
      if (imgAspect > cropAspect) {
        drawH = cropH * zoomVal;
        drawW = cropH * imgAspect * zoomVal;
      } else {
        drawW = cropW * zoomVal;
        drawH = (cropW / imgAspect) * zoomVal;
      }
      const imgX = cropX + (cropW - drawW) / 2 + panXVal;
      const imgY = cropY + (cropH - drawH) / 2 + panYVal;
      ctx.drawImage(userPhoto, imgX, imgY, drawW, drawH);
    } else {
      ctx.fillStyle = pal.accent;
      ctx.font = '700 24px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('📷 TAP TO UPLOAD YOUR PHOTO DIRECTLY', cropX + cropW / 2, cropY + cropH / 2);
    }
    ctx.restore();

    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cropX, cropY, cropW, cropH, 32);
    ctx.stroke();

    // Dark gradient backdrop for hero title banner
    ctx.save();
    const bannerY = h - 210;
    const bannerH = 180;
    const bannerGrad = ctx.createLinearGradient(0, bannerY, 0, bannerY + bannerH);
    bannerGrad.addColorStop(0, 'rgba(4, 47, 27, 0.0)');
    bannerGrad.addColorStop(0.25, 'rgba(4, 47, 27, 0.90)');
    bannerGrad.addColorStop(1, 'rgba(4, 47, 27, 0.99)');
    ctx.fillStyle = bannerGrad;
    ctx.fillRect(0, bannerY, w, bannerH);
    ctx.restore();

    // QR Code Badge in RED MARKED AREA (Bottom-Left Corner!)
    const qrSize = 95;
    const qrX = 45;
    const qrY = h - 145;

    ctx.save();
    ctx.fillStyle = pal.bg;
    ctx.beginPath();
    ctx.roundRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 22, 12);
    ctx.fill();
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = pal.accent;
    ctx.font = '700 11px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HHGOA.COM ↗', qrX + qrSize / 2, qrY + qrSize + 12);
    ctx.restore();

    // Right Bottom Hashtag Box Badge (Sleek container - NO OVERLAP!)
    ctx.save();
    const tagBoxW = 220;
    const tagBoxH = 85;
    const tagBoxX = w - 45 - tagBoxW;
    const tagBoxY = h - 145;

    ctx.fillStyle = pal.bg;
    ctx.beginPath();
    ctx.roundRect(tagBoxX, tagBoxY, tagBoxW, tagBoxH, 12);
    ctx.fill();
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = pal.accent;
    ctx.font = '700 18px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('#FrameInGoa', tagBoxX + tagBoxW / 2, tagBoxY + 26);

    ctx.fillStyle = pal.highlight;
    ctx.font = '600 13px "IBM Plex Mono", monospace';
    ctx.fillText('🍹 BRED ON CODE', tagBoxX + tagBoxW / 2, tagBoxY + 48);

    ctx.fillStyle = pal.secondary;
    ctx.font = '600 13px "IBM Plex Mono", monospace';
    ctx.fillText('28-31 OCT 2026 ✦', tagBoxX + tagBoxW / 2, tagBoxY + 68);
    ctx.restore();

    ctx.fillStyle = pal.accent;
    ctx.font = '700 18px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('🌴 HACKER HOUSE GOA 2026', 70, 60);
    ctx.textAlign = 'right';
    ctx.fillText('GOA, INDIA · 28-31 OCT', w - 70, 60);

    // Hero Title Bar: HACKER   HOUSE (Anton 78px) with centered Goa logo
    ctx.save();
    ctx.fillStyle = pal.accent;
    ctx.font = '400 78px "Anton", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 24;
    ctx.fillText('HACKER   HOUSE', w / 2, h - 122);

    ctx.fillStyle = pal.highlight;
    ctx.font = '800 54px sans-serif';
    ctx.fillText('गोवा', w / 2, h - 122);
    ctx.restore();

    // Footer Metadata Line (No DEVELOPED BY!)
    ctx.fillStyle = pal.muted;
    ctx.font = '600 18px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🌴 BRED ON CODE & COCONUT WATER · 28-31 OCT 2026 🌴', w / 2, h - 22);
  } else {
    // Format B Redesigned 2-Column Render
    const headerY = 38;

    // HACKER HOUSE in Playfair Display serif font (62px bold)
    ctx.fillStyle = pal.accent;
    ctx.font = '900 62px "Playfair Display", serif';
    ctx.textAlign = 'left';
    ctx.fillText('HACKER', 45, headerY + 54);
    ctx.fillText('HOUSE', 45, headerY + 118);

    ctx.fillStyle = pal.highlight;
    ctx.font = '800 54px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('गोवा', 490, headerY + 85);

    ctx.fillStyle = pal.accent;
    ctx.font = '700 22px "Space Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('2026 BUILDER BADGE', w - 45, headerY + 48);
    ctx.font = '600 16px "IBM Plex Mono", monospace';
    ctx.fillText('GOA, INDIA · 28-31 OCT', w - 45, headerY + 80);

    ctx.strokeStyle = pal.divider;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(45, 185);
    ctx.lineTo(w - 45, 185);
    ctx.stroke();

    // Left Column Photo (Width: 485px, Height: 720px)
    const photoX = 42;
    const photoY = 195;
    const photoW = 485;
    const photoH = 720;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, 20);
    ctx.clip();
    ctx.fillStyle = pal.bg;
    ctx.fillRect(photoX, photoY, photoW, photoH);

    if (userPhoto) {
      const imgAspect = userPhoto.width / userPhoto.height;
      const cropAspect = photoW / photoH;
      let drawW, drawH;
      if (imgAspect > cropAspect) {
        drawH = photoH * zoomVal;
        drawW = photoH * imgAspect * zoomVal;
      } else {
        drawW = photoW * zoomVal;
        drawH = (photoW / imgAspect) * zoomVal;
      }
      const imgX = photoX + (photoW - drawW) / 2 + panXVal;
      const imgY = photoY + (photoH - drawH) / 2 + panYVal;
      ctx.drawImage(userPhoto, imgX, imgY, drawW, drawH);
    }
    ctx.restore();

    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, 20);
    ctx.stroke();

    // Stamp Badge (Bottom-Left)
    drawStampSeal(ctx, photoX + 95, photoY + photoH - 70, 85, pal);

    // Right Column Info Stacked (475px width!)
    const rightX = 560;
    const rightMaxW = 475;
    let currentY = 205;

    ctx.fillStyle = pal.secondary;
    ctx.font = '700 22px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('BUILDER NAME', rightX, currentY);

    if (nameVal && nameVal.trim() !== '') {
      ctx.fillStyle = pal.white;
      ctx.font = '700 140px "Teko", sans-serif';
      ctx.fillText(nameVal.trim().toUpperCase(), rightX, currentY + 95);

      ctx.fillStyle = pal.accent;
      ctx.beginPath();
      ctx.roundRect(rightX, currentY + 112, rightMaxW, 8, 4);
      ctx.fill();
      currentY += 140;
    } else {
      currentY += 45;
    }

    ctx.strokeStyle = pal.divider;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rightX, currentY);
    ctx.lineTo(w - 42, currentY);
    ctx.stroke();

    currentY += 30;
    ctx.fillStyle = pal.secondary;
    ctx.font = '700 22px "Space Mono", monospace';
    ctx.fillText('BUILDER TITLE', rightX, currentY);
    ctx.fillStyle = pal.accent;
    ctx.font = '700 34px "Barlow Condensed", sans-serif';
    ctx.fillText((builderTitleVal || 'SMART CONTRACT WIZARD').toUpperCase(), rightX, currentY + 45);

    currentY += 105;
    ctx.strokeStyle = pal.divider;
    ctx.beginPath();
    ctx.moveTo(rightX, currentY);
    ctx.lineTo(w - 42, currentY);
    ctx.stroke();

    currentY += 30;
    ctx.fillStyle = pal.secondary;
    ctx.font = '700 22px "Space Mono", monospace';
    ctx.fillText('STACK / ROLE', rightX, currentY);
    ctx.fillStyle = pal.white;
    ctx.font = '700 34px "Barlow Condensed", sans-serif';
    ctx.fillText((roleVal || 'DEVELOPER / DESIGNER').toUpperCase(), rightX, currentY + 45);

    currentY += 105;
    ctx.strokeStyle = pal.divider;
    ctx.beginPath();
    ctx.moveTo(rightX, currentY);
    ctx.lineTo(w - 42, currentY);
    ctx.stroke();

    currentY += 30;
    ctx.fillStyle = pal.secondary;
    ctx.font = '700 22px "Space Mono", monospace';
    ctx.fillText('AI SUPERPOWER', rightX, currentY);
    ctx.fillStyle = pal.white;
    ctx.font = '700 26px "Barlow Condensed", sans-serif';
    ctx.fillText(superpowerVal || 'Converting Coffee & Feni into Zero-Bug Code', rightX, currentY + 45);

    // Sleek Bottom Inset Card (Generous 45px space above!)
    const bottomY = 960;
    const bottomH = 245;

    ctx.fillStyle = pal.bg;
    ctx.beginPath();
    ctx.roundRect(42, bottomY, w - 84, bottomH, 20);
    ctx.fill();
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Achievement Left (Poppins font 28px bold)
    ctx.fillStyle = pal.secondary;
    ctx.font = '700 18px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('🏆 ACHIEVEMENT UNLOCKED', 102, bottomY + 40);

    ctx.fillStyle = pal.white;
    ctx.font = '700 28px "Poppins", sans-serif';
    ctx.fillText('Debugged life.', 102, bottomY + 90);
    ctx.fillText('Building dreams.', 102, bottomY + 138);
    ctx.fillStyle = pal.accent;
    ctx.fillText('Goa is the compiler.', 102, bottomY + 186);

    // Vertical Divider 1
    ctx.strokeStyle = pal.divider;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(505, bottomY + 22);
    ctx.lineTo(505, bottomY + bottomH - 22);
    ctx.stroke();

    // White QR Code Box Center (150x150)
    const qrSize = 150;
    const qrX = 530;
    const qrY = bottomY + 46;
    ctx.fillStyle = pal.white;
    ctx.beginPath();
    ctx.roundRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12);
    ctx.fill();

    // Vertical Divider 2
    ctx.strokeStyle = pal.divider;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(725, bottomY + 22);
    ctx.lineTo(725, bottomY + bottomH - 22);
    ctx.stroke();

    // HHGOA 26 Right (Anton font 48px)
    ctx.fillStyle = pal.accent;
    ctx.font = '400 48px "Anton", sans-serif';
    ctx.fillText('HHGOA 26', 750, bottomY + 68);

    ctx.fillStyle = pal.secondary;
    ctx.font = '700 20px "Space Mono", monospace';
    ctx.fillText('VERIFIED BUILDER', 750, bottomY + 112);

    ctx.strokeStyle = pal.highlight;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(750, bottomY + 132);
    ctx.lineTo(975, bottomY + 132);
    ctx.stroke();

    ctx.fillStyle = pal.accent;
    ctx.font = '700 16px "Space Mono", monospace';
    ctx.fillText('SCAN TO CONNECT >>>', 750, bottomY + 180);

    // Yellow Footer Bar (Moved right down near bottom outer border!)
    const footerY = 1245;
    const footerH = 55;
    ctx.fillStyle = pal.accent;
    ctx.fillRect(42, footerY, w - 84, footerH);

    ctx.fillStyle = pal.bg;
    ctx.font = '600 22px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🌴 — #FrameInGoa · 28-31 OCT 2026 · OFFICIAL HACKER HOUSE GOA BADGE — 🌴', w / 2, footerY + 35);
  }
}

function drawStampSeal(ctx, cx, cy, r, pal) {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.fillStyle = pal.highlight;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = pal.bg;
  ctx.beginPath();
  ctx.arc(0, 0, r - 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, r - 10, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = pal.accent;
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌴', 0, 5);

  ctx.restore();
}

// Download Action
function downloadPNG() {
  const link = document.createElement('a');
  link.download = `hh-goa-2026-${activeFormat}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Initial Render
renderCanvas();
