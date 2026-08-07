'use client';

import React, { useState, useRef, useMemo } from 'react';
import CanvasPreview, { CanvasPreviewRef } from '@/components/CanvasPreview';
import ControlsForm from '@/components/ControlsForm';
import { GeneratorConfig, StylePreset } from '@/lib/canvas-generator';
import { X } from 'lucide-react';

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
  const [qrLink, setQrLink] = useState('');
  const [stickers, setStickers] = useState<string[]>([]);
  const [stickerPositions, setStickerPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const canvasPreviewRef = useRef<CanvasPreviewRef>(null);

  const handleToggleSticker = (st: string) => {
    setStickers((prev) => {
      if (prev.includes(st)) return prev.filter((s) => s !== st);
      setStickerPositions((p) => ({ ...p, [st]: { x: 540, y: 675 } }));
      return [...prev, st];
    });
  };

  const handleStickerMove = (
    st: string,
    preset: 'topLeft' | 'topRight' | 'center' | 'bottomLeft' | 'bottomRight'
  ) => {
    const coordsMap: Record<string, { x: number; y: number }> = {
      topLeft: { x: 220, y: 250 },
      topRight: { x: 860, y: 250 },
      center: { x: 540, y: 675 },
      bottomLeft: { x: 220, y: 1050 },
      bottomRight: { x: 860, y: 1050 },
    };
    setStickerPositions((prev) => ({ ...prev, [st]: coordsMap[preset] || { x: 540, y: 675 } }));
  };

  const generatorConfig = useMemo<GeneratorConfig>(
    () => ({ format, photo, name, role, builderTitle, superpower, codingMood, zoom, panX, panY, stylePreset, qrLink, stickers, stickerPositions }),
    [format, photo, name, role, builderTitle, superpower, codingMood, zoom, panX, panY, stylePreset, qrLink, stickers, stickerPositions]
  );

  const handlePhotoLoaded = (img: HTMLImageElement | null) => {
    setPhoto(img);
    setPanX(0);
    setPanY(0);
    setZoom(1.0);
    if (img) setIsEditorOpen(true);
  };

  return (
    // Full-screen camera app shell — no header, no footer, no margins
    <div className="fixed inset-0 bg-[#080808] text-white overflow-hidden font-mono-tech select-none flex flex-col">
      {/* Camera viewfinder fills all remaining space */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <CanvasPreview
          ref={canvasPreviewRef}
          config={generatorConfig}
          onPhotoLoaded={handlePhotoLoaded}
          onPanChange={(x, y) => { setPanX(x); setPanY(y); }}
          onZoomChange={setZoom}
          onStyleChange={setStylePreset}
          onFormatChange={setFormat}
          isEditorOpen={isEditorOpen}
          onToggleEditor={() => setIsEditorOpen((v) => !v)}
        />
      </div>

      {/* Bottom sheet editor — slides up over the viewfinder from absolute bottom */}
      {isEditorOpen && (
        <div className="absolute inset-x-0 bottom-0 z-40 animate-slide-up">
          <div className="bg-[#042f1b]/98 backdrop-blur-xl border-t-2 border-[#148048]/70 rounded-t-3xl shadow-2xl max-h-[72dvh] flex flex-col">
            {/* Sheet handle + header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#148048]/30 shrink-0">
              {/* Drag pill */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-[#148048]/50" />
              <span className="font-mono-tech text-[11px] text-[#ffe500] font-black uppercase tracking-widest">
                ⚙ Customize Card
              </span>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="w-7 h-7 rounded-full bg-[#042616] hover:bg-[#0b6638] text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto px-4 pb-8 pt-3 flex-1">
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
                onQrLinkChange={setQrLink}
                onToggleSticker={handleToggleSticker}
                onStickerMove={handleStickerMove}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
