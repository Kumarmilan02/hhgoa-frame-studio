import { getEventQRCodeCanvas } from './qr-generator';

export type StylePreset = 'emerald' | 'sunset' | 'cyber' | 'midnight';
export type BadgeCategory = 'HACKER' | 'VOLUNTEER' | 'ORGANIZER' | 'HOST';

export interface GeneratorConfig {
  format: 'formatA' | 'formatB' | 'formatC';
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
  qrLink?: string;
  stickers?: string[];
  stickerPositions?: Record<string, { x: number; y: number }>;
  badgeCategory?: BadgeCategory;
  squadName?: string;
  squadMembers?: string[];
  groupFrameStyle?: 'sunset' | 'shack' | 'cyberpunk' | 'neon_party' | 'heritage' | 'scooty_cruise';
}

const BADGE_EMBLEM_COLORS: Record<BadgeCategory, { border: string; innerBorder: string; bg: string; text: string; subText: string; icon: string }> = {
  HACKER: { border: '#ff007a', innerBorder: '#ffe500', bg: '#042616', text: '#ffe500', subText: '#ff007a', icon: '💻' },
  VOLUNTEER: { border: '#00f0ff', innerBorder: '#ffffff', bg: '#042616', text: '#ffffff', subText: '#00f0ff', icon: '🤝' },
  ORGANIZER: { border: '#ffe500', innerBorder: '#ff007a', bg: '#042616', text: '#ffe500', subText: '#ff8800', icon: '⚡' },
  HOST: { border: '#22c55e', innerBorder: '#ffe500', bg: '#042616', text: '#ffe500', subText: '#22c55e', icon: '🏠' },
};

export function drawRoundStampBadge(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  category: BadgeCategory = 'HACKER'
) {
  const colors = BADGE_EMBLEM_COLORS[category] || BADGE_EMBLEM_COLORS.HACKER;

  ctx.save();
  ctx.translate(centerX, centerY);

  // 1. Solid Premium Dark Background Disc
  ctx.fillStyle = colors.bg;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Subtle outer shadow glow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 12;

  // 2. Outer Solid Accent Ring
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.shadowBlur = 0;

  // 3. Inner Secondary Ring
  ctx.strokeStyle = colors.innerBorder;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 10, 0, Math.PI * 2);
  ctx.stroke();

  // 4. Top Category Icon
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(colors.icon, 0, -radius + 24);

  // 5. Center Category Title (HACKER, VOLUNTEER, ORGANIZER, HOST)
  ctx.font = '900 24px "Space Mono", "Impact", sans-serif';
  ctx.fillStyle = colors.text;
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 6;
  ctx.fillText(category, 0, 4);
  ctx.shadowBlur = 0;

  // 6. Bottom Tagline "GOA 2026"
  ctx.font = '700 11px "Space Mono", monospace';
  ctx.fillStyle = colors.subText;
  ctx.fillText('GOA 2026', 0, radius - 22);

  ctx.restore();
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

  // Official Round Rubber Stamp Badge (HACKER, VOLUNTEER, ORGANIZER, HOST)
  drawRoundStampBadge(ctx, width - 115, 145, 68, config.badgeCategory || 'HACKER');

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
    const targetQrUrl = config.qrLink && config.qrLink.trim()
      ? (config.qrLink.startsWith('http') ? config.qrLink.trim() : `https://x.com/${config.qrLink.replace('@', '').trim()}`)
      : 'https://hhgoa.com';

    const qrCanvas = await getEventQRCodeCanvas(targetQrUrl);
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
  ctx.fillText('28-31 OCT 2026 🌴', tagBoxX + tagBoxW / 2, tagBoxY + 68);
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

  // Four Corner Yellow Sparkles (✨)
  ctx.fillStyle = palette.accent;
  ctx.font = '22px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('🌴', 34, 38);
  ctx.fillText('🌴', width - 34, 38);

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

  // Official Round Rubber Stamp Badge (HACKER, VOLUNTEER, ORGANIZER, HOST)
  drawRoundStampBadge(ctx, photoX + photoW - 75, photoY + 75, 65, config.badgeCategory || 'HACKER');

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
    const targetQrUrl = config.qrLink && config.qrLink.trim()
      ? (config.qrLink.startsWith('http') ? config.qrLink.trim() : `https://x.com/${config.qrLink.replace('@', '').trim()}`)
      : 'https://hhgoa.com';

    const qrCanvas = await getEventQRCodeCanvas(targetQrUrl);
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
  // 5. FOOTER BAR — HIGHLIGHTED #FrameInGoa TAG & BRANDING
  // -------------------------------------------------------------
  const footerY = 1230;
  const footerH = 52;

  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.roundRect(45, footerY, width - 90, footerH, 12);
  ctx.fill();

  // Left Footer Text
  ctx.fillStyle = palette.bg;
  ctx.font = '700 18px "Space Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('🌴 HH-GOA 2026', 70, footerY + 33);

  // CENTER HIGHLIGHTED CAPSULE: 📸 #FrameInGoa
  const tagCapsuleW = 240;
  const tagCapsuleH = 36;
  const tagCapsuleX = width / 2 - tagCapsuleW / 2;
  const tagCapsuleY = footerY + 8;

  ctx.save();
  ctx.fillStyle = '#042616';
  ctx.beginPath();
  ctx.roundRect(tagCapsuleX, tagCapsuleY, tagCapsuleW, tagCapsuleH, 18);
  ctx.fill();

  ctx.strokeStyle = '#ff007a';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#ffe500';
  ctx.font = '900 20px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#ff007a';
  ctx.shadowBlur = 10;
  ctx.fillText('📸 #FrameInGoa', width / 2, tagCapsuleY + 24);
  ctx.restore();

  // Right Footer Text
  ctx.fillStyle = palette.bg;
  ctx.font = '700 18px "Space Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('28-31 OCT 2026 🌴', width - 70, footerY + 33);
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
  ctx.fillText('✨', -18, -12);
  ctx.fillText('✨', 16, -8);

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

  ctx.restore();
}

/**
 * Format C: Squad / Group Photo Pass Studio (6 Unique Real-World Object Editions - 1200x1500 Extended Photo Canvas)
 */
export async function drawFormatC(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: GeneratorConfig
) {
  const {
    photo,
    squadName = 'HH GOA HACKER SQUAD 2026',
    squadMembers = ['Milan (Lead)', 'Rohan (Dev)', 'Ananya (Design)'],
    groupFrameStyle = 'sunset',
    zoom = 1.0,
    panX = 0,
    panY = 0,
    stickers = [],
    stickerPositions = {},
  } = config;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  const members = squadMembers.filter((m) => m.trim().length > 0).slice(0, 6);

  // =========================================================================
  // EDITION 1: 🌅 Anjuna Sunset — Official Travel Passport Edition 🛂 (1200x1500)
  // =========================================================================
  if (groupFrameStyle === 'sunset') {
    // Warm Sunset Passport Leather Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#02180e');
    bgGrad.addColorStop(0.3, '#0a5c36');
    bgGrad.addColorStop(0.65, '#ff007a');
    bgGrad.addColorStop(1, '#ffe500');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Perforated Tear-off Line for Boarding Pass Stub on Right
    const stubX = 890;
    ctx.strokeStyle = '#ffe500';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(stubX, 20);
    ctx.lineTo(stubX, height - 20);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Embossed Gold Foil Passport Outer Border
    ctx.strokeStyle = '#ffe500';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Top Official Passport Header
    ctx.fillStyle = '#ffe500';
    ctx.font = '900 20px "Courier New", monospace, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(' Republic of Goa · Official Builder Passport', 45, 54);

    ctx.textAlign = 'right';
    ctx.fillText('Passport No: GOA-2026-HH', stubX - 30, 54);

    // Passport Visa Metadata Header Box
    ctx.fillStyle = '#042616';
    ctx.fillRect(45, 70, stubX - 75, 70);
    ctx.strokeStyle = '#ff007a';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 70, stubX - 75, 70);

    ctx.font = '900 18px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.textAlign = 'left';
    ctx.fillText('TYPE: P  |  NAT: HACKER  |  AUTH: HH GOA 2026', 60, 98);
    ctx.font = '900 16px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ff007a';
    ctx.fillText('FLIGHT: HH-2026  |  GATE: 4B  |  SEAT: FIRST CLASS HACKER', 60, 124);

    // Main Squad Passport Name Title
    ctx.font = '900 38px "Cinzel Decorative", serif, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.textAlign = 'left';
    ctx.fillText((squadName || 'GOA BUILDER SQUAD').toUpperCase(), 45, 185);

    // Main Passport Photo Window (815 x 880 - EXPANDED ROOM FOR GROUP SELFIE)
    const photoFrameX = 45;
    const photoFrameY = 205;
    const photoFrameW = stubX - 75; // 815px
    const photoFrameH = 870;

    ctx.save();
    ctx.beginPath();
    ctx.rect(photoFrameX, photoFrameY, photoFrameW, photoFrameH);
    ctx.clip();

    if (photo) {
      const scale = Math.max(photoFrameW / photo.width, photoFrameH / photo.height) * zoom;
      const drawW = photo.width * scale;
      const drawH = photo.height * scale;
      const drawX = photoFrameX + (photoFrameW - drawW) / 2 + panX;
      const drawY = photoFrameY + (photoFrameH - drawH) / 2 + panY;
      ctx.drawImage(photo, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = '#042616';
      ctx.fillRect(photoFrameX, photoFrameY, photoFrameW, photoFrameH);

      ctx.font = '900 90px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛂 🌅 🌴 📸', photoFrameX + photoFrameW / 2, photoFrameY + photoFrameH / 2 - 40);

      ctx.font = 'bold 36px "Courier New", monospace, sans-serif';
      ctx.fillStyle = '#ffe500';
      ctx.fillText('UPLOAD SQUAD PHOTO OR SNAP LIVE SELFIE', photoFrameX + photoFrameW / 2, photoFrameY + photoFrameH / 2 + 50);
    }
    ctx.restore();

    // Immigration Approved Stamp Overlay
    ctx.save();
    ctx.translate(photoFrameX + photoFrameW - 170, photoFrameY + 120);
    ctx.rotate(-0.25);
    ctx.strokeStyle = '#ff007a';
    ctx.lineWidth = 4;
    ctx.strokeRect(-120, -35, 240, 70);

    ctx.font = '900 16px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ff007a';
    ctx.textAlign = 'center';
    ctx.fillText('★ GOA IMMIGRATION ★', 0, -10);
    ctx.fillText('APPROVED · OCT 2026', 0, 15);
    ctx.restore();

    // Passport Photo Frame Gold Border
    ctx.strokeStyle = '#ffe500';
    ctx.lineWidth = 6;
    ctx.strokeRect(photoFrameX, photoFrameY, photoFrameW, photoFrameH);

    // Passenger Passport Manifest Badges at Bottom Left
    if (members.length > 0) {
      const memberY = 1095;
      const tagWidth = Math.min(250, (photoFrameW - 30) / members.length - 8);
      const totalW = members.length * tagWidth + (members.length - 1) * 8;
      let startX = photoFrameX + (photoFrameW - totalW) / 2;

      members.forEach((memName, idx) => {
        const tagX = startX + idx * (tagWidth + 8);
        ctx.fillStyle = idx % 2 === 0 ? '#ffe500' : '#ff007a';
        ctx.beginPath();
        ctx.roundRect(tagX, memberY, tagWidth, 50, 12);
        ctx.fill();

        ctx.strokeStyle = '#042616';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = idx % 2 === 0 ? '#042616' : '#ffffff';
        ctx.font = '900 17px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let nameText = memName.trim();
        if (nameText.length > 14) nameText = nameText.slice(0, 12) + '..';
        ctx.fillText(`PAX ${idx + 1}: ${nameText}`, tagX + tagWidth / 2, memberY + 25);
      });
    }

    // Passport Machine Readable Zone (MRZ) & Footer
    const footerY = 1170;
    ctx.fillStyle = '#042616';
    ctx.fillRect(45, footerY, photoFrameW, 280);
    ctx.strokeStyle = '#148048';
    ctx.lineWidth = 4;
    ctx.strokeRect(45, footerY, photoFrameW, 280);

    ctx.font = '900 36px sans-serif';
    ctx.fillStyle = '#ff007a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('P<INDGOA<<HACKER<<2026', 75, footerY + 50);

    ctx.font = 'bold 18px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.fillText('OFFICIAL BUILDER PASSPORT · HACKER HOUSE GOA 2026', 75, footerY + 88);

    // Prominent Highlighted #FrameInGoa Badge (Clean No Overlap)
    ctx.fillStyle = '#ff007a';
    ctx.beginPath();
    ctx.roundRect(75, footerY + 110, 240, 44, 10);
    ctx.fill();
    ctx.strokeStyle = '#ffe500';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '900 24px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('✨ #FrameInGoa', 75 + 120, footerY + 140);

    ctx.font = '900 18px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.textAlign = 'left';
    ctx.fillText('#HHGOA2026  #AnjunaSunsetPassport', 335, footerY + 140);

    ctx.font = '15px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#e5c200';
    ctx.fillText('VALID FOR ENTRY TO ALL GOA BUILDER SESSIONS & SUNSET PARTIES 🌅', 75, footerY + 225);

    // =========================================================================
    // RIGHT BOARDING PASS STUB (Flight Ticket & Barcode)
    // =========================================================================
    const rightX = stubX + 20;
    const rightW = width - rightX - 25;

    ctx.font = '900 20px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.textAlign = 'center';
    ctx.fillText('FLIGHT STUB', rightX + rightW / 2, 54);

    ctx.fillStyle = '#042616';
    ctx.fillRect(rightX, 70, rightW, 1380);
    ctx.strokeStyle = '#ffe500';
    ctx.lineWidth = 3;
    ctx.strokeRect(rightX, 70, rightW, 1380);

    // Flight Info Text on Stub
    ctx.font = '900 18px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ff007a';
    ctx.fillText('GATE: 4B', rightX + rightW / 2, 115);
    ctx.fillText('ZONE: 1', rightX + rightW / 2, 150);
    ctx.fillStyle = '#ffe500';
    ctx.fillText('SEAT: 01A-06F', rightX + rightW / 2, 185);
    ctx.fillText('CLASS: FIRST', rightX + rightW / 2, 220);

    // Vertical Barcode Simulation on Stub
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rightX + 20, 255, rightW - 40, 750);
    ctx.fillStyle = '#000000';
    for (let bx = rightX + 30; bx < rightX + rightW - 30; bx += 10) {
      const bWidth = Math.random() > 0.4 ? 4 : 2;
      ctx.fillRect(bx, 265, bWidth, 730);
    }

    ctx.font = '900 15px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.fillText('GOA-PASS-2026', rightX + rightW / 2, 1040);

    const qrCanvas = await getEventQRCodeCanvas('https://hhgoa-frame-studio.vercel.app/');
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, rightX + (rightW - 150) / 2, 1080, 150, 150);
    }
  }

  // =========================================================================
  // EDITION 2: 🍹 Baga Beach Shack — Tropical Beach Shack Menu Edition 🏖️ (1200x1500)
  // =========================================================================
  else if (groupFrameStyle === 'shack') {
    // Dark Wooden Teak Signboard Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#2e1908');
    bgGrad.addColorStop(0.5, '#180e04');
    bgGrad.addColorStop(1, '#0c0702');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Bamboo Pole Grid Outer Frame with Coconut Rope Corner Knots
    ctx.strokeStyle = '#e5c200';
    ctx.lineWidth = 18;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Bamboo Node Rings
    ctx.fillStyle = '#c84b15';
    for (let bx = 120; bx < width - 120; bx += 180) {
      ctx.fillRect(bx, 14, 18, 30);
      ctx.fillRect(bx, height - 44, 18, 30);
    }

    // Corner Beach Shack Emojis
    ctx.font = '65px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🍹', 50, 85);
    ctx.textAlign = 'right';
    ctx.fillText('🥥', width - 50, 85);

    // Top Handwritten Menu Board Header
    ctx.font = '900 26px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'center';
    ctx.fillText('🍹 BAGA BEACH SHACK · DAILY SPECIAL MENU & SQUAD PASS 🏖️', width / 2, 75);

    // Main Squad Title (Menu Board Banner)
    ctx.font = '900 52px "Cinzel Decorative", serif, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.shadowColor = '#c84b15';
    ctx.shadowBlur = 14;
    ctx.fillText((squadName || 'GOA BUILDER SQUAD').toUpperCase(), width / 2, 135);
    ctx.shadowBlur = 0;

    // Menu Sub-Header Ribbon
    ctx.fillStyle = '#042616';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 320, 152, 640, 40, 12);
    ctx.fill();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '900 17px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('CATCH OF THE DAY: FRESH CODE, COCONUT FENI & SUNSET SURF 🏄‍♂️', width / 2, 178);

    // Wooden Clipboard Photo Frame Container (1090 x 920 - EXPANDED PHOTO SPACE)
    const cardX = 55;
    const cardY = 205;
    const cardW = width - 110; // 1090px
    const cardH = 920;

    // White Menu Paper Base with Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 28;
    ctx.fillStyle = '#fdf6e2';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.shadowBlur = 0;

    // Wooden Clothes Peg / Clip graphic holding photo top
    ctx.fillStyle = '#c84b15';
    ctx.fillRect(width / 2 - 35, cardY - 18, 70, 36);
    ctx.strokeStyle = '#ffe500';
    ctx.lineWidth = 2;
    ctx.strokeRect(width / 2 - 35, cardY - 18, 70, 36);

    // Photo Window Inside Menu Board (1042 x 810)
    const photoX = cardX + 24;
    const photoY = cardY + 24;
    const photoW = cardW - 48;
    const photoH = cardH - 110;

    ctx.save();
    ctx.beginPath();
    ctx.rect(photoX, photoY, photoW, photoH);
    ctx.clip();

    if (photo) {
      const scale = Math.max(photoW / photo.width, photoH / photo.height) * zoom;
      const drawW = photo.width * scale;
      const drawH = photo.height * scale;
      const drawX = photoX + (photoW - drawW) / 2 + panX;
      const drawY = photoY + (photoH - drawH) / 2 + panY;
      ctx.drawImage(photo, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = '#042616';
      ctx.fillRect(photoX, photoY, photoW, photoH);

      ctx.font = '900 90px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏖️ 🍹 🌊 🥥', photoX + photoW / 2, photoY + photoW / 2 - 130);

      ctx.font = 'bold 36px "Courier New", monospace, sans-serif';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('UPLOAD SQUAD PHOTO OR SNAP LIVE SELFIE', photoX + photoW / 2, photoY + photoH / 2 + 50);
    }
    ctx.restore();

    // Menu Handwritten Script Caption on Paper Margin
    ctx.font = '900 24px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#c84b15';
    ctx.textAlign = 'left';
    ctx.fillText('🍹 Baga Shack Special: Served Cold at HH Goa 2026', cardX + 30, cardY + cardH - 35);

    // Member Tags (Wooden Menu Items)
    if (members.length > 0) {
      const memberY = 1140;
      const tagWidth = Math.min(280, (width - 160) / members.length - 10);
      const totalW = members.length * tagWidth + (members.length - 1) * 10;
      let startX = (width - totalW) / 2;

      members.forEach((memName, idx) => {
        const tagX = startX + idx * (tagWidth + 10);
        ctx.fillStyle = idx % 2 === 0 ? '#00f0ff' : '#ffe500';
        ctx.beginPath();
        ctx.roundRect(tagX, memberY, tagWidth, 58, 14);
        ctx.fill();

        ctx.strokeStyle = '#042616';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#042616';
        ctx.font = '900 19px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let nameText = memName.trim();
        if (nameText.length > 14) nameText = nameText.slice(0, 12) + '..';
        ctx.fillText(`🍹 #${nameText}`, tagX + tagWidth / 2, memberY + 29);
      });
    }

    // Bottom Beach Shack Footer
    const footerY = 1220;
    ctx.fillStyle = '#042616';
    ctx.fillRect(65, footerY, width - 130, 230);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(65, footerY, width - 130, 230);

    ctx.font = '900 48px sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('गोवा 🏖️', 100, footerY + 70);

    ctx.font = 'bold 20px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.fillText('BAGA BEACH SHACK MENU SQUAD PASS · HACKER HOUSE 2026', 100, footerY + 115);

    // Prominent Highlighted #FrameInGoa Badge
    ctx.fillStyle = '#ffe500';
    ctx.beginPath();
    ctx.roundRect(100, footerY + 130, 270, 46, 12);
    ctx.fill();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '900 26px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#042616';
    ctx.textAlign = 'center';
    ctx.fillText('✨ #FrameInGoa', 100 + 135, footerY + 160);

    ctx.font = '900 20px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'left';
    ctx.fillText('#BagaBeach  #HHGOA2026', 390, footerY + 160);

    ctx.font = '16px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#e5c200';
    ctx.fillText('🌊 SUN, SAND, CODE & COCONUT VIBES ALL DAY 🍹', 100, footerY + 185);

    const qrCanvas = await getEventQRCodeCanvas('https://hhgoa-frame-studio.vercel.app/');
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, width - 230, footerY + 35, 150, 150);
    }
  }

  // =========================================================================
  // EDITION 3: 💻 Vagator Night Hack — Cyber Security Keycard Edition ⚡ (1200x1500)
  // =========================================================================
  else if (groupFrameStyle === 'cyberpunk') {
    // Dark Circuit Matrix Background (#020f08)
    ctx.fillStyle = '#020f08';
    ctx.fillRect(0, 0, width, height);

    // Matrix Rain Grid Lines
    ctx.strokeStyle = '#0c4729';
    ctx.lineWidth = 1.5;
    for (let gx = 0; gx < width; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += 40) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    // Top Braided Lanyard Slot & Slot Ring
    const slotX = width / 2 - 100;
    ctx.fillStyle = '#148048';
    ctx.fillRect(slotX - 10, 0, 220, 38);
    ctx.fillStyle = '#020f08';
    ctx.fillRect(slotX, 10, 200, 18);
    ctx.strokeStyle = '#ffe500';
    ctx.lineWidth = 3;
    ctx.strokeRect(slotX, 10, 200, 18);

    ctx.font = '900 13px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.textAlign = 'center';
    ctx.fillText('═══ LANYARD KEYCARD SLOT ═══', width / 2, 24);

    // EMV Microchip Graphic on Top Left
    const chipX = 55;
    const chipY = 45;
    ctx.fillStyle = '#ffe500';
    ctx.fillRect(chipX, chipY, 75, 55);
    ctx.strokeStyle = '#042616';
    ctx.lineWidth = 2;
    ctx.strokeRect(chipX + 10, chipY + 8, 55, 38);
    ctx.beginPath();
    ctx.moveTo(chipX + 38, chipY + 8);
    ctx.lineTo(chipX + 38, chipY + 46);
    ctx.stroke();

    // Security Clearance Banner
    ctx.font = '900 22px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'left';
    ctx.fillText('SECURITY CLEARANCE: LEVEL 5 OVERLORD [CLASSIFIED]', 150, 75);
    ctx.font = '15px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.fillText('SYS_ACCESS: GRANTED // ID: 0x4848474F41 // ROOM: VAGATOR-LAB', 150, 98);

    // Squad Title
    ctx.font = '900 50px "Cinzel Decorative", serif, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.fillText((squadName || 'GOA BUILDER SQUAD').toUpperCase(), 55, 150);

    // Ticker Tape Bar
    ctx.fillStyle = '#042616';
    ctx.fillRect(55, 165, width - 110, 36);
    ctx.strokeStyle = '#ffe500';
    ctx.lineWidth = 2;
    ctx.strokeRect(55, 165, width - 110, 36);

    ctx.font = '900 20px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.textAlign = 'center';
    ctx.fillText('✨ #FrameInGoa // #VagatorCyberLab // #HHGOA2026', width / 2, 189);

    // Biometric HUD Photo Frame (1100 x 880 - EXPANDED PHOTO AREA)
    const photoFrameX = 55;
    const photoFrameY = 215;
    const photoFrameW = width - 110; // 1090px
    const photoFrameH = 880;

    ctx.save();
    ctx.beginPath();
    ctx.rect(photoFrameX, photoFrameY, photoFrameW, photoFrameH);
    ctx.clip();

    if (photo) {
      const scale = Math.max(photoFrameW / photo.width, photoFrameH / photo.height) * zoom;
      const drawW = photo.width * scale;
      const drawH = photo.height * scale;
      const drawX = photoFrameX + (photoFrameW - drawW) / 2 + panX;
      const drawY = photoFrameY + (photoFrameH - drawH) / 2 + panY;
      ctx.drawImage(photo, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = '#020f08';
      ctx.fillRect(photoFrameX, photoFrameY, photoFrameW, photoFrameH);

      ctx.font = '900 90px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ 💻 📸 🚀', photoFrameX + photoFrameW / 2, photoFrameY + photoFrameH / 2 - 40);

      ctx.font = 'bold 36px "Courier New", monospace, sans-serif';
      ctx.fillStyle = '#ffe500';
      ctx.fillText('UPLOAD SQUAD PHOTO OR SNAP LIVE SELFIE', photoFrameX + photoFrameW / 2, photoFrameY + photoFrameH / 2 + 50);
    }
    ctx.restore();

    // Biometric Scan overlay banner
    ctx.fillStyle = 'rgba(4, 38, 22, 0.85)';
    ctx.fillRect(photoFrameX + 25, photoFrameY + 25, 340, 44);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(photoFrameX + 25, photoFrameY + 25, 340, 44);

    ctx.font = '900 16px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'left';
    ctx.fillText('BIOMETRIC MATCH: 99.8% [OK]', photoFrameX + 40, photoFrameY + 52);

    // Frame Borders
    ctx.strokeStyle = '#ffe500';
    ctx.lineWidth = 8;
    ctx.strokeRect(photoFrameX, photoFrameY, photoFrameW, photoFrameH);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(photoFrameX - 6, photoFrameY - 6, photoFrameW + 12, photoFrameH + 12);

    // Member Terminal Prompt Badges
    if (members.length > 0) {
      const memberY = 1125;
      const tagWidth = Math.min(270, (width - 140) / members.length - 10);
      const totalW = members.length * tagWidth + (members.length - 1) * 10;
      let startX = (width - totalW) / 2;

      members.forEach((memName, idx) => {
        const tagX = startX + idx * (tagWidth + 10);
        ctx.fillStyle = '#042616';
        ctx.beginPath();
        ctx.roundRect(tagX, memberY, tagWidth, 58, 10);
        ctx.fill();

        ctx.strokeStyle = idx % 2 === 0 ? '#ffe500' : '#00f0ff';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = idx % 2 === 0 ? '#ffe500' : '#00f0ff';
        ctx.font = '900 18px "Courier New", monospace, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let nameText = memName.trim();
        if (nameText.length > 14) nameText = nameText.slice(0, 12) + '..';
        ctx.fillText(`[>_] ${nameText}`, tagX + tagWidth / 2, memberY + 29);
      });
    }

    // Bottom Keycard Footer
    const footerY = 1210;
    ctx.fillStyle = '#042616';
    ctx.fillRect(55, footerY, width - 110, 235);

    ctx.strokeStyle = '#ffe500';
    ctx.lineWidth = 4;
    ctx.strokeRect(55, footerY, width - 110, 235);

    ctx.font = '900 48px sans-serif';
    ctx.fillStyle = '#ff007a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('गोवा ⚡', 90, footerY + 70);

    ctx.font = 'bold 20px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.fillText('VAGATOR CYBER ACCESS KEYCARD · HACKER HOUSE GOA 2026', 90, footerY + 115);

    // Prominent Highlighted #FrameInGoa Badge
    ctx.fillStyle = '#ffe500';
    ctx.beginPath();
    ctx.roundRect(90, footerY + 130, 270, 46, 12);
    ctx.fill();

    ctx.font = '900 26px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#042616';
    ctx.textAlign = 'center';
    ctx.fillText('✨ #FrameInGoa', 90 + 135, footerY + 160);

    ctx.font = '900 20px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'left';
    ctx.fillText('// #VagatorCyberLab // #HHGOA2026', 380, footerY + 160);

    ctx.font = '16px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#e5c200';
    ctx.fillText('LOCATION: VAGATOR, GOA · COORDINATES: 15.6028° N, 73.7431° E', 90, footerY + 185);

    const qrCanvas = await getEventQRCodeCanvas('https://hhgoa-frame-studio.vercel.app/');
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, width - 225, footerY + 40, 145, 145);
    }
  }

  // =========================================================================
  // EDITION 4: 🪩 Tito's Neon Nights — VIP Festival Pass Edition 🎉 (1200x1500)
  // =========================================================================
  else if (groupFrameStyle === 'neon_party') {
    // Deep Violet Nightclub Laser Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0d0221');
    bgGrad.addColorStop(0.35, '#7b2cbf');
    bgGrad.addColorStop(0.7, '#ff007a');
    bgGrad.addColorStop(1, '#00f0ff');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Laser Strobe Beams
    ctx.strokeStyle = 'rgba(255, 0, 122, 0.4)';
    ctx.lineWidth = 4;
    for (let lx = -200; lx < width + 400; lx += 120) {
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx + 400, height);
      ctx.stroke();
    }

    // Top VIP Festival Wristband Lanyard Strap Clip
    ctx.fillStyle = '#ff007a';
    ctx.fillRect(65, 0, 90, 48);
    ctx.fillRect(width - 155, 0, 90, 48);
    ctx.fillStyle = '#ffe500';
    ctx.fillRect(80, 10, 60, 28);
    ctx.fillRect(width - 140, 10, 60, 28);

    ctx.font = '900 13px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#042616';
    ctx.textAlign = 'center';
    ctx.fillText('VIP FESTIVAL WRISTBAND LANYARD LOOP', width / 2, 28);

    // VIP Pass Header
    ctx.font = '900 26px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'center';
    ctx.fillText("🎉 TITO'S NEON NIGHTS · VIP FESTIVAL CONCERT PASS ★ OCT 28-31", width / 2, 78);

    // Squad Name
    ctx.font = '900 52px "Cinzel Decorative", serif, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ff007a';
    ctx.shadowBlur = 20;
    ctx.fillText((squadName || 'GOA BUILDER SQUAD').toUpperCase(), width / 2, 138);
    ctx.shadowBlur = 0;

    // Hashtag Ribbon
    ctx.fillStyle = '#0d0221';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 300, 155, 600, 40, 20);
    ctx.fill();
    ctx.strokeStyle = '#ff007a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '900 22px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.fillText('✨ #FrameInGoa   #TitosNeonNights   #HHGOA2026', width / 2, 181);

    // Stadium Arch Oval Photo Viewport (1090 x 885 - EXPANDED PHOTO AREA)
    const photoFrameX = 55;
    const photoFrameY = 215;
    const photoFrameW = width - 110;
    const photoFrameH = 885;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoFrameX, photoFrameY, photoFrameW, photoFrameH, 40);
    ctx.clip();

    if (photo) {
      const scale = Math.max(photoFrameW / photo.width, photoFrameH / photo.height) * zoom;
      const drawW = photo.width * scale;
      const drawH = photo.height * scale;
      const drawX = photoFrameX + (photoFrameW - drawW) / 2 + panX;
      const drawY = photoFrameY + (photoFrameH - drawH) / 2 + panY;
      ctx.drawImage(photo, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = '#0d0221';
      ctx.fillRect(photoFrameX, photoFrameY, photoFrameW, photoFrameH);

      ctx.font = '900 90px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🪩 ✨ 🍸 🎶', photoFrameX + photoFrameW / 2, photoFrameY + photoFrameH / 2 - 40);

      ctx.font = 'bold 36px "Courier New", monospace, sans-serif';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('UPLOAD SQUAD PHOTO OR SNAP LIVE SELFIE', photoFrameX + photoFrameW / 2, photoFrameY + photoFrameH / 2 + 50);
    }
    ctx.restore();

    // ALL ACCESS VIP BACKSTAGE GUEST RUBBER STAMP
    ctx.save();
    ctx.translate(photoFrameX + 190, photoFrameY + 130);
    ctx.rotate(0.2);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(-120, -35, 240, 70);

    ctx.font = '900 18px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'center';
    ctx.fillText('★ ALL ACCESS ★', 0, -8);
    ctx.fillText('VIP GUEST PASS', 0, 18);
    ctx.restore();

    // Neon Frame Glow Borders
    ctx.strokeStyle = '#ff007a';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(photoFrameX, photoFrameY, photoFrameW, photoFrameH, 40);
    ctx.stroke();

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(photoFrameX - 5, photoFrameY - 5, photoFrameW + 10, photoFrameH + 10, 44);
    ctx.stroke();

    // VIP Member Wristband Tags
    if (members.length > 0) {
      const memberY = 1125;
      const tagWidth = Math.min(270, (width - 140) / members.length - 10);
      const totalW = members.length * tagWidth + (members.length - 1) * 10;
      let startX = (width - totalW) / 2;

      members.forEach((memName, idx) => {
        const tagX = startX + idx * (tagWidth + 10);
        ctx.fillStyle = idx % 2 === 0 ? '#ff007a' : '#7b2cbf';
        ctx.beginPath();
        ctx.roundRect(tagX, memberY, tagWidth, 58, 18);
        ctx.fill();

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 19px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let nameText = memName.trim();
        if (nameText.length > 14) nameText = nameText.slice(0, 12) + '..';
        ctx.fillText(`✨ ${nameText}`, tagX + tagWidth / 2, memberY + 29);
      });
    }

    // Bottom Club VIP Footer
    const footerY = 1210;
    ctx.fillStyle = '#0d0221';
    ctx.fillRect(55, footerY, photoFrameW, 235);

    ctx.strokeStyle = '#ff007a';
    ctx.lineWidth = 4;
    ctx.strokeRect(55, footerY, photoFrameW, 235);

    ctx.font = '900 48px sans-serif';
    ctx.fillStyle = '#ff007a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('गोवा 🪩', 90, footerY + 70);

    ctx.font = 'bold 20px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText("TITO'S NEON NIGHTS VIP FESTIVAL PASS · HACKER HOUSE 2026", 90, footerY + 115);

    // Prominent Highlighted #FrameInGoa Badge
    ctx.fillStyle = '#ff007a';
    ctx.beginPath();
    ctx.roundRect(90, footerY + 130, 270, 46, 12);
    ctx.fill();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '900 26px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('✨ #FrameInGoa', 90 + 135, footerY + 160);

    ctx.font = '900 20px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ff007a';
    ctx.textAlign = 'left';
    ctx.fillText('#TitosNeonNights  #HHGOA2026', 380, footerY + 160);

    ctx.font = '16px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.fillText('🪩 DANCE, CODE, SHIP & CELEBRATE UNDER THE STARS ✨', 90, footerY + 185);

    const qrCanvas = await getEventQRCodeCanvas('https://hhgoa-frame-studio.vercel.app/');
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, width - 225, footerY + 40, 145, 145);
    }
  }

  // =========================================================================
  // EDITION 5: ⛪ Old Goa Heritage — Portuguese Heritage Pass Edition 🏛️ (1200x1500)
  // =========================================================================
  else if (groupFrameStyle === 'heritage') {
    // Antique Parchment Scroll Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#fdf6e2');
    bgGrad.addColorStop(0.35, '#d97706');
    bgGrad.addColorStop(0.75, '#0a5c36');
    bgGrad.addColorStop(1, '#042616');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Rolled Scroll Top & Bottom Wooden Rod Handles
    ctx.fillStyle = '#d97706';
    ctx.fillRect(15, 0, width - 30, 24);
    ctx.fillRect(15, height - 24, width - 30, 24);
    ctx.fillStyle = '#0a5c36';
    ctx.fillRect(35, 4, width - 70, 16);
    ctx.fillRect(35, height - 20, width - 70, 16);

    // Portuguese Azulejo Filigree Border Frame
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 16;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = '#0a5c36';
    ctx.lineWidth = 5;
    ctx.strokeRect(46, 46, width - 92, height - 92);

    // Corner Royal Portugal Crest Icons
    ctx.font = '60px serif';
    ctx.textAlign = 'left';
    ctx.fillText('⛪', 60, 100);
    ctx.textAlign = 'right';
    ctx.fillText('⚜️', width - 60, 100);

    // Calligraphy Header
    ctx.font = '900 26px "Cinzel Decorative", serif, sans-serif';
    ctx.fillStyle = '#0a5c36';
    ctx.textAlign = 'center';
    ctx.fillText('🏛️ COMPANHIA DE GOA · BILHETE DE ENTRADA № 1510-2026 ⚜️', width / 2, 85);

    // Hashtag Ribbon
    ctx.fillStyle = '#0a5c36';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 300, 155, 600, 40, 10);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '900 22px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.fillText('✨ #FrameInGoa   #OldGoaHeritage   #HHGOA2026', width / 2, 181);

    // Gothic Cathedral Arch Photo Window (1090 x 880 - EXPANDED ROOM)
    const photoFrameX = 55;
    const photoFrameY = 215;
    const photoFrameW = width - 110;
    const photoFrameH = 880;
    const archRadius = photoFrameW / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(photoFrameX + archRadius, photoFrameY + archRadius, archRadius, Math.PI, 0, false);
    ctx.lineTo(photoFrameX + photoFrameW, photoFrameY + photoFrameH);
    ctx.lineTo(photoFrameX, photoFrameY + photoFrameH);
    ctx.closePath();
    ctx.clip();

    if (photo) {
      const scale = Math.max(photoFrameW / photo.width, photoFrameH / photo.height) * zoom;
      const drawW = photo.width * scale;
      const drawH = photo.height * scale;
      const drawX = photoFrameX + (photoFrameW - drawW) / 2 + panX;
      const drawY = photoFrameY + (photoFrameH - drawH) / 2 + panY;
      ctx.drawImage(photo, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = '#0a5c36';
      ctx.fillRect(photoFrameX, photoFrameY, photoFrameW, photoFrameH);

      ctx.font = '900 90px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⛪ 🌴 ⚜️ 📜', photoFrameX + photoFrameW / 2, photoFrameY + photoFrameH / 2 - 40);

      ctx.font = 'bold 36px "Cinzel Decorative", serif, sans-serif';
      ctx.fillStyle = '#fdf6e2';
      ctx.fillText('UPLOAD SQUAD PHOTO OR SNAP LIVE SELFIE', photoFrameX + photoFrameW / 2, photoFrameY + photoFrameH / 2 + 50);
    }
    ctx.restore();

    // Cathedral Arch Gold Trim Border
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(photoFrameX + archRadius, photoFrameY + archRadius, archRadius, Math.PI, 0, false);
    ctx.lineTo(photoFrameX + photoFrameW, photoFrameY + photoFrameH);
    ctx.lineTo(photoFrameX, photoFrameY + photoFrameH);
    ctx.closePath();
    ctx.stroke();

    // Member Parchment Tags
    if (members.length > 0) {
      const memberY = 1125;
      const tagWidth = Math.min(270, (width - 140) / members.length - 10);
      const totalW = members.length * tagWidth + (members.length - 1) * 10;
      let startX = (width - totalW) / 2;

      members.forEach((memName, idx) => {
        const tagX = startX + idx * (tagWidth + 10);
        ctx.fillStyle = idx % 2 === 0 ? '#d97706' : '#0a5c36';
        ctx.beginPath();
        ctx.roundRect(tagX, memberY, tagWidth, 58, 12);
        ctx.fill();

        ctx.strokeStyle = '#fdf6e2';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fdf6e2';
        ctx.font = '900 19px "Cinzel Decorative", serif, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let nameText = memName.trim();
        if (nameText.length > 14) nameText = nameText.slice(0, 12) + '..';
        ctx.fillText(`⚜️ ${nameText}`, tagX + tagWidth / 2, memberY + 29);
      });
    }

    // Bottom Heritage Footer
    const footerY = 1210;
    ctx.fillStyle = '#042616';
    ctx.fillRect(55, footerY, photoFrameW, 235);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.strokeRect(55, footerY, photoFrameW, 235);

    ctx.font = '900 48px sans-serif';
    ctx.fillStyle = '#d97706';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('गोवा ⛪', 90, footerY + 70);

    ctx.font = 'bold 20px "Cinzel Decorative", serif, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.fillText('OLD GOA PORTUGUESE HERITAGE PASS · HACKER HOUSE 2026', 90, footerY + 115);

    // Prominent Highlighted #FrameInGoa Badge
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.roundRect(90, footerY + 130, 270, 46, 12);
    ctx.fill();
    ctx.strokeStyle = '#fdf6e2';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '900 26px "Cinzel Decorative", serif, sans-serif';
    ctx.fillStyle = '#fdf6e2';
    ctx.textAlign = 'center';
    ctx.fillText('✨ #FrameInGoa', 90 + 135, footerY + 160);

    ctx.font = '900 20px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#d97706';
    ctx.textAlign = 'left';
    ctx.fillText('#OldGoaHeritage  #HHGOA2026', 380, footerY + 160);

    ctx.font = '16px "Cinzel Decorative", serif, sans-serif';
    ctx.fillStyle = '#fdf6e2';
    ctx.fillText('HONORING ARCHITECTURE, CULTURE & FUTURE BUILDERS ⚜️', 90, footerY + 185);

    const qrCanvas = await getEventQRCodeCanvas('https://hhgoa-frame-studio.vercel.app/');
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, width - 225, footerY + 40, 145, 145);
    }
  }

  // =========================================================================
  // EDITION 6: 🛵 Chapora Ride — Coastal Road Trip Permit Edition 🗺️ (1200x1500)
  // =========================================================================
  else {
    // Coastal Highway Roadtrip Backdrop
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#020b14');
    bgGrad.addColorStop(0.35, '#0a5c36');
    bgGrad.addColorStop(0.7, '#ffe500');
    bgGrad.addColorStop(1, '#ff4500');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Blue IND Hologram Badge on Left Margin
    const indX = 35;
    const indY = 85;
    ctx.fillStyle = '#003399';
    ctx.fillRect(indX, indY, 50, 110);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(indX, indY, 50, 110);

    ctx.font = '900 18px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('IND', indX + 25, indY + 35);
    ctx.font = '28px sans-serif';
    ctx.fillText('🇮🇳', indX + 25, indY + 80);

    // Top Permit License Registration Header
    ctx.font = '900 26px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.textAlign = 'center';
    ctx.fillText('🛵 CHAPORA RIDE · GOA COASTAL ROAD TRIP PERMIT GA-01 🌴', width / 2, 78);

    // Title
    ctx.font = '900 52px "Cinzel Decorative", serif, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.shadowColor = '#ff4500';
    ctx.shadowBlur = 14;
    ctx.fillText((squadName || 'GOA BUILDER SQUAD').toUpperCase(), width / 2, 138);
    ctx.shadowBlur = 0;

    // License Plate Route Hashtag Ribbon
    ctx.fillStyle = '#042616';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 340, 155, 680, 40, 12);
    ctx.fill();
    ctx.strokeStyle = '#ffe500';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '900 17px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.fillText('ROUTE: PANJIM ➔ ANJUNA ➔ CHAPORA FORT ➔ ARAMBOL 🛵', width / 2, 181);

    // Curved Scooter Windshield Photo Frame (1080 x 880 - EXPANDED PHOTO SPACE)
    const photoFrameX = 60;
    const photoFrameY = 215;
    const photoFrameW = width - 120; // 1080px
    const photoFrameH = 880;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoFrameX, photoFrameY, photoFrameW, photoFrameH, [44, 44, 18, 18]);
    ctx.clip();

    if (photo) {
      const scale = Math.max(photoFrameW / photo.width, photoFrameH / photo.height) * zoom;
      const drawW = photo.width * scale;
      const drawH = photo.height * scale;
      const drawX = photoFrameX + (photoFrameW - drawW) / 2 + panX;
      const drawY = photoFrameY + (photoFrameH - drawH) / 2 + panY;
      ctx.drawImage(photo, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = '#042616';
      ctx.fillRect(photoFrameX, photoFrameY, photoFrameW, photoFrameH);

      ctx.font = '900 90px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛵 🌴 🌊 🕶️', photoFrameX + photoFrameW / 2, photoFrameY + photoFrameH / 2 - 40);

      ctx.font = 'bold 36px "Courier New", monospace, sans-serif';
      ctx.fillStyle = '#ffe500';
      ctx.fillText('UPLOAD SQUAD PHOTO OR SNAP LIVE SELFIE', photoFrameX + photoFrameW / 2, photoFrameY + photoFrameH / 2 + 50);
    }
    ctx.restore();

    // Speedometer & Fuel Gauge Widget Overlay
    ctx.fillStyle = 'rgba(4, 38, 22, 0.85)';
    ctx.beginPath();
    ctx.roundRect(photoFrameX + 25, photoFrameY + 25, 340, 46, 12);
    ctx.fill();
    ctx.strokeStyle = '#ffe500';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '900 16px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.textAlign = 'left';
    ctx.fillText('⚡ SPEED: 100 KM/H | FUEL: F [████] E', photoFrameX + 35, photoFrameY + 53);

    // Frame Borders
    ctx.strokeStyle = '#ffe500';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(photoFrameX, photoFrameY, photoFrameW, photoFrameH, [44, 44, 18, 18]);
    ctx.stroke();

    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(photoFrameX - 6, photoFrameY - 6, photoFrameW + 12, photoFrameH + 12, [48, 48, 22, 22]);
    ctx.stroke();

    // Member License Tags
    if (members.length > 0) {
      const memberY = 1125;
      const tagWidth = Math.min(270, (width - 140) / members.length - 10);
      const totalW = members.length * tagWidth + (members.length - 1) * 10;
      let startX = (width - totalW) / 2;

      members.forEach((memName, idx) => {
        const tagX = startX + idx * (tagWidth + 10);
        ctx.fillStyle = idx % 2 === 0 ? '#ffe500' : '#ff4500';
        ctx.beginPath();
        ctx.roundRect(tagX, memberY, tagWidth, 58, 14);
        ctx.fill();

        ctx.strokeStyle = '#042616';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = idx % 2 === 0 ? '#042616' : '#ffffff';
        ctx.font = '900 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let nameText = memName.trim();
        if (nameText.length > 13) nameText = nameText.slice(0, 11) + '..';
        ctx.fillText(`GA-01 • ${nameText}`, tagX + tagWidth / 2, memberY + 29);
      });
    }

    // Bottom Roadtrip Footer
    const footerY = 1210;
    ctx.fillStyle = '#042616';
    ctx.fillRect(60, footerY, photoFrameW, 235);

    ctx.strokeStyle = '#ffe500';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, footerY, photoFrameW, 235);

    ctx.font = '900 48px sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('गोवा 🛵', 90, footerY + 70);

    ctx.font = 'bold 20px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.fillText('CHAPORA ROAD TRIP PERMIT GA-01 · HACKER HOUSE 2026', 90, footerY + 115);

    // Prominent Highlighted #FrameInGoa Badge
    ctx.fillStyle = '#ffe500';
    ctx.beginPath();
    ctx.roundRect(90, footerY + 130, 270, 46, 12);
    ctx.fill();
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '900 26px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#042616';
    ctx.textAlign = 'center';
    ctx.fillText('✨ #FrameInGoa', 90 + 135, footerY + 160);

    ctx.font = '900 20px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ff4500';
    ctx.textAlign = 'left';
    ctx.fillText('#ChaporaRide  #HHGOA2026', 380, footerY + 160);

    ctx.font = '16px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#e5c200';
    ctx.fillText('🛵 CRUISING THE COASTAL HIGHWAY TO CHAPORA FORT & HH GOA 🌴', 90, footerY + 185);

    const qrCanvas = await getEventQRCodeCanvas('https://hhgoa-frame-studio.vercel.app/');
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, width - 225, footerY + 40, 145, 145);
    }
  }

  // Render Stickers if enabled
  if (stickers && stickers.length > 0) {
    stickers.forEach((st) => {
      const pos = stickerPositions[st] || { x: width / 2, y: height / 2 };
      ctx.font = '72px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(st, pos.x, pos.y);
    });
  }

  ctx.restore();
}
