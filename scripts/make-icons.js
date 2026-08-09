const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#042616');
  grad.addColorStop(1, '#0a5c36');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Border
  ctx.strokeStyle = '#ffe500';
  ctx.lineWidth = size * 0.05;
  ctx.strokeRect(size * 0.05, size * 0.05, size * 0.9, size * 0.9);

  // Palm Emoji Text
  ctx.font = `${Math.floor(size * 0.5)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🌴', size / 2, size / 2);

  const out = fs.createWriteStream(filename);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => console.log(`Created ${filename}`));
}

try {
  generateIcon(192, path.join(__dirname, '../public/pwa-192x192.png'));
  generateIcon(512, path.join(__dirname, '../public/pwa-512x512.png'));
} catch (e) {
  console.log('Canvas not available in node, creating basic SVG icon fallbacks');
}
