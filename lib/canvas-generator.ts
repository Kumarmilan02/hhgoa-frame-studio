import { getEventQRCodeCanvas } from './qr-generator';

export type StylePreset = 'emerald' | 'sunset' | 'cyber' | 'midnight';

export interface GeneratorConfig {
  format: 'formatA' | 'formatB';
  photo: HTMLImageElement | null;
  liveVideoElement?: HTMLVideoElement | null;
  name: string;
  role: string;
  builderTitle?: string;
  superpower?: string;
  codingMood?: string;
  zoom: number;
  panX: number;
  panY: number;
  stylePreset?: StylePreset;
  qrLink?: string;
  stickers?: string[];
  stickerPositions?: Record<string, { x: number; y: number }>;
}

// Pre-load Goa tropical artwork image & Hindi Goa SVG
let goaSunsetImg: HTMLImageElement | null = null;
let goaHindiSvgImg: HTMLImageElement | null = null;

if (typeof window !== 'undefined') {
  const img = new Image();
  img.src = '/images/goa-sunset.png';
  img.onload = () => {
    goaSunsetImg = img;
  };

  const svgImg = new Image();
  svgImg.src = '/images/goa_hindi.svg';
  svgImg.onload = () => {
    goaHindiSvgImg = svgImg;
  };
}

// Color schemes matching design spec tokens (--bg, --bg2, --primary, --accent, --secondary, --white, --muted, --divider)
const STYLE_PALETTES: Record<StylePreset, { bg: string; bg2: string; accent: string; highlight: string; secondary: string; white: string; muted: string; divider: string }> = {
  emerald: {
    bg: '#042f1b',
    bg2: '#08361f',
    accent: '#FFD400',    // --primary
    highlight: '#FF1F8F', // --accent
    secondary: '#22C55E', // --secondary
    white: '#F9FAFB',     // --white
    muted: '#9CA3AF',     // --muted
    divider: '#165B37',   // --divider
  },
  sunset: {
    bg: '#4A1503',
    bg2: '#C84B15',
    accent: '#FFD400',
    highlight: '#FF8800',
    secondary: '#FFC870',
    white: '#F9FAFB',
    muted: '#9CA3AF',
    divider: '#882200',
  },
  cyber: {
    bg: '#040B18',
    bg2: '#0B1D3A',
    accent: '#00FFCC',
    highlight: '#FF1F8F',
    secondary: '#00FF9D',
    white: '#F9FAFB',
    muted: '#9CA3AF',
    divider: '#0A3B5C',
  },
  midnight: {
    bg: '#011212',
    bg2: '#062B2B',
    accent: '#FFD400',
    highlight: '#FF1F8F',
    secondary: '#00FF9D',
    white: '#F9FAFB',
    muted: '#005C5C',
    divider: '#005C5C',
  },
};

export async function drawFormatA(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: GeneratorConfig
) {
  const { photo, name, role, builderTitle, superpower, zoom, panX, panY, stylePreset = 'emerald' } = config;
  const palette = STYLE_PALETTES[stylePreset] || STYLE_PALETTES.emerald;

  // Background
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, palette.bg2);
  bgGradient.addColorStop(1, palette.bg);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Outer Border
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 12;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  // Header Banner
  ctx.fillStyle = palette.accent;
  ctx.fillRect(24, 24, width - 48, 80);

  ctx.fillStyle = palette.bg;
  ctx.font = '900 40px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HACKER HOUSE GOA', width / 2, 64);

  // Photo Box (Square, top half)
  const photoSize = 800;
  const photoX = (width - photoSize) / 2;
  const photoY = 160;

  ctx.save();
  ctx.beginPath();
  ctx.rect(photoX, photoY, photoSize, photoSize);
  ctx.clip();

  if (photo) {
    const imgAspect = photo.width / photo.height;
    let drawW, drawH;
    if (imgAspect > 1) {
      drawH = photoSize * zoom;
      drawW = photoSize * imgAspect * zoom;
    } else {
      drawW = photoSize * zoom;
      drawH = (photoSize / imgAspect) * zoom;
    }
    const imgX = photoX + (photoSize - drawW) / 2 + panX;
    const imgY = photoY + (photoSize - drawH) / 2 + panY;
    ctx.drawImage(photo, imgX, imgY, drawW, drawH);
  } else if (config.liveVideoElement && config.liveVideoElement.readyState >= 2) {
    const video = config.liveVideoElement;
    const sourceW = video.videoWidth || 1280;
    const sourceH = video.videoHeight || 720;
    const imgAspect = sourceW / sourceH;
    let drawW, drawH;
    if (imgAspect > 1) {
      drawH = photoSize * zoom;
      drawW = photoSize * imgAspect * zoom;
    } else {
      drawW = photoSize * zoom;
      drawH = (photoSize / imgAspect) * zoom;
    }
    const imgX = photoX + (photoSize - drawW) / 2 + panX;
    const imgY = photoY + (photoSize - drawH) / 2 + panY;
    ctx.translate(imgX + drawW, imgY);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, drawW, drawH);
  }
  ctx.restore();

  // Photo border
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 6;
  ctx.strokeRect(photoX, photoY, photoSize, photoSize);

  // Content Area
  let currY = photoY + photoSize + 60;

  // Name
  const displayName = name ? name.toUpperCase() : 'HACKER';
  ctx.fillStyle = palette.white;
  ctx.font = '900 90px "Teko", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(displayName, width / 2, currY);

  ctx.fillStyle = palette.accent;
  ctx.fillRect(width / 2 - 150, currY + 110, 300, 8);
  currY += 150;

  // Role
  ctx.fillStyle = palette.secondary;
  ctx.font = '700 24px "Space Mono", monospace';
  ctx.fillText('WEAPON OF CHOICE', width / 2, currY);
  
  ctx.fillStyle = palette.white;
  ctx.font = '600 45px "Barlow Condensed", sans-serif';
  ctx.fillText((role || 'UNDEFINED').toUpperCase(), width / 2, currY + 40);
  currY += 110;

  // Title
  ctx.fillStyle = palette.secondary;
  ctx.font = '700 24px "Space Mono", monospace';
  ctx.fillText('TITLE', width / 2, currY);
  
  ctx.fillStyle = palette.accent;
  ctx.font = '600 45px "Barlow Condensed", sans-serif';
  ctx.fillText((builderTitle || 'MYSTERY DEV').toUpperCase(), width / 2, currY + 40);
  currY += 110;

  // Superpower
  ctx.fillStyle = palette.secondary;
  ctx.font = '700 24px "Space Mono", monospace';
  ctx.fillText('SUPERPOWER', width / 2, currY);
  
  ctx.textAlign = 'left';
  ctx.fillStyle = palette.white;
  ctx.font = '600 32px "Barlow Condensed", sans-serif';
  const superX = 100;
  drawWrappedSuperpowerText(ctx, superpower || 'Unknown.', superX, currY + 40, width - 200, palette);

  // QR Code
  try {
    const targetQrUrl = config.qrLink || 'https://hhgoa.com';
    const qrCanvas = await getEventQRCodeCanvas(targetQrUrl);
    const qrSize = 200;
    const qrX = width / 2 - qrSize / 2;
    const qrY = height - 80 - qrSize;

    ctx.fillStyle = palette.white;
    ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
  } catch (e) {
    console.error('QR error', e);
  }

  // Draw Stickers
  if (config.stickers && config.stickers.length > 0 && config.stickerPositions) {
    config.stickers.forEach((st) => {
      const pos = config.stickerPositions?.[st] || { x: width / 2, y: height / 2 };
      ctx.save();
      ctx.font = '100px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 16;
      ctx.fillText(st, pos.x, pos.y);
      ctx.restore();
    });
  }
}

/**
 * Format B (Builder ID Badge) — Exact Match of User Design Images!
 * 1. Header matches Img 1 (Bold serif font for HACKER HOUSE, Goan fort background illustration)
 * 2. Builder Name font increased (140px Teko bold)
 * 3. Right column sections evenly spaced to eliminate empty red box area
 * 4. AI Superpower text wrapped inside container bounds to fix border overflow in Img 2
 * 5. Bottom card scanner row moved down right near the footer (15px gap)
 */
export async function drawFormatB(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: GeneratorConfig
) {
  const { photo, name, role, builderTitle, superpower, zoom, panX, panY, stylePreset = 'emerald' } = config;
  const palette = STYLE_PALETTES[stylePreset] || STYLE_PALETTES.emerald;

  // Background
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, palette.bg2);
  bgGradient.addColorStop(1, palette.bg);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Outer Border
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Header Banner
  ctx.fillStyle = palette.accent;
  ctx.fillRect(16, 16, width - 32, 60);

  ctx.fillStyle = palette.bg;
  ctx.font = '700 24px "Space Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('HACKER HOUSE GOA 2026', 40, 46);

  ctx.textAlign = 'right';
  ctx.fillText('BUILDER ID', width - 40, 46);

  // Layout: Left (Photo), Right (Details)
  const pad = 50;
  const photoW = 400;
  const photoH = height - 76 - (pad * 2);
  const photoX = pad;
  const photoY = 76 + pad;

  // Photo
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, 20);
  ctx.clip();

  ctx.fillStyle = palette.bg2;
  ctx.fillRect(photoX, photoY, photoW, photoH);

  if (photo) {
    const imgAspect = photo.width / photo.height;
    const cropAspect = photoW / photoH;

    let drawW: number, drawH: number;
    if (imgAspect > cropAspect) {
      drawH = photoH * zoom;
      drawW = photoH * imgAspect * zoom;
    } else {
      drawW = photoW * zoom;
      drawH = (photoW / imgAspect) * zoom;
    }

    const imgX = photoX + (photoW - drawW) / 2 + panX;
    const imgY = photoY + (photoH - drawH) / 2 + panY;
    ctx.drawImage(photo, imgX, imgY, drawW, drawH);
  } else if (config.liveVideoElement && config.liveVideoElement.readyState >= 2) {
    const video = config.liveVideoElement;
    const sourceW = video.videoWidth || 1280;
    const sourceH = video.videoHeight || 720;
    const imgAspect = sourceW / sourceH;
    const cropAspect = photoW / photoH;

    let drawW: number, drawH: number;
    if (imgAspect > cropAspect) {
      drawH = photoH * zoom;
      drawW = photoH * imgAspect * zoom;
    } else {
      drawW = photoW * zoom;
      drawH = (photoW / imgAspect) * zoom;
    }

    const imgX = photoX + (photoW - drawW) / 2 + panX;
    const imgY = photoY + (photoH - drawH) / 2 + panY;
    ctx.save();
    ctx.translate(imgX + drawW, imgY);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, drawW, drawH);
    ctx.restore();
  }
  ctx.restore();

  // Photo border
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(photoX, photoY, photoW, photoH);

  // Content Area
  const contentX = photoX + photoW + pad;
  const contentW = width - contentX - pad;
  let currY = photoY + 30;

  // Name
  const displayName = name ? name.toUpperCase() : 'HACKER';
  ctx.fillStyle = palette.white;
  ctx.font = '900 85px "Teko", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(displayName, contentX, currY);

  ctx.fillStyle = palette.accent;
  ctx.fillRect(contentX, currY + 95, contentW, 6);
  currY += 130;

  // Role
  ctx.fillStyle = palette.secondary;
  ctx.font = '700 20px "Space Mono", monospace';
  ctx.fillText('WEAPON OF CHOICE / STACK', contentX, currY);
  
  ctx.fillStyle = palette.white;
  ctx.font = '600 36px "Barlow Condensed", sans-serif';
  ctx.fillText((role || 'UNDEFINED').toUpperCase(), contentX, currY + 30);
  
  currY += 100;

  // Title
  ctx.fillStyle = palette.secondary;
  ctx.font = '700 20px "Space Mono", monospace';
  ctx.fillText('TITLE', contentX, currY);
  
  ctx.fillStyle = palette.accent;
  ctx.font = '600 36px "Barlow Condensed", sans-serif';
  ctx.fillText((builderTitle || 'MYSTERY DEV').toUpperCase(), contentX, currY + 30);

  currY += 100;

  // Superpower
  ctx.fillStyle = palette.secondary;
  ctx.font = '700 20px "Space Mono", monospace';
  ctx.fillText('SUPERPOWER', contentX, currY);
  
  ctx.fillStyle = palette.white;
  ctx.font = '600 24px "Barlow Condensed", sans-serif';
  drawWrappedSuperpowerText(ctx, superpower || 'Unknown.', contentX, currY + 30, contentW, palette);

  // QR Code
  try {
    const targetQrUrl = config.qrLink || 'https://hhgoa.com';
    const qrCanvas = await getEventQRCodeCanvas(targetQrUrl);
    const qrSize = 130;
    const qrX = width - pad - qrSize;
    const qrY = height - pad - qrSize;

    ctx.fillStyle = palette.white;
    ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
  } catch (e) {
    console.error('QR error', e);
  }

  // Bottom text
  ctx.fillStyle = palette.muted;
  ctx.font = '600 20px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText('#FrameInGoa', contentX, height - pad);

  // Draw Stickers
  if (config.stickers && config.stickers.length > 0 && config.stickerPositions) {
    config.stickers.forEach((st) => {
      const pos = config.stickerPositions?.[st] || { x: width / 2, y: height / 2 };
      ctx.save();
      ctx.font = '85px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 12;
      ctx.fillText(st, pos.x, pos.y);
      ctx.restore();
    });
  }
}

/**
 * Draw Superpower text wrapped inside maxWidth bounds
 */
function drawWrappedSuperpowerText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  palette: { accent: string; white: string }
) {
  if (text.includes('Zero-Bug Code')) {
    const parts = text.split('Zero-Bug Code');
    ctx.fillStyle = palette.white;
    ctx.fillText(parts[0], x, y);

    const prefixW = ctx.measureText(parts[0]).width;
    if (prefixW + 140 <= maxWidth) {
      ctx.fillStyle = palette.accent;
      ctx.fillText('Zero-Bug Code', x + prefixW, y);
    } else {
      ctx.fillStyle = palette.accent;
      ctx.fillText('Zero-Bug Code', x, y + 30);
    }
  } else {
    const words = text.split(' ');
    let line = '';
    let currY = y;
    ctx.fillStyle = palette.white;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      if (ctx.measureText(testLine).width > maxWidth && i > 0) {
        ctx.fillText(line.trim(), x, currY);
        line = words[i] + ' ';
        currY += 30;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currY);
  }
}

/**
 * Draw Dotted Horizontal Line
 */
function drawDottedLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw Exact GOA 2026 VERIFIED BUILDER Stamp Seal matching Uploaded Logo Image!
 */
function drawExactGoaVerifiedSeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  palette: { highlight: string; accent: string; bg: string }
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Outer Magenta Pink Ring (#FF1F8F)
  ctx.fillStyle = palette.highlight;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Middle Dark Green Ring (#042f1b)
  ctx.fillStyle = palette.bg;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 6, 0, Math.PI * 2);
  ctx.fill();

  // Inner Yellow Stroke Ring (#FFD400)
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 10, 0, Math.PI * 2);
  ctx.stroke();

  // Center Island Base with Palm Tree & Ocean Squiggles (〰〰)
  // Ocean Squiggles (Pink)
  ctx.strokeStyle = palette.highlight;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-40, 0);
  ctx.quadraticCurveTo(-30, -5, -20, 0);
  ctx.moveTo(-40, 10);
  ctx.quadraticCurveTo(-30, 5, -20, 10);
  ctx.moveTo(20, -5);
  ctx.quadraticCurveTo(30, -10, 40, -5);
  ctx.moveTo(20, 5);
  ctx.quadraticCurveTo(30, 0, 40, 5);
  ctx.stroke();

  // Yellow Beach Island Base
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.ellipse(0, 24, 30, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Center Yellow & Pink Palm Tree 🌴
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-4, 24);
  ctx.quadraticCurveTo(4, 0, 0, -22);
  ctx.stroke();

  // Fronds
  ctx.fillStyle = palette.accent;
  ctx.font = '28px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('🌴', 0, -20);

  // Curved Top Text: GOA 2026 (#FFD400)
  drawCurvedText(ctx, 'GOA 2026', radius - 20, -Math.PI * 0.72, -Math.PI * 0.28, palette.accent);

  // Curved Bottom Text: VERIFIED BUILDER (#FF1F8F)
  drawCurvedText(ctx, 'VERIFIED BUILDER', radius - 20, Math.PI * 0.25, Math.PI * 0.75, palette.highlight);

  ctx.restore();
}

/**
 * Draw Text along Circle Arc
 */
function drawCurvedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  radius: number,
  startAngle: number,
  endAngle: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = '700 12px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const angleStep = (endAngle - startAngle) / Math.max(1, text.length - 1);

  for (let i = 0; i < text.length; i++) {
    const angle = startAngle + i * angleStep;
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, -radius);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draw Vector Code Brackets Icon (< />)
 */
function drawCodeBracketsIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.font = '700 24px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('</>', 0, 0);
  ctx.restore();
}

/**
 * Draw Vector Wizard Hat Icon with Stars
 */
function drawWizardHatWithStars(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Hat Brim
  ctx.beginPath();
  ctx.ellipse(0, 12, 22, 7, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Hat Cone
  ctx.beginPath();
  ctx.moveTo(-15, 10);
  ctx.quadraticCurveTo(-8, -15, 10, -22);
  ctx.quadraticCurveTo(8, 0, 15, 10);
  ctx.stroke();

  // Magic Sparkles
  ctx.fillStyle = color;
  ctx.font = '12px system-ui';
  ctx.fillText('✦', -18, -12);
  ctx.fillText('✦', 16, -8);

  ctx.restore();
}

/**
 * Draw Two-Tone Flame Icon
 */
function drawTwoToneFlame(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.translate(cx, cy);

  // Outer Flame (Orange #FF8800)
  ctx.fillStyle = '#FF8800';
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.quadraticCurveTo(-18, 8, -8, -10);
  ctx.quadraticCurveTo(-4, -22, 0, -26);
  ctx.quadraticCurveTo(7, -12, 14, -4);
  ctx.quadraticCurveTo(20, 8, 0, 18);
  ctx.fill();

  // Inner Flame Core (Yellow #FFD400)
  ctx.fillStyle = '#FFD400';
  ctx.beginPath();
  ctx.moveTo(0, 14);
  ctx.quadraticCurveTo(-10, 6, -4, -6);
  ctx.quadraticCurveTo(-2, -14, 0, -16);
  ctx.quadraticCurveTo(4, -8, 8, -2);
  ctx.quadraticCurveTo(12, 6, 0, 14);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw Waves Shape Path
 */
function drawOceanWaves(
  ctx: CanvasRenderingContext2D,
  width: number,
  startY: number,
  color1: string,
  color2: string,
  color3: string
) {
  ctx.save();

  // Wave 1
  ctx.fillStyle = color2;
  ctx.beginPath();
  ctx.moveTo(0, startY);
  ctx.bezierCurveTo(width * 0.25, startY - 20, width * 0.5, startY + 20, width * 0.75, startY - 15);
  ctx.bezierCurveTo(width * 0.85, startY - 25, width * 0.95, startY - 5, width, startY - 10);
  ctx.lineTo(width, heightMax(startY + 80));
  ctx.lineTo(0, heightMax(startY + 80));
  ctx.closePath();
  ctx.fill();

  // Wave 2 Accent
  ctx.fillStyle = color3;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, startY + 25);
  ctx.bezierCurveTo(width * 0.3, startY + 45, width * 0.6, startY + 5, width, startY + 30);
  ctx.lineTo(width, startY + 45);
  ctx.lineTo(0, startY + 45);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function heightMax(val: number) {
  return val + 200;
}

/**
 * Draw Botanical Corner Palm Fronds
 */
function drawPalmFrond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  flip: boolean
) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.scale(scale, scale);

  ctx.strokeStyle = '#165B37';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(40, -40, 80, -20);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(15, -12);
  ctx.lineTo(25, -35);
  ctx.moveTo(35, -20);
  ctx.lineTo(50, -45);
  ctx.moveTo(55, -22);
  ctx.lineTo(75, -42);
  ctx.stroke();

  ctx.restore();
}
