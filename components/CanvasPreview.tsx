'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { drawFormatA, drawFormatB, drawFormatABack, drawFormatBBack, GeneratorConfig, StylePreset } from '@/lib/canvas-generator';
import { compressAndProcessImage } from '@/lib/image-compressor';
import { Upload, Move, ZoomIn, Loader2, Sliders, AlertCircle, RotateCcw, Palette, Box } from 'lucide-react';
import confetti from 'canvas-confetti';
import dynamic from 'next/dynamic';
import { useGLTF } from '@react-three/drei';

// Preload the 3D badge model at app startup so it's ready before 3D view opens
const TAG_GLB_URL = 'https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/5huRVDzcoDwnbgrKUo1Lzs/53b6dd7d6b4ffcdbd338fa60265949e1/tag.glb';
if (typeof window !== 'undefined') useGLTF.preload(TAG_GLB_URL);

const Badge3D = dynamic(() => import('./Badge3D'), { ssr: false });

interface CanvasPreviewProps {
  config: GeneratorConfig;
  onPhotoLoaded: (img: HTMLImageElement | null) => void;
  onPanChange: (newPanX: number, newPanY: number) => void;
  onZoomChange: (newZoom: number) => void;
  onStyleChange: (style: StylePreset) => void;
  onFormatChange: (format: 'formatA' | 'formatB') => void;
  isEditorOpen: boolean;
  onToggleEditor: () => void;
}

export interface CanvasPreviewRef {
  getCanvas: () => HTMLCanvasElement | null;
}

const GOA_SLOGANS = [
  '🌴 BRED ON CODE & COCONUT WATER',
  '🍹 CODE BY DAY, BEACH BY NIGHT',
  '☀️ SUN-BAKED BUILDER APPROVED',
  '🌊 SHIP BEFORE THE TIDE COMES IN',
  '🥥 STACK OVERFLOW — TROPICAL EDITION',
  '🕶️ COMPILING WITH SHADES ON',
];

const STYLE_PRESETS: StylePreset[] = ['emerald', 'sunset', 'cyber', 'midnight'];

const CanvasPreview = forwardRef<CanvasPreviewRef, CanvasPreviewProps>(
  ({ config, onPhotoLoaded, onPanChange, onZoomChange, onStyleChange, onFormatChange, isEditorOpen, onToggleEditor }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [sloganIdx, setSloganIdx] = useState(0);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [badgeTextureUrl, setBadgeTextureUrl] = useState<string | null>(null);
    const [is3DMode, setIs3DMode] = useState(false);
    const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
    const [sharing, setSharing] = useState<'x' | 'linkedin' | 'copy' | null>(null);
    const [shareSuccess, setShareSuccess] = useState<string | null>(null);

    const dragStartRef = useRef<{ x: number; y: number; initialPanX: number; initialPanY: number }>({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });
    const pinchStartDistRef = useRef<number | null>(null);
    const initialZoomRef = useRef<number>(1.0);

    useImperativeHandle(ref, () => ({ getCanvas: () => canvasRef.current }));

    const startCamera = async () => {
      setCameraError(null);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(console.error);
        }
      } catch {
        setCameraError('Camera blocked. Please upload a photo.');
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
    };

    useEffect(() => {
      if (!config.photo) {
        startCamera();
      } else {
        stopCamera();
      }
      return () => { stopCamera(); };
    }, [config.photo]);

    // Animation loop for live video feed
    useEffect(() => {
      let animId: number;
      const render = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const targetW = config.format === 'formatA' ? 1080 : 1200;
        const targetH = config.format === 'formatA' ? 1920 : 675;
        if (canvas.width !== targetW) canvas.width = targetW;
        if (canvas.height !== targetH) canvas.height = targetH;

        const liveConfig = { ...config, liveVideoElement: videoRef.current };
        if (config.format === 'formatA') drawFormatA(ctx, 1080, 1920, liveConfig);
        else drawFormatB(ctx, 1200, 675, liveConfig);
        animId = requestAnimationFrame(render);
      };
      if (!config.photo && stream) animId = requestAnimationFrame(render);
      return () => cancelAnimationFrame(animId);
    }, [config, stream]);

    // Static draw when photo is set or camera is inactive
    useEffect(() => {
      if (config.photo || !stream) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const targetW = config.format === 'formatA' ? 1080 : 1200;
        const targetH = config.format === 'formatA' ? 1920 : 675;
        canvas.width = targetW;
        canvas.height = targetH;
        if (config.format === 'formatA') drawFormatA(ctx, 1080, 1920, config);
        else drawFormatB(ctx, 1200, 675, config);

        // Generate double-width texture (front + back side-by-side)
        const textureCanvas = document.createElement('canvas');
        textureCanvas.width = targetW * 2;
        textureCanvas.height = targetH;
        const tCtx = textureCanvas.getContext('2d');
        if (tCtx) {
          // Draw Front on left half
          if (config.format === 'formatA') {
            drawFormatA(tCtx, 1080, 1920, config);
            // Draw Back on right half
            tCtx.translate(1080, 0);
            drawFormatABack(tCtx, 1080, 1920, config);
          } else {
            drawFormatB(tCtx, 1200, 675, config);
            // Draw Back on right half
            tCtx.translate(1200, 0);
            drawFormatBBack(tCtx, 1200, 675, config);
          }
        }

        setTimeout(() => {
          const dataUrl = textureCanvas.toDataURL('image/png', 1.0);
          setBadgeTextureUrl(dataUrl);
          setThumbnailUrl(canvas.toDataURL('image/jpeg', 0.5));
        }, 80);
      } else {
        setThumbnailUrl(null);
      }
    }, [config, stream]);

    const handleCapture = () => {
      const video = videoRef.current;
      if (!video || !stream) return;
      setLoading(true);
      const cap = document.createElement('canvas');
      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;
      cap.width = w; cap.height = h;
      const ctx = cap.getContext('2d');
      if (!ctx) { setLoading(false); return; }
      ctx.translate(w, 0); ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, w, h);
      const img = new Image();
      img.onload = () => { 
        onPhotoLoaded(img); 
        onPanChange(0, 0); 
        onZoomChange(1.0); 
        setLoading(false); 
        setTimeout(() => setIs3DMode(true), 200);
      };
      img.src = cap.toDataURL('image/png');
    };

    const handleCyclePresetStyle = () => {
      const next = (STYLE_PRESETS.indexOf(config.stylePreset || 'emerald') + 1) % STYLE_PRESETS.length;
      onStyleChange(STYLE_PRESETS[next] || 'emerald');
    };

    const processFile = async (file: File) => {
      setLoading(true);
      try {
        const img = await compressAndProcessImage(file);
        onPhotoLoaded(img); onPanChange(0, 0); onZoomChange(1.0);
        setTimeout(() => setIs3DMode(true), 200);
      } finally {
        setLoading(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
    };

    const handleStart = (clientX: number, clientY: number) => {
      if (!config.photo) return;
      setIsDragging(true);
      dragStartRef.current = { x: clientX, y: clientY, initialPanX: config.panX, initialPanY: config.panY };
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;
      onPanChange(
        Math.min(Math.max(dragStartRef.current.initialPanX + dx, -250), 250),
        Math.min(Math.max(dragStartRef.current.initialPanY + dy, -250), 250)
      );
    };

    const handleEnd = () => { setIsDragging(false); pinchStartDistRef.current = null; };

    const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 1 && e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY);
      else if (e.touches.length === 2 && e.touches[0] && e.touches[1]) {
        setIsDragging(false);
        pinchStartDistRef.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        initialZoomRef.current = config.zoom;
      }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length === 1 && e.touches[0] && isDragging) handleMove(e.touches[0].clientX, e.touches[0].clientY);
      else if (e.touches.length === 2 && e.touches[0] && e.touches[1] && pinchStartDistRef.current) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const newZoom = Math.min(Math.max(initialZoomRef.current * (dist / pinchStartDistRef.current), 0.5), 2.5);
        onZoomChange(parseFloat(newZoom.toFixed(2)));
      }
    };

    const handleWheel = (e: React.WheelEvent) => {
      if (!config.photo) return;
      onZoomChange(parseFloat(Math.min(Math.max(config.zoom + (e.deltaY > 0 ? -0.05 : 0.05), 0.5), 2.5).toFixed(2)));
    };

    const getActiveZoomLabel = () => {
      if (config.zoom <= 0.85) return '.5';
      if (config.zoom <= 1.2) return '1x';
      if (config.zoom <= 1.7) return '2';
      return '5';
    };

    const handleDownload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `hh-goa-2026-${config.format}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.85 }, colors: ['#ffe500', '#ff007a', '#0a5c36', '#ffffff'] });
      setShareSuccess('Saved PNG to device!');
      setTimeout(() => setShareSuccess(null), 3000);
    };

    const prepareShareUrl = async (canvas: HTMLCanvasElement): Promise<string> => {
      try {
        const res = await fetch('/api/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: canvas.toDataURL('image/png', 0.85) }) });
        if (res.ok) { const d = await res.json(); if (d.shareId) return `${window.location.origin}/share/${d.shareId}`; }
      } catch { /* fallback */ }
      return window.location.origin;
    };

    const shareText = `🌴 Just created my HH Goa 2026 Builder Badge!\n\n#FrameInGoa #HHGOA2026\nhttps://hhgoa-frame-studio.vercel.app/`;

    const handleShareToX = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      setSharing('x');
      try {
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
        if (blob && navigator.canShare?.({ files: [new File([blob], 'badge.png', { type: 'image/png' })] })) {
          await navigator.share({ title: 'HH GOA 2026 Badge', text: shareText, files: [new File([blob], 'badge.png', { type: 'image/png' })] });
        } else {
          const url = await prepareShareUrl(canvas);
          window.open(`https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank');
        }
        setShareSuccess('Shared on X!'); setTimeout(() => setShareSuccess(null), 3000);
      } finally { setSharing(null); }
    };

    const handleShareToLinkedIn = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      setSharing('linkedin');
      try {
        const url = await prepareShareUrl(canvas);
        if (navigator.clipboard) await navigator.clipboard.writeText(shareText);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        setShareSuccess('Opened LinkedIn!'); setTimeout(() => setShareSuccess(null), 3000);
      } finally { setSharing(null); }
    };

    const handleCopyLink = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      setSharing('copy');
      try {
        const url = await prepareShareUrl(canvas);
        await navigator.clipboard?.writeText(url);
        setShareSuccess('Link copied!'); setTimeout(() => setShareSuccess(null), 3000);
      } finally { setSharing(null); }
    };

    const zoomTicks = [
      { label: '.5', value: 0.75 },
      { label: '1x', value: 1.0 },
      { label: '2', value: 1.4 },
      { label: '5', value: 2.0 },
    ];

    return (
      // Fill the entire parent flex container
      <div
        className="relative w-full h-full flex flex-col bg-[#080808]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Hidden elements */}
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/heic"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
        />

        {/* ─── VIEWFINDER fills all space except the bottom control bar ─── */}
        <div
          className="relative flex-1 overflow-hidden bg-[#020d07]"
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleEnd}
          onWheel={handleWheel}
        >
          {/* Canvas fits within viewfinder so the whole card is visible */}
          <canvas
            ref={canvasRef}
            onClick={() => { if (!config.photo && !stream) fileInputRef.current?.click(); }}
            className={`absolute inset-0 w-full h-full object-contain ${isDragging ? 'cursor-grabbing' : config.photo ? 'cursor-grab' : 'cursor-pointer'}`}
            style={{ imageRendering: 'auto' }}
          />

          {/* Neon corner brackets */}
          {['top-3 left-3 border-t-2 border-l-2 rounded-tl-md', 'top-3 right-3 border-t-2 border-r-2 rounded-tr-md', 'bottom-[88px] left-3 border-b-2 border-l-2 rounded-bl-md', 'bottom-[88px] right-3 border-b-2 border-r-2 rounded-br-md'].map((cls, i) => (
            <div key={i} className={`absolute w-8 h-8 border-[#ffe500]/60 pointer-events-none ${cls}`} />
          ))}

          {/* LIVE badge */}
          {!config.photo && stream && (
            <div className="absolute top-safe-top top-4 left-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 pointer-events-none z-10">
              <span className="w-2 h-2 rounded-full bg-[#ff007a] animate-ping absolute" />
              <span className="w-2 h-2 rounded-full bg-[#ff007a] relative" />
              <span className="font-mono-tech text-[9px] text-white font-black tracking-wider ml-1">LIVE</span>
            </div>
          )}

          {/* Slogan pill / 3D Toggle — top center */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={() => setSloganIdx((i) => (i + 1) % GOA_SLOGANS.length)}
              className="font-mono-tech text-[9px] text-[#ffe500] bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-[#148048]/40 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-black/70 transition"
            >
              {GOA_SLOGANS[sloganIdx]}
            </button>
            {config.photo && thumbnailUrl && (
              <button
                type="button"
                onClick={() => setIs3DMode(true)}
                className="font-mono-tech text-[9px] font-black uppercase text-[#042616] bg-[#ffe500] px-3 py-1 rounded-full border border-white/20 tracking-wider flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition"
              >
                <Box className="w-3 h-3" /> 3D View
              </button>
            )}
          </div>

          {/* Sliders / editor toggle — top right */}
          <button
            type="button"
            onClick={onToggleEditor}
            className={`absolute top-4 right-4 w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer z-10 ${
              isEditorOpen ? 'bg-[#ffe500] text-[#042616] border-[#ffe500]' : 'bg-black/50 text-[#ffe500] border-white/10 hover:bg-black/70'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Camera error fallback */}
          {!config.photo && !stream && cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#042f1b]/95 backdrop-blur-sm z-20 text-center px-8">
              <AlertCircle className="w-10 h-10 text-[#ffe500] mb-3 animate-bounce" />
              <p className="font-mono-tech text-[11px] text-[#ffe500] uppercase font-bold tracking-wider leading-relaxed">{cameraError}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 py-3 px-6 bg-[#ffe500] text-[#042616] rounded-2xl font-mono-tech text-xs font-black uppercase tracking-wider cursor-pointer hover:scale-105 active:scale-95 transition"
              >
                Upload Photo
              </button>
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-[#042f1b]/95 backdrop-blur-md z-30 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-[#ffe500] animate-spin mb-4" />
              <p className="font-mono-tech text-xs text-[#ffe500] uppercase font-bold tracking-widest">Processing...</p>
            </div>
          )}

          {/* Zoom ticks — floating above shutter bar */}
          <div className="absolute bottom-[76px] left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/55 backdrop-blur-md py-1.5 px-4 rounded-full border border-white/10 z-10">
            {zoomTicks.map(({ label, value }) => {
              const active = getActiveZoomLabel() === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onZoomChange(value)}
                  className={`text-[10px] font-mono-tech font-black w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                    active ? 'bg-[#042616] text-[#ffe500] scale-110 border border-[#ffe500]/40' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Format switcher — floating just above zoom ticks */}
          <div className="absolute bottom-[118px] left-1/2 -translate-x-1/2 flex gap-5 bg-black/55 backdrop-blur-md py-1.5 px-5 rounded-full border border-white/10 z-10">
            {(['formatA', 'formatB'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onFormatChange(f)}
                className={`font-mono-tech text-[10px] uppercase tracking-wider font-extrabold pb-0.5 border-b-2 transition cursor-pointer ${
                  config.format === f ? 'text-[#ffe500] border-[#ffe500]' : 'text-neutral-400 border-transparent hover:text-white'
                }`}
              >
                {f === 'formatA' ? 'PFP Overlay' : 'ID Badge'}
              </button>
            ))}
          </div>
        </div>

        {/* ─── BOTTOM SHUTTER BAR ─── */}
        <div className="shrink-0 bg-[#080808] border-t border-[#148048]/20 flex items-center justify-between px-8 py-4 safe-area-inset-bottom">
          {/* Gallery / Upload button */}
          <button
            type="button"
            onClick={() => { if (config.photo || thumbnailUrl) setIsShareSheetOpen(true); else fileInputRef.current?.click(); }}
            className="w-12 h-12 rounded-xl border border-[#148048]/40 bg-[#042616] overflow-hidden flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          >
            {thumbnailUrl
              ? <img src={thumbnailUrl} className="w-full h-full object-cover" alt="Gallery" />
              : <Upload className="w-5 h-5 text-[#ffe500]" />}
          </button>

          {/* Shutter / Retake */}
          {!config.photo
            ? (
              <button
                type="button"
                onClick={handleCapture}
                disabled={!stream}
                className="w-16 h-16 rounded-full bg-[#ffe500] border-[5px] border-[#080808] outline outline-2 outline-[#ffe500]/60 flex items-center justify-center shadow-xl transition hover:scale-105 active:scale-95 disabled:opacity-30 cursor-pointer"
              >
                <span className="w-5 h-5 rounded-full bg-[#080808]" />
              </button>
            )
            : (
              <button
                type="button"
                onClick={() => onPhotoLoaded(null)}
                className="w-16 h-16 rounded-full bg-[#ffe500] border-[5px] border-[#080808] outline outline-2 outline-[#ffe500]/60 flex items-center justify-center shadow-xl transition hover:scale-105 active:scale-95 cursor-pointer text-[#080808]"
              >
                <RotateCcw className="w-6 h-6 stroke-[3px]" />
              </button>
            )}

          {/* Style preset cycler */}
          <button
            type="button"
            onClick={handleCyclePresetStyle}
            className="w-12 h-12 rounded-xl border border-[#148048]/40 bg-[#042616] hover:bg-[#0b6638] text-[#ffe500] flex items-center justify-center shadow-lg transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Palette className="w-5 h-5" />
          </button>
        </div>

        {/* Pan/zoom hint */}
        {config.photo && (
          <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 translate-y-[48px] flex items-center gap-3 text-[9px] font-mono-tech text-neutral-500 pointer-events-none z-10">
            <span className="flex items-center gap-1"><Move className="w-3 h-3 text-[#ff007a]" /> Drag</span>
            <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3 text-[#ffe500]" /> Pinch / Scroll</span>
          </div>
        )}

        {/* ─── 3D VIEW MODAL ─── */}
        {is3DMode && badgeTextureUrl && (
          <Badge3D 
            textureUrl={badgeTextureUrl} 
            format={config.format} 
            onClose={() => {
              setIs3DMode(false);
              setTimeout(() => setIsShareSheetOpen(true), 300);
            }} 
          />
        )}

        {/* ─── SHARE SHEET ─── */}
        {isShareSheetOpen && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col justify-end animate-fade-in">
            <div className="absolute inset-0" onClick={() => setIsShareSheetOpen(false)} />
            <div className="relative bg-[#042f1b]/98 backdrop-blur-xl border-t-2 border-[#148048] rounded-t-[32px] p-5 shadow-2xl animate-slide-up">
              <div className="w-10 h-1 bg-[#148048]/60 rounded-full mx-auto mb-5" onClick={() => setIsShareSheetOpen(false)} />

              <div className="flex items-center gap-4 mb-5 pb-4 border-b border-[#148048]/30">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#020d07] border border-[#ffe500]/20 flex items-center justify-center shrink-0">
                  {thumbnailUrl ? <img src={thumbnailUrl} className="w-full h-full object-cover" alt="Preview" /> : <span className="text-2xl">🌴</span>}
                </div>
                <div>
                  <p className="font-mono-tech text-xs text-[#ffe500] font-black uppercase tracking-widest">HH Goa 2026</p>
                  <p className="font-mono-tech text-[10px] text-neutral-400 uppercase mt-0.5">{config.format === 'formatA' ? 'PFP Frame' : 'Builder Badge'}</p>
                  {shareSuccess && <p className="text-[10px] text-[#00ffcc] font-bold mt-1">✓ {shareSuccess}</p>}
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { icon: '💾', label: 'Save PNG to Device', action: handleDownload },
                  { icon: '🐦', label: sharing === 'x' ? 'Uploading…' : 'Share on X', action: handleShareToX },
                  { icon: '💼', label: sharing === 'linkedin' ? 'Uploading…' : 'Share on LinkedIn', action: handleShareToLinkedIn },
                  { icon: '🔗', label: sharing === 'copy' ? 'Generating…' : 'Copy Share Link', action: handleCopyLink },
                ].map(({ icon, label, action }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={action}
                    disabled={sharing !== null}
                    className="w-full py-3.5 px-4 bg-[#042616]/80 hover:bg-[#0b6638] border border-[#148048]/30 rounded-2xl font-mono-tech text-[11px] font-black uppercase text-left flex items-center gap-3 transition cursor-pointer disabled:opacity-50"
                  >
                    <span className="text-lg">{icon}</span> {label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsShareSheetOpen(false)}
                className="w-full mt-3 py-3 bg-[#042616] hover:bg-[#0b6638] text-neutral-300 rounded-2xl font-mono-tech text-[11px] font-black uppercase border border-[#148048]/30 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

CanvasPreview.displayName = 'CanvasPreview';
export default CanvasPreview;
