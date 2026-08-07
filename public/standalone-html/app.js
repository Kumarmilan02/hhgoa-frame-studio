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

// Colors
const PALETTES = {
  emerald: { bg: '#0A5C36', darkBg: '#042616', accent: '#FFE500', highlight: '#FF007A' },
  sunset: { bg: '#C84B15', darkBg: '#4A1503', accent: '#FFE500', highlight: '#FF8800' },
  cyber: { bg: '#0B1D3A', darkBg: '#040B18', accent: '#00FFCC', highlight: '#FF007A' },
  midnight: { bg: '#062B2B', darkBg: '#011212', accent: '#00FF9D', highlight: '#FFE500' }
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

  // Clear
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, w, h);

  // Outer Border
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(16, 16, w - 32, h - 32, 24);
  ctx.stroke();

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

    ctx.fillStyle = pal.darkBg;
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
      ctx.font = '700 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('📷 TAP TO UPLOAD YOUR PHOTO DIRECTLY', cropX + cropW/2, cropY + cropH/2);
    }
    ctx.restore();

    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cropX, cropY, cropW, cropH, 32);
    ctx.stroke();

    ctx.fillStyle = pal.accent;
    ctx.font = '800 20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DEVELOPED BY CODINGKOALAS', 70, 60);
    ctx.textAlign = 'right';
    ctx.fillText('GOA, INDIA · 2026', w - 70, 60);

    ctx.fillStyle = pal.accent;
    ctx.font = '900 70px serif';
    ctx.textAlign = 'center';
    ctx.fillText('HACKER HOUSE', w / 2, h - 145);
  } else {
    // Format B Redesigned 2-Column Render
    const headerY = 40;
    ctx.fillStyle = pal.accent;
    ctx.font = '900 44px serif';
    ctx.textAlign = 'left';
    ctx.fillText('HACKER', 45, headerY + 45);
    ctx.fillText('HOUSE', 45, headerY + 92);

    ctx.fillStyle = pal.highlight;
    ctx.font = '800 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('गोवा', 480, headerY + 75);

    ctx.fillStyle = pal.accent;
    ctx.font = '800 20px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('2026 BUILDER BADGE', w - 45, headerY + 50);
    ctx.font = '600 15px monospace';
    ctx.fillText('GOA, INDIA · 28-31 OCT', w - 45, headerY + 80);

    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(45, 152);
    ctx.lineTo(w - 45, 152);
    ctx.stroke();

    // Left Column Photo
    const photoX = 45;
    const photoY = 175;
    const photoW = 460;
    const photoH = 630;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, 24);
    ctx.clip();
    ctx.fillStyle = pal.darkBg;
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
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, 24);
    ctx.stroke();

    // Right Column Info Stacked
    const rightX = 540;
    let currentY = 190;

    ctx.fillStyle = '#22C55E';
    ctx.font = '800 15px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('BUILDER NAME', rightX, currentY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 64px serif';
    ctx.fillText((nameVal || 'MILAN').toUpperCase(), rightX, currentY + 60);

    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(rightX, currentY + 80);
    ctx.lineTo(rightX + 440, currentY + 80);
    ctx.stroke();

    currentY += 130;
    ctx.fillStyle = '#22C55E';
    ctx.font = '800 15px monospace';
    ctx.fillText('BUILDER TITLE', rightX, currentY);

    ctx.fillStyle = pal.accent;
    ctx.font = '800 24px monospace';
    ctx.fillText(builderTitleVal.toUpperCase(), rightX, currentY + 35);

    currentY += 105;
    ctx.fillStyle = '#22C55E';
    ctx.font = '800 15px monospace';
    ctx.fillText('AI SUPERPOWER', rightX, currentY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 17px monospace';
    ctx.fillText(superpowerVal, rightX, currentY + 35);

    // Bottom Section
    const bottomY = 825;
    const bottomH = 370;

    ctx.fillStyle = pal.darkBg;
    ctx.beginPath();
    ctx.roundRect(45, bottomY, w - 90, bottomH, 24);
    ctx.fill();
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#22C55E';
    ctx.font = '800 18px monospace';
    ctx.fillText('🏆 ACHIEVEMENT UNLOCKED', 75, bottomY + 46);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 20px monospace';
    ctx.fillText('Debugged life.', 75, bottomY + 100);
    ctx.fillText('Building dreams.', 75, bottomY + 145);

    ctx.fillStyle = pal.accent;
    ctx.fillText('Goa is the compiler.', 75, bottomY + 190);

    // Yellow Footer Bar
    const footerY = h - 85;
    ctx.fillStyle = pal.accent;
    ctx.fillRect(45, footerY, w - 90, 50);

    ctx.fillStyle = pal.darkBg;
    ctx.font = '800 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🌴 — #FrameInGoa · 28-31 OCT 2026 · OFFICIAL HACKER HOUSE GOA BADGE — 🌴', w / 2, footerY + 32);
  }
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
