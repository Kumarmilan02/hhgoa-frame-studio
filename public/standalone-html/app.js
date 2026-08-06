// HH GOA 2026 - Standalone JavaScript Engine
let activeFormat = 'formatA';
let userPhoto = null;
let nameVal = '';
let roleVal = '';
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

  // Photo Crop Box
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
    // Placeholder Text
    ctx.fillStyle = pal.accent;
    ctx.font = '700 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('📷 TAP TO UPLOAD YOUR PHOTO DIRECTLY', cropX + cropW/2, cropY + cropH/2);
  }
  ctx.restore();

  // Photo Border
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(cropX, cropY, cropW, cropH, 32);
  ctx.stroke();

  // Header Title
  ctx.fillStyle = pal.accent;
  ctx.font = '800 22px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('2:47 PM STUDIO', 70, 60);
  ctx.textAlign = 'right';
  ctx.fillText('GOA, INDIA · 2026', w - 70, 60);

  // Bottom Title
  ctx.fillStyle = pal.accent;
  ctx.font = '900 70px serif';
  ctx.textAlign = 'center';
  ctx.fillText('HACKER HOUSE', w / 2, h - 145);
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
