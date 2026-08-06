import { getEventQRCodeCanvas } from './qr-generator';

export type StylePreset = 'emerald' | 'sunset' | 'cyber' | 'midnight';

export interface GeneratorConfig {
  format: 'formatA' | 'formatB';
  photo: HTMLImageElement | null;
  name: string;
  role: string;
  builderTitle?: string;
  superpower?: string;
  builderMotto?: string;
  zoom: number;
  panX: number;
  panY: number;
  stylePreset?: StylePreset;
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

// Color schemes for Style Presets
const STYLE_PALETTES: Record<StylePreset, { bg: string; darkBg: string; accent: string; highlight: string; muted: string }> = {
  emerald: {
    bg: '#0A5C36',
    darkBg: '#042616',
    accent: '#FFE500',
    highlight: '#FF007A',
    muted: '#E5C200',
  },
  sunset: {
    bg: '#C84B15',
    darkBg: '#4A1503',
    accent: '#FFE500',
    highlight: '#FF8800',
    muted: '#FFC870',
  },
  cyber: {
    bg: '#0B1D3A',
    darkBg: '#040B18',
    accent: '#00FFCC',
    highlight: '#FF007A',
    muted: '#88E5FF',
  },
  midnight: {
    bg: '#062B2B',
    darkBg: '#011212',
    accent: '#00FF9D',
    highlight: '#FFE500',
    muted: '#80E0B0',
  },
};

/**
 * Render Format A (PFP / Post Overlay Frame - 1080x1350 4:5 ratio)
 */
export async function drawFormatA(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: GeneratorConfig
) {
  const { photo, zoom, panX, panY, stylePreset = 'emerald' } = config;
  const palette = STYLE_PALETTES[stylePreset] || STYLE_PALETTES.emerald;

  // Clear background
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  // 1. Draw User Photo or Goa Artwork Backdrop (4:5 crop frame area)
  const framePadding = 65;
  const cropSizeW = width - framePadding * 2;
  const cropX = framePadding;
  const cropY = framePadding + 65;
  const cropSizeH = height - framePadding * 2 - 120;

  if (photo) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cropX, cropY, cropSizeW, cropSizeH, 32);
    ctx.clip();

    ctx.fillStyle = palette.darkBg;
    ctx.fillRect(cropX, cropY, cropSizeW, cropSizeH);

    const imgAspect = photo.width / photo.height;
    const cropAspect = cropSizeW / cropSizeH;

    let drawW: number;
    let drawH: number;

    if (imgAspect > cropAspect) {
      drawH = cropSizeH * zoom;
      drawW = cropSizeH * imgAspect * zoom;
    } else {
      drawW = cropSizeW * zoom;
      drawH = (cropSizeW / imgAspect) * zoom;
    }

    const imgX = cropX + (cropSizeW - drawW) / 2 + panX;
    const imgY = cropY + (cropSizeH - drawH) / 2 + panY;

    ctx.drawImage(photo, imgX, imgY, drawW, drawH);
    ctx.restore();

    // Inner photo border
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cropX, cropY, cropSizeW, cropSizeH, 32);
    ctx.stroke();
  } else {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cropX, cropY, cropSizeW, cropSizeH, 32);
    ctx.clip();

    ctx.fillStyle = palette.darkBg;
    ctx.fillRect(cropX, cropY, cropSizeW, cropSizeH);

    if (goaSunsetImg) {
      ctx.globalAlpha = 0.85;
      const bgAspect = goaSunsetImg.width / goaSunsetImg.height;
      const cropAspect = cropSizeW / cropSizeH;
      let bgW: number;
      let bgH: number;

      if (bgAspect > cropAspect) {
        bgH = cropSizeH;
        bgW = cropSizeH * bgAspect;
      } else {
        bgW = cropSizeW;
        bgH = cropSizeW / bgAspect;
      }

      const bgX = cropX + (cropSizeW - bgW) / 2;
      const bgY = cropY + (cropSizeH - bgH) / 2;

      ctx.drawImage(goaSunsetImg, bgX, bgY, bgW, bgH);
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();

    // Photo Box Border
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cropX, cropY, cropSizeW, cropSizeH, 32);
    ctx.stroke();
  }

  // 2. Decorative Top Branding Header
  ctx.save();
  ctx.fillStyle = palette.accent;
  ctx.font = '800 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('DEVELOPED BY CODINGKOALAS', 70, 60);

  ctx.textAlign = 'right';
  ctx.fillText('GOA, INDIA · 2026', width - 70, 60);
  ctx.restore();

  // 3. Goan Coastal Wave Shapes at Bottom
  drawOceanWaves(ctx, width, height - 165, palette.bg, '#148048', palette.accent);

  // 4. Botanical Corner Palm Silhouettes
  drawPalmFrond(ctx, 40, height - 130, 1.05, false);
  drawPalmFrond(ctx, width - 40, height - 130, 1.05, true);

  // 5. Main Hero Title Overlays ("HACKER HOUSE")
  ctx.save();
  ctx.fillStyle = palette.accent;
  ctx.font = '900 74px "Playfair Display", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 20;
  ctx.fillText('HACKER   HOUSE', width / 2, height - 145);
  ctx.restore();

  // 6. Middle Devanagari Goa Graphic SVG Badge (Exact layout from image!)
  if (goaHindiSvgImg) {
    ctx.save();
    const svgW = 140;
    const svgH = 140;
    const svgX = width / 2 - svgW / 2;
    const svgY = height - 145 - svgH / 2 - 5;

    ctx.shadowColor = 'rgba(255, 0, 122, 0.9)';
    ctx.shadowBlur = 24;
    ctx.drawImage(goaHindiSvgImg, svgX, svgY, svgW, svgH);
    ctx.restore();
  } else {
    // Canvas text fallback if SVG loading
    ctx.save();
    ctx.translate(width / 2, height - 145);
    ctx.rotate((-5 * Math.PI) / 180);

    ctx.fillStyle = palette.darkBg;
    ctx.beginPath();
    ctx.roundRect(-90, -40, 180, 80, 24);
    ctx.fill();

    ctx.strokeStyle = palette.highlight;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = palette.highlight;
    ctx.font = '800 56px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('गोवा', 0, 0);
    ctx.restore();
  }

  // 7. QR Code Canvas Element (Bottom Left Corner inside Frame)
  try {
    const qrCanvas = await getEventQRCodeCanvas('https://hhgoa.com');
    const qrSize = 110;
    const qrX = cropX + 24;
    const qrY = cropY + cropSizeH - qrSize - 24;

    ctx.save();
    ctx.fillStyle = palette.darkBg;
    ctx.beginPath();
    ctx.roundRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 28, 12);
    ctx.fill();

    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    ctx.fillStyle = palette.accent;
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HHGOA.COM ↗', qrX + qrSize / 2, qrY + qrSize + 14);
    ctx.restore();
  } catch (e) {
    console.error('QR draw error:', e);
  }

  // 8. Stamp Badge Seal (Top Right Inner Corner)
  drawGoaStampSeal(ctx, width - 145, cropY + 70, 48, palette);

  // 9. Aspect Ratio Tag Footer Metadata
  ctx.save();
  ctx.fillStyle = palette.muted;
  ctx.font = '600 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('28 – 31 OCT 2026 · #FrameInGoa', width / 2, height - 28);
  ctx.restore();
}

/**
 * Render Format B (Builder ID Card - 1080x1350 4:5 ratio)
 */
export async function drawFormatB(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: GeneratorConfig
) {
  const { photo, name, role, zoom, panX, panY, stylePreset = 'emerald' } = config;
  const palette = STYLE_PALETTES[stylePreset] || STYLE_PALETTES.emerald;

  // Background
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  // Outer Border Frame
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Inner Dark Card Container
  ctx.fillStyle = palette.darkBg;
  ctx.beginPath();
  ctx.roundRect(40, 40, width - 80, height - 80, 24);
  ctx.fill();

  ctx.strokeStyle = '#148048';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw Goa Sunset Background Texture
  if (goaSunsetImg) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.drawImage(goaSunsetImg, 40, 160, width - 80, height - 280);
    ctx.restore();
  }

  // 1. Header Banner
  ctx.save();
  ctx.fillStyle = palette.bg;
  ctx.fillRect(40, 40, width - 80, 125);
  ctx.beginPath();
  ctx.moveTo(40, 165);
  ctx.lineTo(width - 40, 165);
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Header Title
  ctx.fillStyle = palette.accent;
  ctx.font = '900 52px "Playfair Display", serif';
  ctx.textAlign = 'left';
  ctx.fillText('HACKER HOUSE', 75, 120);

  // Middle Goa SVG Badge
  if (goaHindiSvgImg) {
    ctx.save();
    ctx.shadowColor = 'rgba(255, 0, 122, 0.9)';
    ctx.shadowBlur = 18;
    ctx.drawImage(goaHindiSvgImg, 510, 52, 95, 95);
    ctx.restore();
  } else {
    ctx.save();
    ctx.translate(535, 102);
    ctx.rotate((-4 * Math.PI) / 180);
    ctx.fillStyle = palette.highlight;
    ctx.font = '800 40px system-ui, sans-serif';
    ctx.fillText('गोवा', 0, 0);
    ctx.restore();
  }

  // Studio Tag Top Right
  ctx.fillStyle = palette.muted;
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('2026 BUILDER BADGE', width - 75, 95);
  ctx.font = '400 15px "JetBrains Mono", monospace';
  ctx.fillText('GOA, INDIA · 28-31 OCT', width - 75, 125);
  ctx.restore();

  // 2. Photo Card Frame
  const photoFrameX = 75;
  const photoFrameY = 195;
  const photoFrameW = width - 150;
  const photoFrameH = 580;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(photoFrameX, photoFrameY, photoFrameW, photoFrameH, 20);
  ctx.clip();

  ctx.fillStyle = palette.bg;
  ctx.fillRect(photoFrameX, photoFrameY, photoFrameW, photoFrameH);

  if (photo) {
    const imgAspect = photo.width / photo.height;
    const cropAspect = photoFrameW / photoFrameH;

    let drawW: number;
    let drawH: number;

    if (imgAspect > cropAspect) {
      drawH = photoFrameH * zoom;
      drawW = photoFrameH * imgAspect * zoom;
    } else {
      drawW = photoFrameW * zoom;
      drawH = (photoFrameW / imgAspect) * zoom;
    }

    const imgX = photoFrameX + (photoFrameW - drawW) / 2 + panX;
    const imgY = photoFrameY + (photoFrameH - drawH) / 2 + panY;

    ctx.drawImage(photo, imgX, imgY, drawW, drawH);
  } else {
    if (goaSunsetImg) {
      ctx.globalAlpha = 0.85;
      const bgAspect = goaSunsetImg.width / goaSunsetImg.height;
      const cropAspect = photoFrameW / photoFrameH;
      let bgW: number;
      let bgH: number;

      if (bgAspect > cropAspect) {
        bgH = photoFrameH;
        bgW = photoFrameH * bgAspect;
      } else {
        bgW = photoFrameW;
        bgH = photoFrameW / bgAspect;
      }

      const bgX = photoFrameX + (photoFrameW - bgW) / 2;
      const bgY = photoFrameY + (photoFrameH - bgH) / 2;

      ctx.drawImage(goaSunsetImg, bgX, bgY, bgW, bgH);
      ctx.globalAlpha = 1.0;
    }
  }
  ctx.restore();

  // Photo Frame Border
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(photoFrameX, photoFrameY, photoFrameW, photoFrameH, 20);
  ctx.stroke();

  // 3. Lower Details Section
  const { builderTitle, superpower } = config;
  const detailsY = 810;

  // Builder Name Label
  ctx.fillStyle = '#148048';
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.fillText('BUILDER NAME & TITLE', 75, detailsY);

  // Builder Name Input Value
  const displayName = (name || 'YOUR NAME HERE').toUpperCase();
  ctx.fillStyle = palette.accent;
  ctx.font = '900 48px "Playfair Display", serif';
  ctx.fillText(displayName, 75, detailsY + 45);

  // Builder Title Badge
  const displayTitle = (builderTitle || '⚡ FULL-STACK HACKER').toUpperCase();
  ctx.fillStyle = palette.highlight;
  ctx.font = '800 16px "JetBrains Mono", monospace';
  ctx.fillText(`✦ ${displayTitle}`, 75, detailsY + 75);

  // Divider Line
  ctx.strokeStyle = '#148048';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(75, detailsY + 95);
  ctx.lineTo(width - 75, detailsY + 95);
  ctx.stroke();

  // Stack / Role & Superpower Label
  ctx.fillStyle = '#148048';
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.fillText('STACK / ROLE & SUPERPOWER', 75, detailsY + 125);

  // Stack / Role Input Value
  const displayRole = (role || 'DEVELOPER / DESIGNER').toUpperCase();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 24px "JetBrains Mono", monospace';
  ctx.fillText(displayRole, 75, detailsY + 155);

  // Superpower Value
  const displaySuperpower = superpower || '⚡ Turning Coconut Water into Full-Stack Apps';
  ctx.fillStyle = palette.muted;
  ctx.font = '600 17px "JetBrains Mono", monospace';
  ctx.fillText(`🔥 ${displaySuperpower}`, 75, detailsY + 185);

  // Scannable Event QR Code
  try {
    const qrCanvas = await getEventQRCodeCanvas('https://hhgoa.com');
    const qrSize = 100;
    const qrX = width - 185;
    const qrY = detailsY + 185;

    ctx.save();
    ctx.fillStyle = palette.darkBg;
    ctx.beginPath();
    ctx.roundRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 22, 10);
    ctx.fill();

    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    ctx.fillStyle = palette.accent;
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HHGOA.COM ↗', qrX + qrSize / 2, qrY + qrSize + 12);
    ctx.restore();
  } catch (e) {
    console.error('QR draw error:', e);
  }

  // Goan Stamp Seal
  drawGoaStampSeal(ctx, width - 240, detailsY + 235, 48, palette);

  // 4. Footer Bar
  ctx.fillStyle = palette.accent;
  ctx.fillRect(40, height - 75, width - 80, 35);

  ctx.fillStyle = palette.darkBg;
  ctx.font = '800 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('#FrameInGoa · OFFICIAL HACKER HOUSE GOA 2026 BADGE', width / 2, height - 52);
}

/**
 * Draw Goan Stamp Seal Badge
 */
function drawGoaStampSeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  palette: { highlight: string; accent: string }
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-12 * Math.PI) / 180);

  ctx.fillStyle = palette.highlight;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = palette.accent;
  ctx.font = '800 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GOA 2026', 0, -10);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 10px "JetBrains Mono", monospace';
  ctx.fillText('VERIFIED', 0, 10);

  ctx.restore();
}

/**
 * Draw Ocean Waves
 */
function drawOceanWaves(
  ctx: CanvasRenderingContext2D,
  width: number,
  startY: number,
  c1: string,
  c2: string,
  c3: string
) {
  ctx.save();
  ctx.fillStyle = c2;
  ctx.beginPath();
  ctx.moveTo(0, startY);
  ctx.quadraticCurveTo(width * 0.25, startY - 25, width * 0.5, startY);
  ctx.quadraticCurveTo(width * 0.75, startY + 25, width, startY - 15);
  ctx.lineTo(width, startY + 100);
  ctx.lineTo(0, startY + 100);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Helper to draw palm frond vector silhouette
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
  if (flip) ctx.scale(-scale, scale);
  else ctx.scale(scale, scale);

  ctx.strokeStyle = '#148048';
  ctx.lineWidth = 4;

  // Main stem
  ctx.beginPath();
  ctx.moveTo(0, 60);
  ctx.quadraticCurveTo(35, 0, 80, -45);
  ctx.stroke();

  // Frond leaves
  const leaves = [
    { sx: 12, sy: 45, ex: 40, ey: 30 },
    { sx: 25, sy: 30, ex: 60, ey: 8 },
    { sx: 40, sy: 12, ex: 80, ey: -18 },
    { sx: 55, sy: -12, ex: 95, ey: -45 },
  ];

  leaves.forEach((l) => {
    ctx.beginPath();
    ctx.moveTo(l.sx, l.sy);
    ctx.lineTo(l.ex, l.ey);
    ctx.stroke();
  });

  ctx.restore();
}
