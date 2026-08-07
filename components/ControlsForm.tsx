'use client';

import React, { useState } from 'react';
import { ZoomIn, Move, User, Code, RotateCcw, Sparkles, Palette, Zap, Flame, QrCode, Smile } from 'lucide-react';
import { StylePreset } from '@/lib/canvas-generator';

interface ControlsFormProps {
  format: 'formatA' | 'formatB';
  name: string;
  role: string;
  builderTitle: string;
  superpower: string;
  codingMood: string;
  zoom: number;
  panX: number;
  panY: number;
  stylePreset: StylePreset;
  qrLink?: string;
  stickers?: string[];
  onNameChange: (val: string) => void;
  onRoleChange: (val: string) => void;
  onBuilderTitleChange: (val: string) => void;
  onSuperpowerChange: (val: string) => void;
  onCodingMoodChange: (val: string) => void;
  onZoomChange: (val: number) => void;
  onPanXChange: (val: number) => void;
  onPanYChange: (val: number) => void;
  onStyleChange: (preset: StylePreset) => void;
  onQrLinkChange?: (val: string) => void;
  onToggleSticker?: (sticker: string) => void;
  onStickerMove?: (sticker: string, preset: 'topLeft' | 'topRight' | 'center' | 'bottomLeft' | 'bottomRight') => void;
}

const STYLES: { id: StylePreset; label: string; color: string }[] = [
  { id: 'emerald', label: 'Palm Emerald', color: '#0A5C36' },
  { id: 'sunset', label: 'Sunset Gold', color: '#C84B15' },
  { id: 'cyber', label: 'Cyber Pink', color: '#0B1D3A' },
  { id: 'midnight', label: 'Midnight Beach', color: '#062B2B' },
];

const WEAPON_OPTIONS = [
  { label: 'VS Code & Copilot', role: 'Fullstack / AI Dev' },
  { label: 'Figma & Coffee', role: 'Design Engineer' },
  { label: 'Vim & Terminal', role: 'Backend / Infra' },
  { label: 'Solidity & Hardhat', role: 'Web3 / Smart Contracts' },
];

const VIBE_OPTIONS = [
  { label: 'Ship or Die', title: '10x Deployer', power: 'Shipping code faster than the speed of light' },
  { label: 'Debugging Life', title: 'Zero-Bug Engine', power: 'Squashing bugs before they are even written' },
  { label: 'Need more Feni', title: 'Goan Hacker', power: 'Converting Feni into production-ready code' },
  { label: 'Prompting LLMs', title: 'Neural Wizard', power: 'Whispering to AI to do my job for me' },
];

const AVAILABLE_STICKERS = ['🌴', '🥥', '🛵', '💻', '🕶️', '🍹', '🌊', '🔥', '⚡', '🏆'];

export default function ControlsForm({
  format,
  name,
  role,
  builderTitle,
  superpower,
  codingMood,
  zoom,
  panX,
  panY,
  stylePreset,
  qrLink,
  stickers = [],
  onNameChange,
  onRoleChange,
  onBuilderTitleChange,
  onSuperpowerChange,
  onCodingMoodChange,
  onZoomChange,
  onPanXChange,
  onPanYChange,
  onStyleChange,
  onQrLinkChange,
  onToggleSticker,
  onStickerMove,
}: ControlsFormProps) {
  const [activeTab, setActiveTab] = useState<'identity' | 'remix' | 'stickers'>('identity');

  const handleReset = (e?: React.MouseEvent) => {
    e?.preventDefault();
    onZoomChange(1.0);
    onPanXChange(0);
    onPanYChange(0);
  };

  const handleCycleStyle = (e?: React.MouseEvent) => {
    e?.preventDefault();
    const currentIndex = STYLES.findIndex((s) => s.id === stylePreset);
    const nextIndex = (currentIndex + 1) % STYLES.length;
    if (STYLES[nextIndex]) {
      onStyleChange(STYLES[nextIndex].id);
    }
  };

  const handleWeaponChange = (idx: number) => {
    const opt = WEAPON_OPTIONS[idx];
    onRoleChange(opt.role);
  };

  const handleVibeChange = (idx: number) => {
    const opt = VIBE_OPTIONS[idx];
    onBuilderTitleChange(opt.title);
    onSuperpowerChange(opt.power);
  };

  return (
    <div className="card-hh-emerald p-4 sm:p-5 rounded-3xl border border-[#148048] space-y-4 shadow-xl">
      {/* Sliding Control Tabs */}
      <div className="flex border border-[#148048]/40 bg-[#042616] rounded-2xl p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('identity')}
          className={`flex-1 py-2 px-1 rounded-xl font-mono-tech text-[10px] sm:text-xs font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'identity'
              ? 'bg-[#ffe500] text-[#042616] font-black'
              : 'text-[#e5c200] hover:text-white'
          }`}
        >
          👤 Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('remix')}
          className={`flex-1 py-2 px-1 rounded-xl font-mono-tech text-[10px] sm:text-xs font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'remix'
              ? 'bg-[#ffe500] text-[#042616] font-black'
              : 'text-[#e5c200] hover:text-white'
          }`}
        >
          🎨 Remix
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stickers')}
          className={`flex-1 py-2 px-1 rounded-xl font-mono-tech text-[10px] sm:text-xs font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'stickers'
              ? 'bg-[#ffe500] text-[#042616] font-black'
              : 'text-[#e5c200] hover:text-white'
          }`}
        >
          🏷️ Stickers
        </button>
      </div>

      {/* Identity Tab */}
      {activeTab === 'identity' && (
        <div className="space-y-3.5">
          {format === 'formatA' && (
            <div className="p-2.5 bg-[#ff007a]/15 border border-[#ff007a]/30 rounded-xl text-[10px] font-mono-tech text-[#ff007a] uppercase font-bold leading-normal">
              💡 Notice: Info fields below are primarily shown on the Builder ID Card format.
            </div>
          )}

          <div>
            <label className="block font-mono-tech text-xs text-[#ffe500] uppercase mb-1.5 flex items-center gap-1.5 font-bold">
              <User className="w-3.5 h-3.5 text-[#ff007a]" /> Builder Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. JON ALBERTO"
              className="w-full bg-[#042616] text-white border border-[#148048] focus:border-[#ffe500] focus:ring-1 focus:ring-[#ffe500] rounded-xl px-3 py-2 text-sm font-mono-tech outline-none transition"
            />
          </div>

          <div>
            <label className="block font-mono-tech text-xs text-[#ffe500] uppercase mb-1.5 flex items-center gap-1.5 font-bold">
              <Code className="w-3.5 h-3.5 text-[#ff007a]" /> 1. Weapon of Choice?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WEAPON_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleWeaponChange(idx)}
                  className={`py-2 px-2 text-[10px] font-mono-tech uppercase font-bold border transition cursor-pointer rounded-xl ${
                    role === opt.role
                      ? 'bg-[#ffe500] text-[#042616] border-[#ffe500]'
                      : 'bg-[#042616] text-[#e5c200] border-[#148048] hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono-tech text-xs text-[#ffe500] uppercase mb-1.5 flex items-center gap-1.5 font-bold">
              <Flame className="w-3.5 h-3.5 text-[#ff007a]" /> 2. Current Vibe?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VIBE_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleVibeChange(idx)}
                  className={`py-2 px-2 text-[10px] font-mono-tech uppercase font-bold border transition cursor-pointer rounded-xl ${
                    builderTitle === opt.title
                      ? 'bg-[#ffe500] text-[#042616] border-[#ffe500]'
                      : 'bg-[#042616] text-[#e5c200] border-[#148048] hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono-tech text-xs text-[#ffe500] uppercase mb-1.5 flex items-center gap-1.5 font-bold">
              <QrCode className="w-3.5 h-3.5 text-[#ff007a]" /> Social Handle / QR Link
            </label>
            <input
              type="text"
              value={qrLink || ''}
              onChange={(e) => onQrLinkChange?.(e.target.value)}
              placeholder="e.g. @satoshi or https://t.me/satoshi"
              className="w-full bg-[#042616] text-white border border-[#148048] focus:border-[#ffe500] focus:ring-1 focus:ring-[#ffe500] rounded-xl px-3 py-2 text-sm font-mono-tech outline-none transition"
            />
          </div>
        </div>
      )}

      {/* Remix Tab */}
      {activeTab === 'remix' && (
        <div className="space-y-4">
          {/* Style selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono-tech text-xs text-[#ffe500] uppercase font-bold flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-[#ff007a]" /> Style Themes
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[10px] font-mono-tech text-[#e5c200] hover:text-[#ffe500] flex items-center gap-1 underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset Fit
              </button>
            </div>

            <button
              type="button"
              onClick={handleCycleStyle}
              className="w-full py-2.5 px-3 bg-[#042616] hover:bg-[#0b6638] text-[#ffe500] border border-[#ff007a]/60 rounded-xl font-mono-tech text-xs font-bold uppercase transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Palette className="w-4 h-4 text-[#ffe500]" /> 🎲 Style Remix
            </button>

            <div className="flex gap-1.5 pt-1">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onStyleChange(s.id)}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-mono-tech uppercase font-bold border transition cursor-pointer ${
                    stylePreset === s.id
                      ? 'bg-[#ffe500] text-[#042616] border-[#ffe500]'
                      : 'bg-[#042616] text-[#e5c200] border-[#148048] hover:text-white'
                  }`}
                >
                  {s.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Fit Presets */}
          <div className="pt-2 border-t border-[#148048]/40">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono-tech text-xs text-[#ffe500] uppercase font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#ff007a]" /> 1-Tap Fit Presets
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                key="auto-center"
                type="button"
                onClick={handleReset}
                className="py-1.5 px-1 bg-[#042616] hover:bg-[#0b6638] text-[#ffe500] border border-[#148048] rounded-lg font-mono-tech text-[10px] font-bold uppercase transition text-center cursor-pointer"
              >
                🎯 Center
              </button>
              <button
                key="zoom-135"
                type="button"
                onClick={() => onZoomChange(1.35)}
                className="py-1.5 px-1 bg-[#042616] hover:bg-[#0b6638] text-[#ffe500] border border-[#148048] rounded-lg font-mono-tech text-[10px] font-bold uppercase transition text-center cursor-pointer"
              >
                🔍 1.35x
              </button>
              <button
                key="zoom-portrait"
                type="button"
                onClick={() => onZoomChange(1.8)}
                className="py-1.5 px-1 bg-[#042616] hover:bg-[#0b6638] text-[#ffe500] border border-[#148048] rounded-lg font-mono-tech text-[10px] font-bold uppercase transition text-center cursor-pointer"
              >
                👤 Portrait
              </button>
            </div>
          </div>

          {/* Photo Pan & Scale */}
          <div className="space-y-3 pt-2 border-t border-[#148048]/40">
            <div className="flex items-center justify-between">
              <label className="font-mono-tech text-xs text-[#ffe500] uppercase flex items-center gap-1.5 font-bold">
                <ZoomIn className="w-3.5 h-3.5 text-[#ff007a]" /> Zoom Scale ({zoom.toFixed(2)}x)
              </label>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="w-full accent-[#ffe500] cursor-pointer"
            />

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="font-mono-tech text-[10px] text-[#e5c200] uppercase flex items-center gap-1 font-semibold">
                  <Move className="w-3 h-3" /> Horiz ({panX}px)
                </label>
                <input
                  type="range"
                  min="-250"
                  max="250"
                  value={panX}
                  onChange={(e) => onPanXChange(parseInt(e.target.value))}
                  className="w-full accent-[#ffe500] cursor-pointer"
                />
              </div>

              <div>
                <label className="font-mono-tech text-[10px] text-[#e5c200] uppercase flex items-center gap-1 font-semibold">
                  <Move className="w-3 h-3" /> Vert ({panY}px)
                </label>
                <input
                  type="range"
                  min="-250"
                  max="250"
                  value={panY}
                  onChange={(e) => onPanYChange(parseInt(e.target.value))}
                  className="w-full accent-[#ffe500] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stickers Tab */}
      {activeTab === 'stickers' && (
        <div className="space-y-4">
          <div>
            <label className="block font-mono-tech text-xs text-[#ffe500] uppercase mb-2 font-bold flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-[#ff007a]" /> Select stickers to add:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {AVAILABLE_STICKERS.map((st) => {
                const isActive = stickers?.includes(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onToggleSticker?.(st)}
                    className={`h-11 text-xl flex items-center justify-center rounded-xl transition cursor-pointer border ${
                      isActive
                        ? 'bg-[#ffe500]/20 border-[#ffe500] scale-105 shadow-md font-black'
                        : 'bg-[#042616] border-[#148048] hover:border-[#ffe500]/50'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active stickers position controls */}
          {stickers && stickers.length > 0 ? (
            <div className="space-y-3 pt-3 border-t border-[#148048]/40">
              <label className="block font-mono-tech text-xs text-[#ffe500] uppercase font-bold">
                Tap Preset Coordinates to Place:
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {stickers.map((st) => (
                  <div
                    key={st}
                    className="flex flex-col gap-1.5 p-2 bg-[#042616] rounded-xl border border-[#148048]/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono-tech text-[#ffe500] font-black">{st} Sticker</span>
                      <button
                        type="button"
                        onClick={() => onToggleSticker?.(st)}
                        className="text-[9px] font-mono-tech text-[#ff007a] hover:underline uppercase font-black"
                      >
                        Remove
                      </button>
                    </div>
                    {/* Position Presets */}
                    <div className="grid grid-cols-5 gap-1">
                      {(['topLeft', 'topRight', 'center', 'bottomLeft', 'bottomRight'] as const).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => onStickerMove?.(st, preset)}
                          className="py-1 rounded bg-[#0b6638]/60 hover:bg-[#ffe500] hover:text-[#042616] text-white text-[9px] font-mono-tech font-bold uppercase transition cursor-pointer"
                        >
                          {preset === 'topLeft' ? 'TL' :
                           preset === 'topRight' ? 'TR' :
                           preset === 'center' ? 'C' :
                           preset === 'bottomLeft' ? 'BL' : 'BR'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 border border-dashed border-[#148048]/40 rounded-xl text-[10px] font-mono-tech text-[#e5c200] uppercase">
              No stickers active. Click above to add some beach/hacker vibes!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
