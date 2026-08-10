'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { drawFormatA, drawFormatB, drawFormatC, GeneratorConfig } from '@/lib/canvas-generator';
import { compressAndProcessImage } from '@/lib/image-compressor';
import CameraModal from './CameraModal';
import Card3DViewer from './Card3DViewer';
import { Upload, Move, ZoomIn, Loader2, Sparkles, Camera, Box, Image as ImageIcon } from 'lucide-react';

interface CanvasPreviewProps {
  config: GeneratorConfig;
  onPhotoLoaded: (img: HTMLImageElement) => void;
  onPanChange: (newPanX: number, newPanY: number) => void;
  onZoomChange: (newZoom: number) => void;
  onGroupFrameStyleChange?: (style: 'sunset' | 'shack' | 'cyberpunk' | 'neon_party' | 'heritage' | 'scooty_cruise') => void;
}

export interface CanvasPreviewRef {
  getCanvas: () => HTMLCanvasElement | null;
  open3DModal: (autoRecord?: boolean) => void;
}

const GOA_SLOGANS = [
  "🌴 GOA CALLED... SO I STARTED HACKING.",
  "🏖️ CTRL + ALT + GOA",
  "🚀 SHIP IT BEFORE SUNSET",
  "🦀 CRABS HAVE FEWER BUGS THAN MY CODE",
  "🌊 PUSH TO PROD BEFORE THE HIGH TIDE",
  "🤖 AI IS MY INTERN TODAY",
  "🌅 SUNSETS, STARTUPS & SHIPMENTS",
  "💻 MERGE CONFLICTS? NOT ON VACATION",
  "🔥 EAT. SLEEP. HACK. GOA. REPEAT.",
  "🏄 DEBUGGING WITH OCEAN VIEW",
];

const CanvasPreview = forwardRef<CanvasPreviewRef, CanvasPreviewProps>(
  ({ config, onPhotoLoaded, onPanChange, onZoomChange, onGroupFrameStyleChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [sloganIdx, setSloganIdx] = useState(0);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [is3DModalOpen, setIs3DModalOpen] = useState(false);
    const [autoRecord3D, setAutoRecord3D] = useState(false);

    useEffect(() => {
      const interval = setInterval(() => {
        setSloganIdx((prev) => (prev + 1) % GOA_SLOGANS.length);
      }, 10000);

      const handleOpen3DEvent = (e: any) => {
        setAutoRecord3D(!!e.detail?.autoRecord);
        setIs3DModalOpen(true);
      };
      window.addEventListener('open-3d-modal', handleOpen3DEvent);

      return () => {
        clearInterval(interval);
        window.removeEventListener('open-3d-modal', handleOpen3DEvent);
      };
    }, []);

    // Refs for tracking mouse/touch drag and pinch-to-zoom state
    const dragStartRef = useRef<{ x: number; y: number; initialPanX: number; initialPanY: number }>({
      x: 0,
      y: 0,
      initialPanX: 0,
      initialPanY: 0,
    });
    const pinchStartDistRef = useRef<number | null>(null);
    const initialZoomRef = useRef<number>(1.0);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
      open3DModal: (autoRecord = false) => {
        setAutoRecord3D(autoRecord);
        setIs3DModalOpen(true);
      },
    }));

    // Process file upload with fast client-side image compression
    const processFile = async (file: File) => {
      if (!file) return;
      setLoading(true);

      try {
        const compressedImg = await compressAndProcessImage(file);
        onPhotoLoaded(compressedImg);
        onPanChange(0, 0);
        onZoomChange(1.0);
      } catch (err) {
        console.error('Canvas image upload error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Draw 4:5 ratio canvas (1080x1350) whenever config changes
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = config.format === 'formatC' ? 1200 : 1080;
      const height = config.format === 'formatC' ? 1500 : 1350;

      canvas.width = width;
      canvas.height = height;

      if (config.format === 'formatA') {
        drawFormatA(ctx, width, height, config);
      } else if (config.format === 'formatB') {
        drawFormatB(ctx, width, height, config);
      } else if (config.format === 'formatC') {
        drawFormatC(ctx, width, height, config);
      }
    }, [config]);

    // Handle Click on Canvas
    const handleCanvasClick = () => {
      if (!config.photo) {
        fileInputRef.current?.click();
      }
    };

    // Handle File Drop on Canvas
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    };

    // Touch & Mouse Drag Panning
    const handleStart = (clientX: number, clientY: number) => {
      if (!config.photo) return;
      setIsDragging(true);
      dragStartRef.current = {
        x: clientX,
        y: clientY,
        initialPanX: config.panX,
        initialPanY: config.panY,
      };
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const deltaX = clientX - dragStartRef.current.x;
      const deltaY = clientY - dragStartRef.current.y;

      const newPanX = Math.min(Math.max(dragStartRef.current.initialPanX + deltaX, -250), 250);
      const newPanY = Math.min(Math.max(dragStartRef.current.initialPanY + deltaY, -250), 250);

      onPanChange(newPanX, newPanY);
    };

    const handleEnd = () => {
      setIsDragging(false);
      pinchStartDistRef.current = null;
    };

    // Touch Pinch-To-Zoom Handler
    const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 1 && e.touches[0]) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2 && e.touches[0] && e.touches[1]) {
        setIsDragging(false);
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        pinchStartDistRef.current = dist;
        initialZoomRef.current = config.zoom;
      }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length === 1 && e.touches[0] && isDragging) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2 && e.touches[0] && e.touches[1] && pinchStartDistRef.current) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / pinchStartDistRef.current;
        const newZoom = Math.min(Math.max(initialZoomRef.current * factor, 0.5), 2.5);
        onZoomChange(parseFloat(newZoom.toFixed(2)));
      }
    };

    // Mouse Wheel Scroll Zooming
    const handleWheel = (e: React.WheelEvent) => {
      if (!config.photo) return;
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newZoom = Math.min(Math.max(config.zoom + delta, 0.5), 2.5);
      onZoomChange(parseFloat(newZoom.toFixed(2)));
    };

    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="w-full card-hh-emerald p-3 sm:p-4 rounded-2xl border border-[#148048] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl group border-shimmer"
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/heic"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
        />

        {/* Top Floating Header Bar with Funny Goan Slogan & 3D Pop-In Render Button */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
          <div
            onClick={() => setSloganIdx((prev) => (prev + 1) % GOA_SLOGANS.length)}
            className="font-mono-tech text-[10px] sm:text-xs text-[#ffe500] bg-[#042616] px-3 py-1 rounded-full border border-[#ff007a] uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-105 transition-transform"
            title="Click for next funny Goa slogan!"
          >
            <span className="w-2 h-2 rounded-full bg-[#ff007a] animate-ping" />
            {GOA_SLOGANS[sloganIdx]}
          </div>

          {/* 3D Pop-In Render Badge Trigger Button */}
          <button
            type="button"
            onClick={() => setIs3DModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#ff007a] text-white font-mono-tech text-xs uppercase font-black flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all glow-pink cursor-pointer"
            title="Click to pop out live 3D card inspection!"
          >
            <Box className="w-4 h-4 animate-bounce text-[#ffe500]" />
            <span>🔥 FLEX IN 3D, BRO! 🏄‍♂️</span>
          </button>
        </div>

        {/* Fast Downscaling / Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-[#042616]/92 backdrop-blur-md z-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#ffe500] animate-spin mb-3" />
            <p className="font-mono-tech text-xs text-[#ffe500] uppercase font-bold tracking-wider">
              Compressing &amp; Rendering (under 1s)...
            </p>
          </div>
        )}

        {/* Interactive 4:5 Canvas Container */}
        <div className="relative w-full flex items-center justify-center">
          {/* Left Coconut Palm Tree (Flanking Canvas Box) */}
          <div className="absolute -left-10 sm:-left-16 bottom-0 pointer-events-none select-none z-15 hidden md:block animate-palm-sway">
            <svg width="90" height="240" viewBox="0 0 120 320" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 40 310 C 60 200 80 120 70 60" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
              <path d="M 30 310 C 45 230 35 170 25 150" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
              <path d="M 70 60 C 20 20 10 70 10 100" fill="#0A5C36" stroke="#000000" strokeWidth="2.5" />
              <path d="M 70 60 C 20 20 10 70 10 100" stroke="#FFE500" strokeWidth="2" fill="none" />
              <path d="M 70 60 C 110 20 120 70 115 105" fill="#0A5C36" stroke="#000000" strokeWidth="2.5" />
              <path d="M 70 60 C 110 20 120 70 115 105" stroke="#FFE500" strokeWidth="2" fill="none" />
              <path d="M 70 60 C 50 -10 90 -10 80 60" fill="#0A5C36" stroke="#000000" strokeWidth="2.5" />
              <path d="M 25 150 C -5 130 0 170 5 185" fill="#0A5C36" stroke="#000000" strokeWidth="2" />
              <path d="M 25 150 C 55 130 60 170 55 185" fill="#0A5C36" stroke="#000000" strokeWidth="2" />
              <circle cx="30" cy="305" r="8" fill="#FF007A" />
              <circle cx="45" cy="308" r="7" fill="#FFE500" />
              <circle cx="60" cy="305" r="8" fill="#FF007A" />
            </svg>
          </div>

          {/* Right Coconut Palm Tree (Flanking Canvas Box) */}
          <div className="absolute -right-10 sm:-right-16 bottom-0 pointer-events-none select-none z-15 hidden md:block animate-palm-sway" style={{ transform: 'scaleX(-1)' }}>
            <svg width="90" height="240" viewBox="0 0 120 320" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 40 310 C 60 200 80 120 70 60" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
              <path d="M 30 310 C 45 230 35 170 25 150" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
              <path d="M 70 60 C 20 20 10 70 10 100" fill="#0A5C36" stroke="#000000" strokeWidth="2.5" />
              <path d="M 70 60 C 20 20 10 70 10 100" stroke="#FFE500" strokeWidth="2" fill="none" />
              <path d="M 70 60 C 110 20 120 70 115 105" fill="#0A5C36" stroke="#000000" strokeWidth="2.5" />
              <path d="M 70 60 C 110 20 120 70 115 105" stroke="#FFE500" strokeWidth="2" fill="none" />
              <path d="M 70 60 C 50 -10 90 -10 80 60" fill="#0A5C36" stroke="#000000" strokeWidth="2.5" />
              <path d="M 25 150 C -5 130 0 170 5 185" fill="#0A5C36" stroke="#000000" strokeWidth="2" />
              <path d="M 25 150 C 55 130 60 170 55 185" fill="#0A5C36" stroke="#000000" strokeWidth="2" />
              <circle cx="30" cy="305" r="8" fill="#FF007A" />
              <circle cx="45" cy="308" r="7" fill="#FFE500" />
              <circle cx="60" cy="305" r="8" fill="#FF007A" />
            </svg>
          </div>

          {!config.photo && (
            <div className="absolute inset-0 bg-[#042616]/40 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-[#ffe500]/70 hover:border-[#ffe500] transition z-10 p-4 text-center">
              <div className="flex gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-12 rounded-full bg-[#ffe500] text-[#042616] flex items-center justify-center shadow-lg hover:scale-110 transition cursor-pointer"
                  title="Upload Photo"
                >
                  <Upload className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="w-12 h-12 rounded-full bg-[#ff007a] text-white flex items-center justify-center shadow-lg hover:scale-110 transition cursor-pointer glow-pink"
                  title="Snap Live Selfie"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>
              <p className="font-mono-tech text-xs sm:text-sm text-[#ffe500] font-extrabold uppercase drop-shadow-md">
                Upload Photo OR Snap Live Selfie
              </p>
            </div>
          )}

          {/* 4:5 Canvas Element */}
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleEnd}
            onWheel={handleWheel}
            className={`w-full h-auto max-w-full sm:max-w-md rounded-xl shadow-2xl border border-[#ffe500]/30 object-contain bg-[#042616] transition-transform duration-150 ${isDragging
              ? 'cursor-grabbing scale-[0.995]'
              : config.photo
                ? 'cursor-grab'
                : 'cursor-pointer'
              }`}
          />
        </div>

        {/* Touch & Zoom Instructions */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10px] sm:text-[11px] font-mono-tech text-[#e5c200]">
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="flex items-center gap-1 text-[#ff007a] hover:text-[#ffe500] font-bold cursor-pointer underline"
          >
            <Camera className="w-3.5 h-3.5" /> 📷 Snap Live Selfie
          </button>
          <span className="flex items-center gap-1">
            <Move className="w-3 h-3 text-[#ff007a]" /> Drag to Pan
          </span>
          <span className="flex items-center gap-1">
            <ZoomIn className="w-3 h-3 text-[#ffe500]" /> Pinch / Scroll to Zoom
          </span>
        </div>

        {/* Camera Modal */}
        <CameraModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={(img) => {
            onPhotoLoaded(img);
            onPanChange(0, 0);
            onZoomChange(1.0);
          }}
        />

        {/* Pop-In 3D Card Render Modal */}
        <Card3DViewer
          sourceCanvas={canvasRef.current}
          format={config.format}
          name={config.name}
          role={config.role}
          isOpen={is3DModalOpen}
          autoStartRecording={autoRecord3D}
          groupFrameStyle={config.groupFrameStyle}
          onGroupFrameStyleChange={onGroupFrameStyleChange}
          onClose={() => {
            setIs3DModalOpen(false);
            setAutoRecord3D(false);
          }}
          onUploadPhoto={() => fileInputRef.current?.click()}
          onSnapSelfie={() => setIsCameraOpen(true)}
        />
      </div>
    );
  }
);

CanvasPreview.displayName = 'CanvasPreview';

export default CanvasPreview;
