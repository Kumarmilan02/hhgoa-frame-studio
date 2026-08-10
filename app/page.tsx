'use client';

import React, { useState, useRef, useMemo } from 'react';
import Header from '@/components/Header';
import FormatTabs from '@/components/FormatTabs';
import CanvasPreview, { CanvasPreviewRef } from '@/components/CanvasPreview';
import ControlsForm from '@/components/ControlsForm';
import ExportBar from '@/components/ExportBar';
import FloatingGoaVibes from '@/components/FloatingParticles';
import MovingGoaScooty from '@/components/MovingGoaScooty';
import { GeneratorConfig, StylePreset, BadgeCategory } from '@/lib/canvas-generator';

export default function Home() {
  const [format, setFormat] = useState<'formatA' | 'formatB'>('formatA');
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [builderTitle, setBuilderTitle] = useState('');
  const [superpower, setSuperpower] = useState('');
  const [codingMood, setCodingMood] = useState('SHIP MODE');
  const [zoom, setZoom] = useState(1.0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [stylePreset, setStylePreset] = useState<StylePreset>('emerald');
  const [badgeCategory, setBadgeCategory] = useState<BadgeCategory>('HACKER');
  const [qrLink, setQrLink] = useState('');
  const [stickers, setStickers] = useState<string[]>([]);
  const [stickerPositions, setStickerPositions] = useState<Record<string, { x: number; y: number }>>({});

  const canvasPreviewRef = useRef<CanvasPreviewRef>(null);

  const handleToggleSticker = (st: string) => {
    setStickers((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  const handleStickerMove = (
    st: string,
    preset: 'topLeft' | 'topRight' | 'center' | 'bottomLeft' | 'bottomRight'
  ) => {
    const coordsMap: Record<string, { x: number; y: number }> = {
      topLeft: { x: 180, y: 180 },
      topRight: { x: 880, y: 180 },
      center: { x: 540, y: 540 },
      bottomLeft: { x: 180, y: 900 },
      bottomRight: { x: 880, y: 900 },
    };
    setStickerPositions((prev) => ({
      ...prev,
      [st]: coordsMap[preset] || { x: 540, y: 540 },
    }));
  };

  const generatorConfig = useMemo<GeneratorConfig>(() => ({
    format,
    photo,
    name,
    role,
    builderTitle,
    superpower,
    codingMood,
    zoom,
    panX,
    panY,
    stylePreset,
    badgeCategory,
    qrLink,
    stickers,
    stickerPositions,
  }), [format, photo, name, role, builderTitle, superpower, codingMood, zoom, panX, panY, stylePreset, badgeCategory, qrLink, stickers, stickerPositions]);

  const handlePhotoLoaded = (img: HTMLImageElement) => {
    setPhoto(img);
    setPanX(0);
    setPanY(0);
    setZoom(1.0);
  };

  return (
    <div className="min-h-screen bg-[#0a5c36] text-white flex flex-col justify-between relative overflow-x-hidden">
      {/* Floating Goa Vibes Background (🥥🌴🕶️🍹🌊🐚) */}
      <FloatingGoaVibes />

      {/* Brand Navigation Header */}
      <Header />

      {/* Animated Wave Divider Below Header */}
      <div className="wave-divider w-full" />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 w-full flex-grow flex flex-col items-center z-10">
        {/* Page Hero Header */}
        <div className="text-center mb-4 sm:mb-6 relative max-w-4xl w-full">
          {/* Decorative Goa Icons Row */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 mb-2 animate-slide-up">
            <span className="text-2xl sm:text-3xl animate-palm-sway">🌴</span>
            <span className="text-xl sm:text-2xl">🥥</span>
            <span className="text-2xl sm:text-3xl">☀️</span>
            <span className="text-xl sm:text-2xl">🥥</span>
            <span className="text-2xl sm:text-3xl animate-palm-sway" style={{ animationDelay: '0.5s' }}>🌴</span>
          </div>

          {/* Main Title Row: HACKER [गोवा SVG Motion] HOUSE */}
          <div className="relative inline-flex flex-wrap items-center justify-center gap-1 sm:gap-3 font-display text-4xl sm:text-7xl lg:text-8xl font-black text-[#ffe500] uppercase tracking-tight leading-none drop-shadow-lg mb-2">
            <span>HACKER</span>
            
            {/* Animated Motion Devanagari Goa SVG Badge */}
            <div className="relative mx-1 sm:mx-2 inline-block animate-goa-badge-motion z-10">
              <img
                src="/images/goa_hindi.svg"
                alt="गोवा"
                className="h-12 sm:h-20 lg:h-24 w-auto drop-shadow-[0_0_20px_rgba(255,0,122,0.9)] cursor-pointer hover:scale-110 transition-transform"
              />
            </div>

            <span>HOUSE</span>
          </div>

          {/* Subtitle Metadata Bar */}
          <div className="w-full flex items-center justify-between font-mono-tech text-[10px] sm:text-xs text-[#ffe500] max-w-3xl mx-auto px-2 mt-1 font-bold tracking-wider">
            <span>GOA, INDIA · 28 - 31 OCT 2026</span>
            <span>BY 2:47 PM STUDIO</span>
          </div>
        </div>

        {/* Format Selector Tabs */}
        <FormatTabs activeFormat={format} onChange={setFormat} />

        {/* Main Interactive Workspace Grid */}
        <div className="w-full flex flex-col lg:grid lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          {/* Canvas Preview Container (Mobile Order 1, Desktop Right Column) */}
          <div className="w-full lg:col-span-7 order-1 lg:order-2 flex flex-col items-center">
            <CanvasPreview
              ref={canvasPreviewRef}
              config={generatorConfig}
              onPhotoLoaded={handlePhotoLoaded}
              onPanChange={(newX, newY) => {
                setPanX(newX);
                setPanY(newY);
              }}
              onZoomChange={(newZoom) => setZoom(newZoom)}
            />

            {/* Desktop Export Bar (Hidden on Mobile) */}
            <div className="hidden lg:block w-full">
              <ExportBar
                getCanvas={() => canvasPreviewRef.current?.getCanvas() || null}
                format={format}
                hasPhoto={!!photo}
                onOpen3D={(autoRecord) => canvasPreviewRef.current?.open3DModal(autoRecord)}
              />
            </div>
          </div>

          {/* Personalization & Style Remix Controls (Mobile Order 2, Desktop Left Column) */}
          <div className="w-full lg:col-span-5 order-2 lg:order-1 space-y-4 sm:space-y-5">
            <div>
              <label className="block font-mono-tech text-xs text-[#ffe500] uppercase mb-1.5 font-bold flex items-center gap-1.5">
                <span>🎨</span> Personalize & Style Remix
              </label>
              <ControlsForm
                format={format}
                name={name}
                role={role}
                builderTitle={builderTitle}
                superpower={superpower}
                codingMood={codingMood}
                zoom={zoom}
                panX={panX}
                panY={panY}
                stylePreset={stylePreset}
                badgeCategory={badgeCategory}
                qrLink={qrLink}
                stickers={stickers}
                onNameChange={setName}
                onRoleChange={setRole}
                onBuilderTitleChange={setBuilderTitle}
                onSuperpowerChange={setSuperpower}
                onCodingMoodChange={setCodingMood}
                onZoomChange={setZoom}
                onPanXChange={setPanX}
                onPanYChange={setPanY}
                onStyleChange={setStylePreset}
                onBadgeCategoryChange={setBadgeCategory}
                onQrLinkChange={setQrLink}
                onToggleSticker={handleToggleSticker}
                onStickerMove={handleStickerMove}
              />
            </div>
          </div>

          {/* Mobile Export Bar (Mobile Order 3, Download & Share at Bottom) */}
          <div className="w-full order-3 lg:hidden flex justify-center">
            <ExportBar
              getCanvas={() => canvasPreviewRef.current?.getCanvas() || null}
              format={format}
              hasPhoto={!!photo}
              onOpen3D={(autoRecord) => canvasPreviewRef.current?.open3DModal(autoRecord)}
            />
          </div>
        </div>
      </main>

      {/* Moving Scooty Animation (2 People Riding Left to Right) */}
      <MovingGoaScooty />

      {/* Footer with Goa Vibes */}
      <footer className="w-full bg-[#042616] py-4 px-4 text-center z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-sm">🌴</span>
          <span className="text-sm">🌊</span>
          <span className="text-sm">🥥</span>
          <span className="text-sm">🕶️</span>
          <span className="text-sm">🍹</span>
        </div>
        <p className="font-mono-tech text-[11px] text-[#e5c200]">
          © 2026 HH-Goa · DEVELOPED BY CODINGKOALAS · Goa, India · #FrameInGoa
        </p>
      </footer>
    </div>
  );
}
