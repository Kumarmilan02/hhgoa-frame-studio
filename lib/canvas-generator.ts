import { getEventQRCodeCanvas } from './qr-generator';

export type StylePreset = 'emerald' | 'sunset' | 'cyber' | 'midnight';

export interface GeneratorConfig {
  format: 'formatA' | 'formatB';
  photo: HTMLImageElement | null;
  name: string;
  role: string;
  builderTitle?: string;
  superpower?: string;
  codingMood?: string;
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

/**
 * Main Format A (PFP Overlay Frame) Renderer
 */
export async function drawFormatA(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: GeneratorConfig
) {
  const { photo, zoom, panX, panY, stylePreset = 'emerald' } = config;
  const palette = STYLE_PALETTES[stylePreset] || STYLE_PALETTES.emerald;

  // 0. Base Background Gradient
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, palette.bg2);
  bgGradient.addColorStop(1, palette.bg);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Outer Border Line
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(16, 16, width - 32, height - 32, 28);
  ctx.stroke();

  // 1. Photo Container Box
  const framePadding = 65;
  const cropSizeW = width - framePadding * 2;
  const cropSizeH = height - framePadding * 2 - 120;
  const cropX = framePadding;
  const cropY = framePadding + 65;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cropX, cropY, cropSizeW, cropSizeH, 32);
  ctx.clip();

  ctx.fillStyle = palette.bg;
  ctx.fillRect(cropX, cropY, cropSizeW, cropSizeH);

  if (photo) {
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
  } else if (goaSunsetImg) {
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

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(cropX, cropY, cropSizeW, cropSizeH, 32);
  ctx.stroke();

  // 2. Decorative Top Branding Header (Removed DEVELOPED BY CODINGKOALAS!)
  ctx.save();
  ctx.fillStyle = palette.accent;
  ctx.font = '700 18px "Space Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('🌴 HACKER HOUSE GOA 2026', 70, 60);

  ctx.textAlign = 'right';
  ctx.fillText('GOA, INDIA · 28-31 OCT', width - 70, 60);
  ctx.restore();

  // 3. Goan Coastal Wave Shapes & Dark Gradient Backdrop at Bottom
  ctx.save();
  const bannerY = height - 210;
  const bannerH = 180;
  const bannerGrad = ctx.createLinearGradient(0, bannerY, 0, bannerY + bannerH);
  bannerGrad.addColorStop(0, 'rgba(4, 47, 27, 0.0)');
  bannerGrad.addColorStop(0.25, 'rgba(4, 47, 27, 0.90)');
  bannerGrad.addColorStop(1, 'rgba(4, 47, 27, 0.99)');
  ctx.fillStyle = bannerGrad;
  ctx.fillRect(0, bannerY, width, bannerH);
  ctx.restore();

  drawOceanWaves(ctx, width, height - 165, palette.bg, palette.divider, palette.accent);

  // 4. Botanical Corner Palm Silhouettes
  drawPalmFrond(ctx, 35, height - 125, 1.05, false);
  drawPalmFrond(ctx, width - 35, height - 125, 1.05, true);

  // 5. Main Hero Title Overlays ("HACKER   HOUSE" centered)
  ctx.save();
  ctx.fillStyle = palette.accent;
  ctx.font = '400 78px "Anton", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 24;
  ctx.fillText('HACKER   HOUSE', width / 2, height - 122);
  ctx.restore();

  // 6. Middle Devanagari Goa Graphic SVG Badge (Glows in center)
  if (goaHindiSvgImg) {
    ctx.save();
    const svgW = 135;
    const svgH = 135;
    const svgX = width / 2 - svgW / 2;
    const svgY = height - 122 - svgH / 2 - 4;

    ctx.shadowColor = 'rgba(255, 31, 143, 0.95)';
    ctx.shadowBlur = 28;
    ctx.drawImage(goaHindiSvgImg, svgX, svgY, svgW, svgH);
    ctx.restore();
  }

  // 7. QR Code Canvas Element (Bottom-Left Corner Red Marked Area with Zero Overlap!)
  try {
    const qrCanvas = await getEventQRCodeCanvas('https://hhgoa.com');
    const qrSize = 95;
    const qrX = 45;
    const qrY = height - 145;

    ctx.save();
    ctx.fillStyle = palette.bg;
    ctx.beginPath();
    ctx.roundRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 22, 12);
    ctx.fill();

    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    ctx.fillStyle = palette.accent;
    ctx.font = '700 11px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HHGOA.COM ↗', qrX + qrSize / 2, qrY + qrSize + 12);
    ctx.restore();
  } catch (e) {
    console.error('QR draw error:', e);
  }

  // 8. Right Bottom Element / Hashtag Badge (Sleek container box - NO OVERLAP!)
  ctx.save();
  const tagBoxW = 220;
  const tagBoxH = 85;
  const tagBoxX = width - 45 - tagBoxW;
  const tagBoxY = height - 145;

  ctx.fillStyle = palette.bg;
  ctx.beginPath();
  ctx.roundRect(tagBoxX, tagBoxY, tagBoxW, tagBoxH, 12);
  ctx.fill();

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = palette.accent;
  ctx.font = '700 18px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('#FrameInGoa', tagBoxX + tagBoxW / 2, tagBoxY + 26);

  ctx.fillStyle = palette.highlight;
  ctx.font = '600 13px "IBM Plex Mono", monospace';
  ctx.fillText('🍹 BRED ON CODE', tagBoxX + tagBoxW / 2, tagBoxY + 48);

  ctx.fillStyle = palette.secondary;
  ctx.font = '600 13px "IBM Plex Mono", monospace';
  ctx.fillText('28-31 OCT 2026 ✦', tagBoxX + tagBoxW / 2, tagBoxY + 68);
  ctx.restore();

  // 9. Awesome Slogan Footer Line (No DEVELOPED BY!)
  ctx.save();
  ctx.fillStyle = palette.muted;
  ctx.font = '600 18px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('🌴 BRED ON CODE & COCONUT WATER · 28-31 OCT 2026 🌴', width / 2, height - 22);
  ctx.restore();
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

  // 0. Base Canvas & Gradient Background
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, palette.bg2);
  bgGradient.addColorStop(1, palette.bg);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Outer Border Line (4px solid #FFD400)
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(16, 16, width - 32, height - 32, 24);
  ctx.stroke();

  // Four Corner Yellow Sparkles (✦)
  ctx.fillStyle = palette.accent;
  ctx.font = '22px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('✦', 34, 38);
  ctx.fillText('✦', width - 34, 38);

  // -------------------------------------------------------------
  // 1. TOP HEADER BANNER (Full Width, Exact Match of Img 1!)
  // -------------------------------------------------------------
  const headerY = 38;

  // Header Background Line Art (Goan fort & palm trees)
  if (goaSunsetImg) {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.drawImage(goaSunsetImg, 45, headerY, width - 90, 140);
    ctx.restore();
  }

  // Left: HACKER / HOUSE (Bold serif Playfair Display / Bodoni style matching Img 1!)
  ctx.save();
  ctx.fillStyle = palette.accent;
  ctx.font = '900 62px "Playfair Display", serif';
  ctx.textAlign = 'left';
  ctx.letterSpacing = '1px';
  ctx.fillText('HACKER', 45, headerY + 54);
  ctx.fillText('HOUSE', 45, headerY + 118);
  ctx.restore();

  // Center: Glowing Devanagari Goa Badge ("गोवा")
  if (goaHindiSvgImg) {
    ctx.save();
    ctx.shadowColor = palette.highlight;
    ctx.shadowBlur = 24;
    ctx.drawImage(goaHindiSvgImg, 435, headerY + 18, 110, 110);
    ctx.restore();
  } else {
    ctx.save();
    ctx.shadowColor = palette.highlight;
    ctx.shadowBlur = 20;
    ctx.fillStyle = palette.highlight;
    ctx.font = '800 54px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('गोवा', 490, headerY + 85);
    ctx.restore();
  }

  // Right: 2026 BUILDER BADGE + GOA, INDIA · 28-31 OCT + Ocean Squiggles
  ctx.save();
  ctx.fillStyle = palette.accent;
  ctx.font = '700 22px "Space Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('2026 BUILDER BADGE', width - 45, headerY + 48);

  ctx.fillStyle = palette.muted;
  ctx.font = '600 16px "IBM Plex Mono", monospace';
  ctx.fillText('GOA, INDIA · 28-31 OCT', width - 45, headerY + 80);

  // Ocean wave squiggles (〰〰) in yellow
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(width - 200, headerY + 105);
  ctx.quadraticCurveTo(width - 160, headerY + 95, width - 120, headerY + 105);
  ctx.quadraticCurveTo(width - 80, headerY + 115, width - 45, headerY + 105);
  ctx.stroke();
  ctx.restore();

  // Header Divider Line (--divider: #165B37)
  ctx.strokeStyle = palette.divider;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(45, 185);
  ctx.lineTo(width - 45, 185);
  ctx.stroke();

  // -------------------------------------------------------------
  // 2. LEFT COLUMN — PORTRAIT PHOTO & STAMP BADGE (Increased Width: 485px, Height: 720px)
  // -------------------------------------------------------------
  const photoX = 42;
  const photoY = 195;
  const photoW = 485;
  const photoH = 720;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, 20);
  ctx.clip();

  ctx.fillStyle = palette.bg;
  ctx.fillRect(photoX, photoY, photoW, photoH);

  if (photo) {
    const imgAspect = photo.width / photo.height;
    const cropAspect = photoW / photoH;

    let drawW: number;
    let drawH: number;

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
  } else if (goaSunsetImg) {
    ctx.globalAlpha = 0.85;
    ctx.drawImage(goaSunsetImg, photoX, photoY, photoW, photoH);
    ctx.globalAlpha = 1.0;
  }
  ctx.restore();

  // Photo Frame Border (4px solid #FFD400)
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, 20);
  ctx.stroke();

  // Inner Offset Accent Lines
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(photoX - 6, photoY - 6, photoW + 12, photoH + 12, 24);
  ctx.stroke();

  // Circular GOA 2026 VERIFIED BUILDER Stamp Logo
  drawExactGoaVerifiedSeal(ctx, photoX + 95, photoY + photoH - 70, 85, palette);

  // -------------------------------------------------------------
  // 3. RIGHT COLUMN — BUILDER INFO STACKED (Balanced 475px Width!)
  // -------------------------------------------------------------
  const rightX = 560;
  const rightMaxW = 475;
  let currentY = 205;

  // SECTION 1: BUILDER NAME (140px Teko bold)
  ctx.fillStyle = palette.secondary;
  ctx.font = '700 22px "Space Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('BUILDER NAME', rightX, currentY);

  if (name && name.trim() !== '') {
    const displayName = name.trim().toUpperCase();
    ctx.fillStyle = palette.white;
    ctx.font = '700 140px "Teko", sans-serif';
    ctx.fillText(displayName, rightX, currentY + 95);

    // Yellow organic brush stroke line below name
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.roundRect(rightX, currentY + 112, rightMaxW, 8, 4);
    ctx.fill();
    currentY += 140;
  } else {
    currentY += 45;
  }

  // Dotted Divider 1
  drawDottedLine(ctx, rightX, currentY, width - 42, currentY, palette.divider);
  currentY += 30;

  // SECTION 2: BUILDER TITLE (Space Mono 22px + Barlow Condensed 34px)
  drawWizardHatWithStars(ctx, rightX + 32, currentY + 34, palette.accent);

  ctx.fillStyle = palette.secondary;
  ctx.font = '700 22px "Space Mono", monospace';
  ctx.fillText('BUILDER TITLE', rightX + 80, currentY + 14);

  const displayTitle = (builderTitle || 'SMART CONTRACT WIZARD').toUpperCase();
  ctx.fillStyle = palette.accent;
  ctx.font = '700 34px "Barlow Condensed", sans-serif';
  ctx.fillText(displayTitle, rightX + 80, currentY + 54);

  currentY += 105;

  // Dotted Divider 2
  drawDottedLine(ctx, rightX, currentY, width - 42, currentY, palette.divider);
  currentY += 30;

  // SECTION 3: STACK / ROLE (Space Mono 22px + Barlow Condensed 34px)
  drawCodeBracketsIcon(ctx, rightX + 32, currentY + 34, palette.secondary);

  ctx.fillStyle = palette.secondary;
  ctx.font = '700 22px "Space Mono", monospace';
  ctx.fillText('STACK / ROLE', rightX + 80, currentY + 14);

  const displayRole = (role || 'DEVELOPER / DESIGNER').toUpperCase();
  ctx.fillStyle = palette.white;
  ctx.font = '700 34px "Barlow Condensed", sans-serif';
  ctx.fillText(displayRole, rightX + 80, currentY + 54);

  currentY += 105;

  // Dotted Divider 3
  drawDottedLine(ctx, rightX, currentY, width - 42, currentY, palette.divider);
  currentY += 30;

  // SECTION 4: AI SUPERPOWER
  drawTwoToneFlame(ctx, rightX + 32, currentY + 34);

  ctx.fillStyle = palette.secondary;
  ctx.font = '700 22px "Space Mono", monospace';
  ctx.fillText('AI SUPERPOWER', rightX + 80, currentY + 14);

  const displaySuperpower = superpower || 'Converting Coffee & Feni into Zero-Bug Code';
  ctx.fillStyle = palette.white;
  ctx.font = '700 26px "Barlow Condensed", sans-serif';

  drawWrappedSuperpowerText(ctx, displaySuperpower, rightX + 80, currentY + 50, rightMaxW - 80, palette);

  // -------------------------------------------------------------
  // 4. BOTTOM INSET SECTION — SLEEK ROW (y: 960 to 1205, Generous 45px Space above!)
  // -------------------------------------------------------------
  const bottomY = 960;
  const bottomH = 245;

  // Inset Card Container (#042f1b, border: 2.5px solid #FFD400)
  ctx.save();
  ctx.fillStyle = palette.bg;
  ctx.beginPath();
  ctx.roundRect(42, bottomY, width - 84, bottomH, 20);
  ctx.fill();

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // LEFT COLUMN: ACHIEVEMENT UNLOCKED (Poppins Font)
  ctx.save();
  ctx.font = '28px system-ui';
  ctx.fillText('🏆', 62, bottomY + 44);

  ctx.fillStyle = palette.secondary;
  ctx.font = '700 18px "Space Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('ACHIEVEMENT UNLOCKED', 102, bottomY + 40);

  ctx.fillStyle = palette.white;
  ctx.font = '700 28px "Poppins", sans-serif';
  ctx.fillText('Debugged life.', 102, bottomY + 90);
  ctx.fillText('Building dreams.', 102, bottomY + 138);

  ctx.fillStyle = palette.accent;
  ctx.font = '700 28px "Poppins", sans-serif';
  ctx.fillText('Goa is the compiler.', 102, bottomY + 186);
  ctx.restore();

  // Vertical Divider Line 1 (--divider: #165B37)
  ctx.strokeStyle = palette.divider;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(505, bottomY + 22);
  ctx.lineTo(505, bottomY + bottomH - 22);
  ctx.stroke();

  // CENTER COLUMN: HIGH-CONTRAST QR CODE (150px x 150px)
  try {
    const qrCanvas = await getEventQRCodeCanvas('https://hhgoa.com');
    const qrSize = 150;
    const qrX = 530;
    const qrY = bottomY + 46;

    ctx.save();
    ctx.fillStyle = palette.white;
    ctx.beginPath();
    ctx.roundRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12);
    ctx.fill();

    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
    ctx.restore();
  } catch (e) {
    console.error('QR draw error:', e);
  }

  // Vertical Divider Line 2
  ctx.strokeStyle = palette.divider;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(725, bottomY + 22);
  ctx.lineTo(725, bottomY + bottomH - 22);
  ctx.stroke();

  // RIGHT COLUMN: HHGOA 26 VERIFIED BUILDER
  ctx.save();
  ctx.fillStyle = palette.accent;
  ctx.font = '400 48px "Anton", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('HHGOA 26', 740, bottomY + 62);

  ctx.fillStyle = palette.secondary;
  ctx.font = '700 20px "Space Mono", monospace';
  ctx.fillText('VERIFIED BUILDER', 740, bottomY + 104);

  // Pink accent line (#FF1F8F)
  ctx.strokeStyle = palette.highlight;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(740, bottomY + 122);
  ctx.lineTo(960, bottomY + 122);
  ctx.stroke();

  // Scan to Connect
  ctx.fillStyle = palette.accent;
  ctx.font = '700 16px "Space Mono", monospace';
  ctx.fillText('SCAN TO CONNECT >>>', 740, bottomY + 168);
  ctx.restore();

  // -------------------------------------------------------------
  // 5. FOOTER BAR (Moved down right below scanner box, 15px gap!)
  // -------------------------------------------------------------
  const footerY = 1230;
  const footerH = 50;

  ctx.fillStyle = palette.accent;
  ctx.fillRect(45, footerY, width - 90, footerH);

  ctx.fillStyle = palette.bg;
  ctx.font = '600 22px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('🌴 — #FrameInGoa · 28-31 OCT 2026 · OFFICIAL HACKER HOUSE GOA BADGE — 🌴', width / 2, footerY + 32);
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
