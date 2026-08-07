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
    muted: '#80FFE8',
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

  // 0. Base Background Layer
  ctx.fillStyle = palette.bg;
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

  ctx.fillStyle = palette.darkBg;
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
  } else {
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

  // 6. Middle Devanagari Goa Graphic SVG Badge
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
  }

  // 7. QR Code Canvas Element
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

  // 8. Aspect Ratio Tag Footer Metadata
  ctx.save();
  ctx.fillStyle = palette.muted;
  ctx.font = '600 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('28 – 31 OCT 2026 · #FrameInGoa', width / 2, height - 28);
  ctx.restore();
}

/**
 * Format B (Builder ID Badge) — Full 2-Column Redesign strictly matching Reference Image!
 */
export async function drawFormatB(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: GeneratorConfig
) {
  const { photo, name, role, builderTitle, superpower, codingMood, zoom, panX, panY, stylePreset = 'emerald' } = config;
  const palette = STYLE_PALETTES[stylePreset] || STYLE_PALETTES.emerald;

  // 0. Base Canvas & Outer Yellow Border Line
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(16, 16, width - 32, height - 32, 24);
  ctx.stroke();

  // Top Corner Sparkles (✦)
  ctx.fillStyle = palette.accent;
  ctx.font = '24px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('✦', 34, 38);
  ctx.fillText('✦', width - 34, 38);

  // Draw Goa Background Texture Line Art (Subtle)
  if (goaSunsetImg) {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.drawImage(goaSunsetImg, 40, 160, width - 80, height - 280);
    ctx.restore();
  }

  // -------------------------------------------------------------
  // 1. TOP HEADER BANNER (Full Width)
  // -------------------------------------------------------------
  const headerY = 40;

  // Left: HACKER / HOUSE (Stacked in 2 lines)
  ctx.save();
  ctx.fillStyle = palette.accent;
  ctx.font = '900 44px "Playfair Display", serif';
  ctx.textAlign = 'left';
  ctx.fillText('HACKER', 45, headerY + 45);
  ctx.fillText('HOUSE', 45, headerY + 92);
  ctx.restore();

  // Center: Glowing Devanagari Goa Badge ("गोवा")
  if (goaHindiSvgImg) {
    ctx.save();
    ctx.shadowColor = 'rgba(255, 0, 122, 0.9)';
    ctx.shadowBlur = 22;
    ctx.drawImage(goaHindiSvgImg, 435, headerY + 15, 95, 95);
    ctx.restore();
  } else {
    ctx.save();
    ctx.fillStyle = palette.highlight;
    ctx.font = '800 48px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('गोवा', 480, headerY + 75);
    ctx.restore();
  }

  // Right: 2026 BUILDER BADGE + GOA, INDIA · 28-31 OCT
  ctx.save();
  ctx.fillStyle = palette.accent;
  ctx.font = '800 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('2026 BUILDER BADGE', width - 45, headerY + 50);

  ctx.fillStyle = palette.muted;
  ctx.font = '600 15px "JetBrains Mono", monospace';
  ctx.fillText('GOA, INDIA · 28-31 OCT', width - 45, headerY + 80);
  ctx.restore();

  // Header Divider Line with chamfered notch
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(45, 152);
  ctx.lineTo(width - 45, 152);
  ctx.stroke();

  // -------------------------------------------------------------
  // 2. LEFT COLUMN — PORTRAIT PHOTO & CIRCULAR STAMP BADGE
  // -------------------------------------------------------------
  const photoX = 45;
  const photoY = 175;
  const photoW = 460;
  const photoH = 630;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, 24);
  ctx.clip();

  ctx.fillStyle = palette.darkBg;
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

  // Double Yellow Chamfered Photo Frame Border
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, 24);
  ctx.stroke();

  // Inner Offset Accent Lines (matching reference design!)
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(photoX - 6, photoY - 6, photoW + 12, photoH + 12, 28);
  ctx.stroke();

  // Circular GOA 2026 VERIFIED BUILDER Stamp Badge (Bottom-Left Corner of Photo)
  drawGoaVerifiedSeal(ctx, photoX + 85, photoY + photoH - 65, 80, palette);

  // -------------------------------------------------------------
  // 3. RIGHT COLUMN — BUILDER INFO STACKED (x: 540 to 1035)
  // -------------------------------------------------------------
  const rightX = 540;
  let currentY = 185;

  // SECTION 1: BUILDER NAME
  ctx.fillStyle = '#22C55E';
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('BUILDER NAME', rightX, currentY);

  const displayName = (name || 'MILAN').toUpperCase();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 64px "Playfair Display", serif';
  ctx.fillText(displayName, rightX, currentY + 55);

  // Yellow organic brush stroke line below name
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(rightX, currentY + 72);
  ctx.quadraticCurveTo(rightX + 200, currentY + 78, rightX + 440, currentY + 70);
  ctx.stroke();

  currentY += 92;

  // Dotted Divider 1
  drawDottedLine(ctx, rightX, currentY, width - 45, currentY, '#148048');
  currentY += 20;

  // SECTION 2: BUILDER TITLE
  drawWizardHat(ctx, rightX + 30, currentY + 30, palette.accent);

  ctx.fillStyle = '#22C55E';
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.fillText('BUILDER TITLE', rightX + 75, currentY + 12);

  const displayTitle = (builderTitle || 'SMART CONTRACT WIZARD').toUpperCase();
  ctx.fillStyle = palette.accent;
  ctx.font = '800 22px "JetBrains Mono", monospace';
  ctx.fillText(displayTitle, rightX + 75, currentY + 44);

  currentY += 68;

  // Dotted Divider 2
  drawDottedLine(ctx, rightX, currentY, width - 45, currentY, '#148048');
  currentY += 20;

  // SECTION 3: STACK / ROLE
  drawCodeBracketsIcon(ctx, rightX + 30, currentY + 28, '#22C55E');

  ctx.fillStyle = '#22C55E';
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.fillText('STACK / ROLE', rightX + 75, currentY + 12);

  const displayRole = (role || 'DEVELOPER / DESIGNER').toUpperCase();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 22px "JetBrains Mono", monospace';
  ctx.fillText(displayRole, rightX + 75, currentY + 44);

  currentY += 68;

  // Dotted Divider 3
  drawDottedLine(ctx, rightX, currentY, width - 45, currentY, '#148048');
  currentY += 20;

  // SECTION 4: AI SUPERPOWER
  drawFlameIcon(ctx, rightX + 30, currentY + 30, palette.highlight);

  ctx.fillStyle = '#22C55E';
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.fillText('AI SUPERPOWER', rightX + 75, currentY + 12);

  const displaySuperpower = superpower || 'Converting Coffee & Feni into Zero-Bug Code';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 16px "JetBrains Mono", monospace';

  if (displaySuperpower.includes('Zero-Bug Code')) {
    const parts = displaySuperpower.split('Zero-Bug Code');
    ctx.fillText(parts[0], rightX + 75, currentY + 40);

    const prefixW = ctx.measureText(parts[0]).width;
    ctx.fillStyle = palette.accent;
    ctx.font = '800 16px "JetBrains Mono", monospace';
    ctx.fillText('Zero-Bug Code', rightX + 75 + prefixW, currentY + 40);
  } else {
    ctx.fillText(displaySuperpower, rightX + 75, currentY + 40);
  }

  currentY += 68;

  // Dotted Divider 4
  drawDottedLine(ctx, rightX, currentY, width - 45, currentY, '#148048');
  currentY += 20;

  // SECTION 5: CODING MOOD
  ctx.fillStyle = '#22C55E';
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CODING MOOD', rightX + 220, currentY + 15);

  // User-driven Coding Mood Text
  const displayMood = (codingMood || 'SHIP MODE').toUpperCase();
  ctx.fillStyle = palette.accent;
  ctx.font = '800 24px "JetBrains Mono", monospace';
  ctx.fillText(`═  ${displayMood}  ═`, rightX + 220, currentY + 60);

  // -------------------------------------------------------------
  // 4. BOTTOM INSET SECTION — ACHIEVEMENT, QR & VERIFIED BUILDER
  // -------------------------------------------------------------
  const bottomY = 825;
  const bottomH = 370;

  // Inset Card Container (#042616)
  ctx.save();
  ctx.fillStyle = palette.darkBg;
  ctx.beginPath();
  ctx.roundRect(45, bottomY, width - 90, bottomH, 24);
  ctx.fill();

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // LEFT PART: ACHIEVEMENT UNLOCKED (x: 75 to 490)
  ctx.save();
  ctx.font = '28px system-ui';
  ctx.fillText('🏆', 75, bottomY + 50);

  ctx.fillStyle = '#22C55E';
  ctx.font = '800 18px "JetBrains Mono", monospace';
  ctx.fillText('ACHIEVEMENT UNLOCKED', 115, bottomY + 46);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 20px "JetBrains Mono", monospace';
  ctx.fillText('Debugged life.', 115, bottomY + 100);
  ctx.fillText('Building dreams.', 115, bottomY + 145);

  ctx.fillStyle = palette.accent;
  ctx.font = '800 20px "JetBrains Mono", monospace';
  ctx.fillText('Goa is the compiler.', 115, bottomY + 190);
  ctx.restore();

  // Vertical Divider Line 1
  ctx.strokeStyle = '#148048';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(500, bottomY + 30);
  ctx.lineTo(500, bottomY + bottomH - 30);
  ctx.stroke();

  // CENTER PART: HIGH-CONTRAST QR CODE (x: 525 to 695)
  try {
    const qrCanvas = await getEventQRCodeCanvas('https://hhgoa.com');
    const qrSize = 170;
    const qrX = 525;
    const qrY = bottomY + 100;

    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 16);
    ctx.fill();

    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
    ctx.restore();
  } catch (e) {
    console.error('QR draw error:', e);
  }

  // Vertical Divider Line 2
  ctx.strokeStyle = '#148048';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(725, bottomY + 30);
  ctx.lineTo(725, bottomY + bottomH - 30);
  ctx.stroke();

  // RIGHT PART: GOA 2026 VERIFIED BUILDER (x: 750 to 1000)
  ctx.save();
  ctx.fillStyle = palette.accent;
  ctx.font = '900 42px "Playfair Display", serif';
  ctx.fillText('GOA 2026', 750, bottomY + 75);

  ctx.fillStyle = '#22C55E';
  ctx.font = '800 22px "JetBrains Mono", monospace';
  ctx.fillText('VERIFIED BUILDER', 750, bottomY + 120);

  // Red accent line
  ctx.strokeStyle = palette.highlight;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(750, bottomY + 140);
  ctx.lineTo(970, bottomY + 140);
  ctx.stroke();

  // Scan to Connect
  ctx.fillStyle = palette.accent;
  ctx.font = '800 18px "JetBrains Mono", monospace';
  ctx.fillText('SCAN TO CONNECT >>>', 750, bottomY + 195);
  ctx.restore();

  // -------------------------------------------------------------
  // 5. FOOTER BAR (Solid Electric Yellow Bar)
  // -------------------------------------------------------------
  const footerY = height - 85;
  const footerH = 50;

  ctx.fillStyle = palette.accent;
  ctx.fillRect(45, footerY, width - 90, footerH);

  ctx.fillStyle = palette.darkBg;
  ctx.font = '800 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('🌴 — #FrameInGoa · 28-31 OCT 2026 · OFFICIAL HACKER HOUSE GOA BADGE — 🌴', width / 2, footerY + 32);
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
 * Draw Circular GOA 2026 VERIFIED BUILDER Stamp Seal
 */
function drawGoaVerifiedSeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  palette: { highlight: string; accent: string; darkBg: string }
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-12 * Math.PI) / 180);

  // Outer Magenta Ring
  ctx.fillStyle = palette.highlight;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Inner Dark Center
  ctx.fillStyle = palette.darkBg;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Center Palm & Waves
  ctx.fillStyle = palette.accent;
  ctx.font = '24px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('🌴', 0, -5);

  ctx.fillStyle = palette.accent;
  ctx.font = '800 11px "JetBrains Mono", monospace';
  ctx.fillText('GOA 2026', 0, 18);
  ctx.fillText('VERIFIED BUILDER', 0, 32);

  ctx.restore();
}

/**
 * Draw Vector Code Brackets Icon (< />)
 */
function drawCodeBracketsIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.font = '900 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('</>', 0, 0);
  ctx.restore();
}

/**
 * Draw Vector Wizard Hat Icon
 */
function drawWizardHat(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Hat Brim
  ctx.beginPath();
  ctx.ellipse(0, 15, 24, 8, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Hat Cone
  ctx.beginPath();
  ctx.moveTo(-16, 12);
  ctx.quadraticCurveTo(-10, -15, 12, -22);
  ctx.quadraticCurveTo(10, 0, 16, 12);
  ctx.stroke();

  // Magic Sparkles
  ctx.fillStyle = color;
  ctx.font = '12px system-ui';
  ctx.fillText('✦', -20, -15);
  ctx.fillText('✦', 18, -10);

  ctx.restore();
}

/**
 * Draw Vector Flame Icon
 */
function drawFlameIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#FFE500';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.quadraticCurveTo(-20, 10, -10, -10);
  ctx.quadraticCurveTo(-5, -25, 0, -30);
  ctx.quadraticCurveTo(8, -15, 15, -5);
  ctx.quadraticCurveTo(22, 10, 0, 20);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw Vector Laptop Icon with </> Screen Code
 */
function drawLaptopIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, color: string) {
  ctx.save();
  ctx.translate(cx - w / 2, cy - h / 2);

  // Screen Frame
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.fillStyle = '#042616';
  ctx.beginPath();
  ctx.roundRect(10, 0, w - 20, h - 20, 12);
  ctx.fill();
  ctx.stroke();

  // Base Keyboard
  ctx.beginPath();
  ctx.roundRect(0, h - 18, w, 16, 6);
  ctx.stroke();

  // </> Code Text inside screen
  ctx.fillStyle = color;
  ctx.font = '900 28px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('</>', w / 2, (h - 20) / 2);

  ctx.restore();
}

/**
 * Draw Vector Small Palm Tree Icon
 */
function drawPalmTreeSmall(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;

  // Trunk
  ctx.beginPath();
  ctx.moveTo(-5, 30);
  ctx.quadraticCurveTo(5, 0, 0, -20);
  ctx.stroke();

  // Fronds
  ctx.fillStyle = color;
  ctx.font = '28px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('🌴', 0, -20);

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

  ctx.strokeStyle = '#148048';
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
