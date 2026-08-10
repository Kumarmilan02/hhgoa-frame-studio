'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RotateCw, Sparkles, RefreshCw, Layers, X, Eye, Download, Video, Camera, Loader2, Upload } from 'lucide-react';

interface Card3DViewerProps {
  sourceCanvas: HTMLCanvasElement | null;
  format?: 'formatA' | 'formatB' | 'formatC';
  name?: string;
  role?: string;
  isOpen: boolean;
  onClose: () => void;
  autoStartRecording?: boolean;
  onUploadPhoto?: () => void;
  onSnapSelfie?: () => void;
  groupFrameStyle?: 'sunset' | 'shack' | 'cyberpunk' | 'neon_party' | 'heritage' | 'scooty_cruise';
  onGroupFrameStyleChange?: (style: 'sunset' | 'shack' | 'cyberpunk' | 'neon_party' | 'heritage' | 'scooty_cruise') => void;
}

export default function Card3DViewer({
  sourceCanvas,
  format = 'formatA',
  name = '',
  role = '',
  isOpen,
  onClose,
  autoStartRecording = false,
  onUploadPhoto,
  onSnapSelfie,
  groupFrameStyle = 'sunset',
  onGroupFrameStyleChange,
}: Card3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cardGroupRef = useRef<THREE.Group | null>(null);
  const frontTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Drag interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.1, y: 0.15 });
  const currentRotationRef = useRef({ x: 0.1, y: 0.15 });

  // Generate Back Texture on an offscreen canvas (Theme-matching for all 6 squad editions)
  const createBackCanvas = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Default Format A/B Backside (Dark Goa Emerald PVC Badge)
    if (format !== 'formatC') {
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
      bgGrad.addColorStop(0, '#042616');
      bgGrad.addColorStop(0.5, '#0a5c36');
      bgGrad.addColorStop(1, '#02180e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1350);

      ctx.strokeStyle = '#ffe500';
      ctx.lineWidth = 16;
      ctx.strokeRect(30, 30, 1020, 1290);

      ctx.strokeStyle = '#ff007a';
      ctx.lineWidth = 6;
      ctx.strokeRect(50, 50, 980, 1250);

      ctx.fillStyle = '#042616';
      ctx.beginPath();
      ctx.roundRect(470, 70, 140, 36, 18);
      ctx.fill();
      ctx.strokeStyle = '#ffe500';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 160, 1080, 180);
      ctx.fillStyle = '#222222';
      ctx.fillRect(0, 190, 1080, 120);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(80, 400, 700, 100);
      ctx.font = 'italic bold 36px "Courier New", monospace';
      ctx.fillStyle = '#111111';
      ctx.fillText(name || 'AUTHORIZED BUILDER', 110, 465);

      ctx.fillStyle = '#ffe500';
      ctx.fillRect(820, 400, 180, 100);
      ctx.fillStyle = '#ff007a';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('SECURITY', 840, 440);
      ctx.fillText('PASS', 840, 470);

      ctx.font = '22px "Courier New", monospace';
      ctx.fillStyle = '#e5c200';
      ctx.fillText('• OFFICIAL HACKER HOUSE GOA ID BADGE', 80, 560);
      ctx.fillText('• ACCESS TO ALL HACKING BAYS & SUNSET SESSIONS', 80, 600);
      ctx.fillText('• NON-TRANSFERABLE · PROPERTY OF 2:47 PM STUDIO', 80, 640);
      ctx.fillText('• VALID: OCT 28 - OCT 31, 2026', 80, 680);

      ctx.font = '120px sans-serif';
      ctx.fillText('🌴 🛵 🥥 🌊', 280, 840);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(120, 940, 840, 140);
      ctx.fillStyle = '#000000';
      const barWidths = [12, 6, 24, 8, 18, 6, 30, 12, 6, 20, 14, 6, 28, 8, 16, 24, 6, 12, 20, 8, 14, 28, 6, 18, 10, 24, 6, 12, 18, 8, 22, 6, 14, 28, 8, 16, 12, 6, 24];
      let currX = 150;
      barWidths.forEach((w, idx) => {
        if (idx % 2 === 0) ctx.fillRect(currX, 955, w, 110);
        currX += w + 6;
      });

      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#ffe500';
      ctx.textAlign = 'center';
      ctx.fillText('HACKER HOUSE GOA 2026 · CODINGKOALAS', 540, 1220);
      return canvas;
    }

    // =========================================================================
    // FORMAT C SQUAD PASS BACKSIDES (6 Unique Real-World Object Back Covers)
    // =========================================================================
    if (groupFrameStyle === 'sunset') {
      // 🌅 Anjuna Sunset Passport Back Cover
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
      bgGrad.addColorStop(0, '#02180e');
      bgGrad.addColorStop(0.5, '#0a5c36');
      bgGrad.addColorStop(1, '#ffe500');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1350);

      ctx.strokeStyle = '#ffe500';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, 1020, 1290);

      ctx.font = '900 36px "Cinzel Decorative", serif';
      ctx.fillStyle = '#ffe500';
      ctx.textAlign = 'center';
      ctx.fillText('REPUBLIC OF GOA BUILDER PASSPORT', 540, 110);
      ctx.fillText('OFFICIAL EMERGENCY & EMBASSY PAGE', 540, 160);

      ctx.fillStyle = '#042616';
      ctx.fillRect(80, 200, 920, 720);
      ctx.strokeStyle = '#ff007a';
      ctx.lineWidth = 4;
      ctx.strokeRect(80, 200, 920, 720);

      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.fillStyle = '#ffe500';
      ctx.textAlign = 'left';
      ctx.fillText('IMPORTANT PASSPORT INSTRUCTIONS:', 110, 260);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px "Courier New", monospace';
      ctx.fillText('1. THIS PASSPORT IS PROPERTY OF HACKER HOUSE GOA 2026.', 110, 310);
      ctx.fillText('2. ENTITLES BEARER TO UNLIMITED SUNSET & HACK SESSIONS.', 110, 360);
      ctx.fillText('3. IF LOST, REPORT IMMEDIATELY TO ANJUNA BEACH BAY HQ.', 110, 410);

      // Professional Technical Barcode Array (Replaces emojis)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(110, 470, 860, 140);
      ctx.fillStyle = '#000000';
      for (let bx = 130; bx < 940; bx += 8) {
        const bWidth = Math.random() > 0.4 ? 4 : 2;
        ctx.fillRect(bx, 485, bWidth, 110);
      }

      ctx.font = '900 24px "Courier New", monospace';
      ctx.fillStyle = '#ff007a';
      ctx.textAlign = 'center';
      ctx.fillText('SECURITY HASH: 0x4848474F41_PASSPORT_8849', 540, 660);
      ctx.fillText('EMBASSY STAMP: ANJUNA BEACH · OCT 2026', 540, 710);
      ctx.fillText('✨ #FrameInGoa  #AnjunaSunsetPassport', 540, 760);

      // MRZ Barcode Code
      ctx.fillStyle = '#042616';
      ctx.fillRect(80, 960, 920, 300);
      ctx.strokeStyle = '#ffe500';
      ctx.lineWidth = 3;
      ctx.strokeRect(80, 960, 920, 300);

      ctx.font = '900 38px "Courier New", monospace';
      ctx.fillStyle = '#ff007a';
      ctx.textAlign = 'left';
      ctx.fillText('P<INDGOA<<HACKER<<PASSPORT<<2026<<<<<<<<', 110, 1040);
      ctx.fillText('GOA20260810<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<', 110, 1100);
      ctx.fillStyle = '#ffe500';
      ctx.font = 'bold 22px "Courier New", monospace';
      ctx.fillText('GOA IMMIGRATION AUTHORIZED ENTRY PASS · HH GOA', 110, 1180);

    } else if (groupFrameStyle === 'shack') {
      // 🍹 Baga Beach Shack Drinks Menu Back
      ctx.fillStyle = '#180e04';
      ctx.fillRect(0, 0, 1080, 1350);

      ctx.strokeStyle = '#e5c200';
      ctx.lineWidth = 16;
      ctx.strokeRect(30, 30, 1020, 1290);

      ctx.font = '900 38px "Cinzel Decorative", serif';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'center';
      ctx.fillText('BAGA BEACH SHACK · SPECIAL DRINKS MENU', 540, 100);

      ctx.fillStyle = '#fdf6e2';
      ctx.fillRect(80, 150, 920, 1020);
      ctx.strokeStyle = '#c84b15';
      ctx.lineWidth = 4;
      ctx.strokeRect(80, 150, 920, 1020);

      ctx.font = '900 28px "Courier New", monospace';
      ctx.fillStyle = '#c84b15';
      ctx.textAlign = 'left';
      ctx.fillText('═══ DAILY SHACK SPECIALS & REFRESHMENTS ═══', 120, 220);

      ctx.font = 'bold 22px "Courier New", monospace';
      ctx.fillStyle = '#042616';
      ctx.fillText('1. FRESH COCONUT FENI SHOT ......... 100 PTS / FREE', 120, 290);
      ctx.fillText('2. ANJUNA SUNSET SUNRISER COCKTAIL ... INCLUDED WITH PASS', 120, 350);
      ctx.fillText('3. HIGH TIDE CRAB SPECIAL FRY ........ UNLIMITED SHIP', 120, 410);
      ctx.fillText('4. BAGA BEACH COCONUT WATER .......... ON TAP ALL DAY', 120, 470);

      // Professional Venue Access Barcode (Replaces emojis)
      ctx.fillStyle = '#042616';
      ctx.fillRect(120, 520, 840, 140);
      ctx.fillStyle = '#ffe500';
      ctx.fillRect(140, 535, 800, 110);
      ctx.fillStyle = '#000000';
      for (let bx = 160; bx < 920; bx += 10) {
        const bWidth = Math.random() > 0.3 ? 5 : 2;
        ctx.fillRect(bx, 550, bWidth, 80);
      }

      ctx.font = '900 26px "Courier New", monospace';
      ctx.fillStyle = '#c84b15';
      ctx.textAlign = 'center';
      ctx.fillText('PERMIT NO: GA-BAGA-2026-9912 · VENUE PASS', 540, 710);
      ctx.fillText('SERVED COLD AT BAGA BEACH, GOA', 540, 760);
      ctx.fillText('✨ #FrameInGoa  #BagaBeachShack', 540, 800);

      // Barcode simulation
      ctx.fillStyle = '#042616';
      ctx.fillRect(120, 860, 840, 120);
      ctx.fillStyle = '#00f0ff';
      ctx.font = '900 22px "Courier New", monospace';
      ctx.fillText('BAGA-SHACK-MENU-PASS-2026', 540, 930);

      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#ffe500';
      ctx.fillText('HACKER HOUSE GOA 2026 · BAGA BEACH HQ', 540, 1230);

    } else if (groupFrameStyle === 'cyberpunk') {
      // 💻 Vagator Night Hack Cyber Keycard Back
      ctx.fillStyle = '#020f08';
      ctx.fillRect(0, 0, 1080, 1350);

      // Matrix Rain Lines
      ctx.strokeStyle = '#0c4729';
      ctx.lineWidth = 1.5;
      for (let gx = 0; gx < 1080; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, 1350);
        ctx.stroke();
      }

      ctx.strokeStyle = '#ffe500';
      ctx.lineWidth = 10;
      ctx.strokeRect(30, 30, 1020, 1290);

      ctx.font = '900 34px "Courier New", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'center';
      ctx.fillText('VAGATOR CYBER ACCESS KEYCARD REVERSE', 540, 100);

      ctx.fillStyle = '#042616';
      ctx.fillRect(70, 140, 940, 1000);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.strokeRect(70, 140, 940, 1000);

      ctx.font = '900 24px "Courier New", monospace';
      ctx.fillStyle = '#ffe500';
      ctx.textAlign = 'left';
      ctx.fillText('[SYSTEM_ROOT_TERMINAL // AUDIT LOG]', 100, 200);
      ctx.fillText('> ACCESS_LEVEL: LEVEL 5 OVERLORD [OK]', 100, 250);
      ctx.fillText('> BIOMETRIC_HASH: 0x4848474F41_HHGOA', 100, 300);
      ctx.fillText('> ENCRYPTION: 4096-BIT RSA CYBER KEY', 100, 350);

      // Single Cyber Security Code128 Barcode
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(100, 420, 880, 140);
      ctx.fillStyle = '#020f08';
      for (let bx = 120; bx < 960; bx += 6) {
        const bWidth = Math.random() > 0.4 ? 3 : 1.5;
        ctx.fillRect(bx, 435, bWidth, 110);
      }

      ctx.font = '900 26px "Courier New", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'center';
      ctx.fillText('✨ #FrameInGoa // #VagatorNightHack', 540, 610);

      // EMV Cyber Security Chip & PCB Terminal Plate (Replaces 2nd barcode)
      ctx.fillStyle = '#ffe500';
      ctx.fillRect(100, 680, 880, 80);
      ctx.fillStyle = '#020f08';
      ctx.font = '900 24px "Courier New", monospace';
      ctx.fillText('EMV CHIP ID: GOA-VAGATOR-2026-KEY', 540, 730);

      // High-Tech Cyber Circuit Diagram Box
      ctx.fillStyle = '#042616';
      ctx.fillRect(100, 800, 880, 200);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.strokeRect(100, 800, 880, 200);

      ctx.font = '900 22px "Courier New", monospace';
      ctx.fillStyle = '#ffe500';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ SECURITY CLEARANCE: AUTHORIZED HACKER ⚡', 540, 860);
      ctx.fillStyle = '#00f0ff';
      ctx.font = '20px "Courier New", monospace';
      ctx.fillText('BIOMETRIC SCAN PASSED · ENCRYPTION: 4096-BIT RSA', 540, 910);
      ctx.fillText('VAGATOR HACKER HOUSE CYBER BAY HQ', 540, 950);

      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.fillStyle = '#ffe500';
      ctx.textAlign = 'center';
      ctx.fillText('COORDINATES: 15.6028° N, 73.7431° E · VAGATOR LAB', 540, 1220);

    } else if (groupFrameStyle === 'neon_party') {
      // 🪩 Tito's Neon Nights VIP Back
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
      bgGrad.addColorStop(0, '#0d0221');
      bgGrad.addColorStop(0.5, '#7b2cbf');
      bgGrad.addColorStop(1, '#ff007a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1350);

      ctx.strokeStyle = '#ff007a';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, 1020, 1290);

      ctx.font = '900 36px "Cinzel Decorative", serif';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'center';
      ctx.fillText("TITO'S NEON NIGHTS · VIP BACKSTAGE PASS", 540, 100);

      ctx.fillStyle = '#0d0221';
      ctx.fillRect(70, 150, 940, 1020);
      ctx.strokeStyle = '#ff007a';
      ctx.lineWidth = 4;
      ctx.strokeRect(70, 150, 940, 1020);

      ctx.font = '900 28px "Courier New", monospace';
      ctx.fillStyle = '#ffe500';
      ctx.textAlign = 'center';
      ctx.fillText('★ VIP CONCERT STAGE LINEUP SCHEDULE ★', 540, 220);

      ctx.font = 'bold 22px "Courier New", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'left';
      ctx.fillText('• 22:00 - DJ HACKER SUNSET BEATS', 110, 290);
      ctx.fillText('• 00:00 - MAIN STAGE SHIPMENT PARTY', 110, 350);
      ctx.fillText('• 03:00 - AFTERHOURS CODE & CHILL SESSION', 110, 410);

      // VIP Pass Holographic Foil Barcode Box (Replaces emojis)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(100, 470, 880, 140);
      ctx.fillStyle = '#0d0221';
      for (let bx = 120; bx < 960; bx += 8) {
        const bWidth = Math.random() > 0.4 ? 4 : 2;
        ctx.fillRect(bx, 485, bWidth, 110);
      }

      ctx.font = '900 26px "Courier New", monospace';
      ctx.fillStyle = '#ff007a';
      ctx.textAlign = 'center';
      ctx.fillText('✨ #FrameInGoa  #TitosNeonNights', 540, 665);

      // VIP Rubber stamp box
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 6;
      ctx.strokeRect(240, 730, 600, 140);
      ctx.font = '900 36px "Courier New", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('ALL ACCESS VIP GUEST', 540, 790);
      ctx.fillText('OCT 28-31 · GOA 2026', 540, 840);

      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#ffe500';
      ctx.fillText("TITO'S LANE, BAGA, GOA · HACKER HOUSE 2026", 540, 1230);

    } else if (groupFrameStyle === 'heritage') {
      // ⛪ Old Goa Heritage Scroll Back
      ctx.fillStyle = '#fdf6e2';
      ctx.fillRect(0, 0, 1080, 1350);

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 16;
      ctx.strokeRect(30, 30, 1020, 1290);
      ctx.strokeStyle = '#0a5c36';
      ctx.lineWidth = 5;
      ctx.strokeRect(48, 48, 984, 1254);

      ctx.font = '900 36px "Cinzel Decorative", serif';
      ctx.fillStyle = '#0a5c36';
      ctx.textAlign = 'center';
      ctx.fillText('COMPANHIA DE GOA · REGISTRO HISTÓRICO', 540, 110);

      ctx.fillStyle = '#0a5c36';
      ctx.fillRect(80, 160, 920, 1000);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.strokeRect(80, 160, 920, 1000);

      ctx.font = '900 28px "Cinzel Decorative", serif';
      ctx.fillStyle = '#ffe500';
      ctx.fillText('TERMOS E CONDIÇÕES DE ACESSO HISTÓRICO', 540, 230);

      ctx.font = '20px "Cinzel Decorative", serif';
      ctx.fillStyle = '#fdf6e2';
      ctx.textAlign = 'left';
      ctx.fillText('1. ESTE PASSE CONCEDE ENTRADA AOS MONUMENTOS DE GOA.', 110, 300);
      ctx.fillText('2. HOMENAGEANDO A ARQUITETURA E OS CONSTRUTORES DO FUTURO.', 110, 360);
      ctx.fillText('3. EMISSÃO OFICIAL: CIDADE DE GOA, 1510-2026.', 110, 420);

      // Official Document Archival Security Barcode (Replaces emojis)
      ctx.fillStyle = '#0a5c36';
      ctx.fillRect(100, 470, 880, 130);
      ctx.fillStyle = '#fdf6e2';
      ctx.fillRect(120, 485, 840, 100);
      ctx.fillStyle = '#0a5c36';
      for (let bx = 140; bx < 940; bx += 8) {
        const bWidth = Math.random() > 0.3 ? 4 : 2;
        ctx.fillRect(bx, 495, bWidth, 80);
      }

      ctx.font = '900 26px "Cinzel Decorative", serif';
      ctx.fillStyle = '#ffe500';
      ctx.textAlign = 'center';
      ctx.fillText('✨ #FrameInGoa  #OldGoaHeritage', 540, 650);

      // Royal Wax Seal Graphic
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(540, 840, 100, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffe500';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.font = '900 22px "Cinzel Decorative", serif';
      ctx.fillStyle = '#fdf6e2';
      ctx.fillText('SELO REAL', 540, 835);
      ctx.fillText('GOA 2026', 540, 865);

      ctx.font = 'bold 24px "Cinzel Decorative", serif';
      ctx.fillStyle = '#0a5c36';
      ctx.fillText('OLD GOA HERITAGE PASS · HACKER HOUSE 2026', 540, 1220);

    } else {
      // 🛵 Chapora Ride Coastal Permit Back
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
      bgGrad.addColorStop(0, '#020b14');
      bgGrad.addColorStop(0.5, '#0a5c36');
      bgGrad.addColorStop(1, '#ff4500');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1350);

      ctx.strokeStyle = '#ffe500';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, 1020, 1290);

      ctx.font = '900 36px "Courier New", monospace';
      ctx.fillStyle = '#ffe500';
      ctx.textAlign = 'center';
      ctx.fillText('CHAPORA ROAD TRIP PERMIT GA-01 REVERSE', 540, 100);

      ctx.fillStyle = '#042616';
      ctx.fillRect(70, 150, 940, 1020);
      ctx.strokeStyle = '#ff4500';
      ctx.lineWidth = 4;
      ctx.strokeRect(70, 150, 940, 1020);

      ctx.font = '900 28px "Courier New", monospace';
      ctx.fillStyle = '#ffe500';
      ctx.fillText('═══ COASTAL HIGHWAY PERMIT RULES ═══', 540, 220);

      ctx.font = 'bold 22px "Courier New", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText('• ROUTE: PANJIM ➔ ANJUNA ➔ CHAPORA FORT ➔ ARAMBOL', 110, 290);
      ctx.fillText('• HELMET: MANDATORY FOR SCOOTER RIDE', 110, 350);
      ctx.fillText('• SPEED LIMIT: 100 KM/H ON HIGHWAY BAYS', 110, 410);
      ctx.fillText('• FUEL STATION: ARAMBOL COASTAL BAY', 110, 470);

      // State Transport Registration Barcode (Replaces emojis)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(100, 520, 880, 130);
      ctx.fillStyle = '#042616';
      for (let bx = 120; bx < 960; bx += 8) {
        const bWidth = Math.random() > 0.4 ? 4 : 2;
        ctx.fillRect(bx, 535, bWidth, 100);
      }

      ctx.font = '900 26px "Courier New", monospace';
      ctx.fillStyle = '#ff4500';
      ctx.textAlign = 'center';
      ctx.fillText('✨ #FrameInGoa  #ChaporaRide', 540, 700);

      // License tag graphic
      ctx.fillStyle = '#ffe500';
      ctx.fillRect(160, 780, 760, 140);
      ctx.strokeStyle = '#042616';
      ctx.lineWidth = 4;
      ctx.strokeRect(160, 780, 760, 140);

      ctx.font = '900 44px sans-serif';
      ctx.fillStyle = '#042616';
      ctx.fillText('GA-01 • ROADTRIP • 2026', 540, 885);

      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#ffe500';
      ctx.fillText('CHAPORA FORT ROADTRIP PERMIT · HACKER HOUSE 2026', 540, 1230);
    }

    return canvas;
  }, [format, groupFrameStyle, name]);

  // Create proper woven fabric lanyard strap texture with repeating text "HHGOA 2026 🌴 HACKER HOUSE GOA"
  const createLanyardFabricTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Dark Emerald woven fabric lanyard background
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 0);
    bgGrad.addColorStop(0, '#042616');
    bgGrad.addColorStop(0.5, '#0d6b40');
    bgGrad.addColorStop(1, '#042616');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 128);

    // Gold Top & Bottom Edge Borders
    ctx.fillStyle = '#ffe500';
    ctx.fillRect(0, 0, 1024, 10);
    ctx.fillRect(0, 118, 1024, 10);

    // Neon Pink Pinstripes
    ctx.fillStyle = '#ff007a';
    ctx.fillRect(0, 10, 1024, 5);
    ctx.fillRect(0, 113, 1024, 5);

    // Printed Text: "HHGOA 2026 🌴 HACKER HOUSE GOA"
    ctx.font = '900 46px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#ffe500';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const textUnit = '🌴 HHGOA 2026 · HACKER HOUSE GOA   ';
    let x = 20;
    while (x < 1024) {
      ctx.fillText(textUnit, x, 64);
      x += ctx.measureText(textUnit).width;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.5, 1);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // Helper to build 3D card assembly
  const buildCard3DAssembly = useCallback((renderer: THREE.WebGLRenderer) => {
    const cardGroup = new THREE.Group();

    const cardWidth = 3.2;
    const cardHeight = 4.0;
    const cardDepth = 0.08;

    // Crisp Front Texture from 2D Canvas
    let frontTexture: THREE.CanvasTexture;
    if (sourceCanvas) {
      frontTexture = new THREE.CanvasTexture(sourceCanvas);
      frontTexture.colorSpace = THREE.SRGBColorSpace;
      frontTexture.minFilter = THREE.LinearFilter;
      frontTexture.magFilter = THREE.LinearFilter;
      frontTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    } else {
      const dummyCanvas = document.createElement('canvas');
      dummyCanvas.width = 1080;
      dummyCanvas.height = 1350;
      frontTexture = new THREE.CanvasTexture(dummyCanvas);
    }

    // Back Texture with Crisp Anisotropy
    const backCanvas = createBackCanvas();
    const backTexture = new THREE.CanvasTexture(backCanvas);
    backTexture.colorSpace = THREE.SRGBColorSpace;
    backTexture.minFilter = THREE.LinearFilter;
    backTexture.magFilter = THREE.LinearFilter;
    backTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Materials
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a5c36,
      roughness: 0.3,
      metalness: 0.2,
    });

    const frontMaterial = new THREE.MeshStandardMaterial({
      map: frontTexture,
      roughness: 0.1,
      metalness: 0.02,
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      roughness: 0.15,
      metalness: 0.02,
    });

    const materials = [
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      frontMaterial,
      backMaterial,
    ];

    const cardGeometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth);
    const cardMesh = new THREE.Mesh(cardGeometry, materials);
    cardGroup.add(cardMesh);

    // Subtle Hologram Overlay
    const holoGeo = new THREE.PlaneGeometry(cardWidth * 0.98, cardHeight * 0.98);
    const holoMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
      roughness: 0.1,
      metalness: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const holoMesh = new THREE.Mesh(holoGeo, holoMat);
    holoMesh.position.z = cardDepth / 2 + 0.002;
    cardGroup.add(holoMesh);

    // Woven Fabric Lanyard Assembly with Text "HHGOA 2026 🌴 HACKER HOUSE GOA"
    const lanyardGroup = new THREE.Group();
    lanyardGroup.position.set(0, cardHeight / 2 + 0.12, 0);

    // Metallic Silver Clasp Ring
    const clipGeo = new THREE.TorusGeometry(0.22, 0.04, 16, 32);
    const clipMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      metalness: 0.95,
      roughness: 0.15,
    });
    const clipMesh = new THREE.Mesh(clipGeo, clipMat);
    lanyardGroup.add(clipMesh);

    // Metallic Strap Holder Clamp
    const clampGeo = new THREE.BoxGeometry(0.5, 0.2, 0.12);
    const clampMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.9,
      roughness: 0.2,
    });
    const clampMesh = new THREE.Mesh(clampGeo, clampMat);
    clampMesh.position.set(0, 0.2, 0);
    lanyardGroup.add(clampMesh);

    // Ribbon Strap
    const lanyardTexture = createLanyardFabricTexture();
    const lanyardMat = new THREE.MeshStandardMaterial({
      map: lanyardTexture,
      roughness: 0.5,
      side: THREE.DoubleSide,
    });

    const strapGeo = new THREE.PlaneGeometry(0.38, 3.8);
    const leftStrap = new THREE.Mesh(strapGeo, lanyardMat);
    leftStrap.position.set(-0.14, 2.0, 0);
    leftStrap.rotation.z = -0.06;
    lanyardGroup.add(leftStrap);

    const rightStrap = new THREE.Mesh(strapGeo, lanyardMat);
    rightStrap.position.set(0.14, 2.0, 0);
    rightStrap.rotation.z = 0.06;
    lanyardGroup.add(rightStrap);

    cardGroup.add(lanyardGroup);

    return { cardGroup, frontTexture };
  }, [sourceCanvas, createBackCanvas, createLanyardFabricTexture]);

  // Setup Three.js Scene inside Pop-Up Modal
  useEffect(() => {
    if (!isOpen) return;

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Dual-Sided Bright Front & Back Lighting (Ensures both sides are 100% brightly lit!)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 2.2);
    frontLight.position.set(0, 0, 8);
    scene.add(frontLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 2.2);
    backLight.position.set(0, 0, -8);
    scene.add(backLight);

    const mainSpot = new THREE.SpotLight(0xffffff, 2.0);
    mainSpot.position.set(6, 9, 8);
    scene.add(mainSpot);

    const pinkFill = new THREE.PointLight(0xff007a, 1.2, 20);
    pinkFill.position.set(-6, -4, 5);
    scene.add(pinkFill);

    const yellowFill = new THREE.PointLight(0xffe500, 1.2, 20);
    yellowFill.position.set(6, -4, 5);
    scene.add(yellowFill);

    // 4. Build 3D Card Group
    const { cardGroup, frontTexture } = buildCard3DAssembly(renderer);
    cardGroupRef.current = cardGroup;
    frontTextureRef.current = frontTexture;
    scene.add(cardGroup);

    targetRotationRef.current = { x: 0.1, y: 0.15 };
    currentRotationRef.current = { x: 0.1, y: 0.15 };

    // 5. Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (frontTextureRef.current && sourceCanvas) {
        frontTextureRef.current.needsUpdate = true;
      }

      if (autoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y += delta * 0.5;
      }

      if (isFlipped) {
        targetRotationRef.current.y = Math.PI + (autoRotate ? targetRotationRef.current.y % (Math.PI * 2) : 0);
      }

      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;

      if (cardGroupRef.current) {
        cardGroupRef.current.rotation.x = currentRotationRef.current.x;
        cardGroupRef.current.rotation.y = currentRotationRef.current.y;
        cardGroupRef.current.position.y = Math.sin(now * 0.002) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [isOpen, sourceCanvas, buildCard3DAssembly, autoRotate, isFlipped]);

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;
    targetRotationRef.current.y += deltaX * 0.01;
    targetRotationRef.current.x += deltaY * 0.01;
    targetRotationRef.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationRef.current.x));
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleShowFront = () => {
    setIsFlipped(false);
    setAutoRotate(false);
    targetRotationRef.current = { x: 0, y: 0 };
  };

  const handleShowBack = () => {
    setIsFlipped(true);
    setAutoRotate(false);
    targetRotationRef.current = { x: 0, y: Math.PI };
  };

  const handleFlipCard = () => {
    setIsFlipped((prev) => !prev);
    targetRotationRef.current.y += Math.PI;
  };

  // RECORD 9:16 VERTICAL 3D SPIN VIDEO OVER EXACTLY 6.0 SECONDS
  const handleDownload3DSpin = async () => {
    setIsRecording(true);
    setRecordingProgress(0);

    try {
      // 1. Create 9:16 Offscreen Canvas (540x960 vertical Reel format)
      const recWidth = 540;
      const recHeight = 960;
      const recCanvas = document.createElement('canvas');
      recCanvas.width = recWidth;
      recCanvas.height = recHeight;

      const recRenderer = new THREE.WebGLRenderer({
        canvas: recCanvas,
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
      });
      recRenderer.setSize(recWidth, recHeight);
      recRenderer.setPixelRatio(2);
      recRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      recRenderer.toneMappingExposure = 1.4;

      // 2. 9:16 Scene & Camera
      const recScene = new THREE.Scene();

      // Tropical Dark Backdrop Canvas
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = 540;
      bgCanvas.height = 960;
      const bgCtx = bgCanvas.getContext('2d');
      if (bgCtx) {
        const grad = bgCtx.createLinearGradient(0, 0, 0, 960);
        grad.addColorStop(0, '#02180e');
        grad.addColorStop(0.5, '#042616');
        grad.addColorStop(1, '#010f09');
        bgCtx.fillStyle = grad;
        bgCtx.fillRect(0, 0, 540, 960);
      }
      recScene.background = new THREE.CanvasTexture(bgCanvas);

      const recCamera = new THREE.PerspectiveCamera(45, recWidth / recHeight, 0.1, 1000);
      recCamera.position.set(0, 0, 8.2);

      // 3. Dual Bright Front & Rear Directional Lighting for Crisp Front & Back Visibility
      const ambient = new THREE.AmbientLight(0xffffff, 1.6);
      recScene.add(ambient);

      const fLight = new THREE.DirectionalLight(0xffffff, 2.2);
      fLight.position.set(0, 0, 10);
      recScene.add(fLight);

      const bLight = new THREE.DirectionalLight(0xffffff, 2.2);
      bLight.position.set(0, 0, -10);
      recScene.add(bLight);

      const spot = new THREE.SpotLight(0xffffff, 2.0);
      spot.position.set(6, 10, 8);
      recScene.add(spot);

      // Build 3D Card Group for Recording
      const { cardGroup } = buildCard3DAssembly(recRenderer);
      recScene.add(cardGroup);

      // 4. Setup MediaRecorder for 9:16 Stream
      const stream = (recCanvas as any).captureStream ? (recCanvas as any).captureStream(30) : null;
      if (!stream) {
        setIsRecording(false);
        return;
      }

      const mimeType = typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name ? name.trim().replace(/\s+/g, '_') : 'HHGOA'}_3D_Spin_9x16.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        recRenderer.dispose();
        setIsRecording(false);
        setRecordingProgress(0);
      };

      mediaRecorder.start();

      // 5. 360° Smooth Spin Loop over Exactly 6.0 Seconds (6000ms)
      const startTime = performance.now();
      const duration = 6000;

      const recordLoop = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1.0);
        setRecordingProgress(Math.floor(progress * 100));

        // Rotate Y 360° smoothly across 6 seconds
        cardGroup.rotation.y = progress * Math.PI * 2;
        cardGroup.rotation.x = Math.sin(progress * Math.PI * 2) * 0.1;

        recRenderer.render(recScene, recCamera);

        if (elapsed < duration) {
          requestAnimationFrame(recordLoop);
        } else {
          mediaRecorder.stop();
        }
      };

      requestAnimationFrame(recordLoop);
    } catch (err) {
      console.error('3D Spin video recording error:', err);
      setIsRecording(false);
    }
  };

  // Auto-trigger 3D Video Spin recording if launched via Export 3D Video button action
  useEffect(() => {
    if (isOpen && autoStartRecording && !isRecording) {
      const timer = setTimeout(() => {
        handleDownload3DSpin();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoStartRecording]);

  // Live texture update effect whenever theme or canvas changes while 3D view is active
  useEffect(() => {
    if (frontTextureRef.current && sourceCanvas) {
      frontTextureRef.current.image = sourceCanvas;
      frontTextureRef.current.needsUpdate = true;
    }
  }, [groupFrameStyle, format, sourceCanvas, isOpen]);

  if (!isOpen) return null;

  const SQUAD_THEMES = [
    { id: 'sunset', label: '🌅 Anjuna Sunset' },
    { id: 'shack', label: '🍹 Baga Beach Shack' },
    { id: 'cyberpunk', label: '💻 Vagator Night Hack' },
    { id: 'neon_party', label: "🪩 Tito's Neon Nights" },
    { id: 'heritage', label: '⛪ Old Goa Heritage' },
    { id: 'scooty_cruise', label: '🛵 Chapora Ride' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-[#02180e]/95 backdrop-blur-xl flex flex-col items-center justify-between p-3 sm:p-6 animate-fade-in select-none overflow-y-auto">
      {/* Pop-In Modal Header Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between border-b border-[#ffe500]/30 pb-2 sm:pb-3 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="text-xl sm:text-2xl shrink-0">🌴</span>
          <div className="min-w-0">
            <h2 className="font-mono-tech text-xs sm:text-xl text-[#ffe500] font-black uppercase tracking-wider truncate">
              HH GOA 2026 · 3D BADGE STUDIO
            </h2>
            <p className="text-[9px] sm:text-xs font-mono-tech text-[#e5c200] hidden xs:block truncate">
              Interactive 360° PVC Card Render with Woven HHGOA Lanyard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {onUploadPhoto && (
            <button
              type="button"
              onClick={onUploadPhoto}
              className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#ffe500] text-[#042616] font-mono-tech text-[10px] sm:text-xs uppercase font-black flex items-center gap-1 hover:bg-[#fff066] transition cursor-pointer"
              title="Upload new photo"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload</span>
            </button>
          )}
          {onSnapSelfie && (
            <button
              type="button"
              onClick={onSnapSelfie}
              className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#ff007a] text-white font-mono-tech text-[10px] sm:text-xs uppercase font-black flex items-center gap-1 hover:bg-[#e0006b] transition cursor-pointer glow-pink"
              title="Snap live selfie"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Selfie</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleShowFront}
            className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#042616] text-[#ffe500] border border-[#ffe500]/40 font-mono-tech text-[10px] sm:text-xs uppercase font-extrabold hover:bg-[#ffe500] hover:text-[#042616] transition cursor-pointer"
          >
            👤 <span className="hidden sm:inline">Front</span>
          </button>
          <button
            type="button"
            onClick={handleShowBack}
            className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#042616] text-[#ffe500] border border-[#ffe500]/40 font-mono-tech text-[10px] sm:text-xs uppercase font-extrabold hover:bg-[#ffe500] hover:text-[#042616] transition cursor-pointer"
          >
            📜 <span className="hidden sm:inline">Back</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#ff007a] text-white flex items-center justify-center hover:scale-110 transition shadow-lg glow-pink cursor-pointer"
            title="Close 3D Rendering"
          >
            <X className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Pop-In HD 3D Viewport */}
      <div
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => {
          if (e.touches[0]) {
            isDraggingRef.current = true;
            previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }
        }}
        onTouchMove={(e) => {
          if (isDraggingRef.current && e.touches[0]) {
            const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
            const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;
            targetRotationRef.current.y += deltaX * 0.012;
            targetRotationRef.current.x += deltaY * 0.012;
            previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }
        }}
        onTouchEnd={handleMouseUp}
        className="w-full h-[58vh] sm:h-[70vh] max-w-5xl rounded-2xl bg-gradient-to-b from-[#042616] via-[#02180e] to-[#000d07] border-2 border-[#ffe500]/60 shadow-2xl cursor-grab active:cursor-grabbing relative overflow-hidden my-2 sm:my-3"
      >
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#042616]/90 backdrop-blur-md px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full border border-[#ff007a] font-mono-tech text-[10px] sm:text-xs text-[#ffe500] font-bold uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 z-10 shadow-lg max-w-[90%] truncate">
          <Sparkles className="w-3.5 h-3.5 text-[#ff007a] animate-pulse shrink-0" />
          <span className="truncate">Real-time 360° HD PVC Badge</span>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#042616]/80 backdrop-blur-xs px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-mono-tech text-[#e5c200] border border-[#ffe500]/30 z-10 text-center w-[90%] sm:w-auto truncate">
          🖱️ Drag mouse or finger to rotate 360° in HD space
        </div>
      </div>

      {/* Pop-In Modal Bottom Controls (Responsive 2x2 Grid on Mobile, 1 Row on Desktop) */}
      <div className="w-full max-w-5xl grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2 border-t border-[#ffe500]/30 pt-3">
        <button
          type="button"
          onClick={() => setAutoRotate((prev) => !prev)}
          className={`px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl font-mono-tech text-[11px] sm:text-xs uppercase font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            autoRotate
              ? 'bg-[#ff007a] text-white glow-pink'
              : 'bg-[#042616] text-[#e5c200] border border-[#ffe500]/30'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          <span>Orbit: {autoRotate ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={handleFlipCard}
          className="px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl bg-[#ffe500] text-[#042616] font-mono-tech text-[11px] sm:text-xs uppercase font-black flex items-center justify-center gap-1.5 hover:bg-[#fff066] transition cursor-pointer whitespace-nowrap"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Flip 180°</span>
        </button>

        {/* Shortened 6-Second 3D Spin Video Export Button */}
        <button
          type="button"
          disabled={isRecording}
          onClick={handleDownload3DSpin}
          className="px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#0a5c36] to-[#0f7a47] hover:from-[#0d6b40] hover:to-[#128a52] text-[#ffe500] border border-[#ffe500] font-mono-tech text-[11px] sm:text-xs uppercase font-black flex items-center justify-center gap-1.5 transition shadow-xl cursor-pointer disabled:opacity-50 whitespace-nowrap"
          title="Export 6-second 3D spin video clip"
        >
          {isRecording ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-[#ff007a] animate-spin" />
              <span>Recording ({recordingProgress}%)...</span>
            </>
          ) : (
            <>
              <Video className="w-3.5 h-3.5 text-[#ff007a]" />
              <span>🎬 EXPORT 3D</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-[#042616] text-[#ffe500] border border-[#ffe500]/60 font-mono-tech text-[11px] sm:text-xs uppercase font-extrabold hover:bg-[#0a5c36] transition cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap"
        >
          <span>✖ Close 3D</span>
        </button>
      </div>
    </div>
  );
}
