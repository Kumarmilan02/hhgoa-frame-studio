import React from 'react';
import { ZoomIn, Move, User, Code, RotateCcw, Sparkles, Palette, Zap, Flame, QrCode, Smile, Award } from 'lucide-react';
import { StylePreset, BadgeCategory } from '@/lib/canvas-generator';

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
  badgeCategory: BadgeCategory;
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
  onBadgeCategoryChange: (cat: BadgeCategory) => void;
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

const BADGE_CATEGORIES: { id: BadgeCategory; label: string; icon: string }[] = [
  { id: 'HACKER', label: 'HACKER', icon: '💻' },
  { id: 'VOLUNTEER', label: 'VOLUNTEER', icon: '🤝' },
  { id: 'ORGANIZER', label: 'ORGANIZER', icon: '⚡' },
  { id: 'HOST', label: 'HOST', icon: '🏠' },
];

const RANDOM_TITLES = [
  "🚀 Startup Sprinter",
  "🤖 AI Trailblazer",
  "⚡ Bug Slayer",
  "🛠️ Feature Crafter",
  "☁️ Cloud Commander",
  "🎯 Deployment Hero",
  "⚔️ Merge Warrior",
  "🏆 Hackathon Legend",
  "🏄 Beachside Builder",
  "🥥 Coconut Compiler"
];

const RANDOM_SUPERPOWERS = [
  "☕ Converts Coffee into Production Code",
  "🌴 Deploys Features Before the Beach Trip",
  "🐞 Finds Bugs That Don't Exist",
  "🤖 Makes AI Say 'You're Absolutely Right!'",
  "🚀 Ships Features Faster Than Wi-Fi",
  "🍕 Survives Entire Hackathons on Pizza",
  "💻 Fixes Production with One Console Log",
  "📦 Deploys on Friday... Fearlessly",
  "⚡ Writes Code That Compiles on the First Try",
  "🧠 Reads Error Messages Without Crying"
];

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
  badgeCategory,
  qrLink,
  stickers,
  onNameChange,
  onRoleChange,
  onBuilderTitleChange,
  onSuperpowerChange,
  onCodingMoodChange,
  onZoomChange,
  onPanXChange,
  onPanYChange,
  onStyleChange,
  onBadgeCategoryChange,
  onQrLinkChange,
  onToggleSticker,
  onStickerMove,
}: ControlsFormProps) {
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

  const handleRandomTitle = () => {
    const random = RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)];
    onBuilderTitleChange(random);
  };

  const handleRandomSuperpower = () => {
    const random = RANDOM_SUPERPOWERS[Math.floor(Math.random() * RANDOM_SUPERPOWERS.length)];
    onSuperpowerChange(random);
  };

  return (
    <div className="card-hh-emerald p-4 sm:p-5 rounded-2xl border border-[#148048] space-y-4 shadow-xl">
      {/* Format B Custom Metadata Inputs */}
      {format === 'formatB' && (
        <div className="space-y-3 pb-3 border-b border-[#148048]/40">
          <div>
            <label className="block font-mono-tech text-xs text-[#ffe500] uppercase mb-1 flex items-center gap-1.5 font-bold">
              <User className="w-3.5 h-3.5 text-[#ff007a]" /> Builder Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. JON ALBERTO"
              className="w-full bg-[#042616] text-white border border-[#148048] focus:border-[#ffe500] rounded-lg px-3 py-2 text-sm font-mono-tech outline-none transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono-tech text-xs text-[#ffe500] uppercase flex items-center gap-1.5 font-bold">
                <Zap className="w-3.5 h-3.5 text-[#ff007a]" /> Builder Title
              </label>
              <button
                type="button"
                onClick={handleRandomTitle}
                className="text-[10px] font-mono-tech text-[#ff007a] hover:text-[#ffe500] flex items-center gap-1 font-bold underline cursor-pointer"
              >
                🎲 Random Title
              </button>
            </div>
            <input
              type="text"
              value={builderTitle}
              onChange={(e) => onBuilderTitleChange(e.target.value)}
              placeholder="e.g. ⚡ Full-Stack Hacker"
              className="w-full bg-[#042616] text-white border border-[#148048] focus:border-[#ffe500] rounded-lg px-3 py-2 text-sm font-mono-tech outline-none transition"
            />
          </div>

          <div>
            <label className="block font-mono-tech text-xs text-[#ffe500] uppercase mb-1 flex items-center gap-1.5 font-bold">
              <Code className="w-3.5 h-3.5 text-[#ff007a]" /> Stack / Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
              placeholder="e.g. Fullstack Developer / AI Eng"
              className="w-full bg-[#042616] text-white border border-[#148048] focus:border-[#ffe500] rounded-lg px-3 py-2 text-sm font-mono-tech outline-none transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono-tech text-xs text-[#ffe500] uppercase flex items-center gap-1.5 font-bold">
                <Flame className="w-3.5 h-3.5 text-[#ff007a]" /> Superpower
              </label>
              <button
                type="button"
                onClick={handleRandomSuperpower}
                className="text-[10px] font-mono-tech text-[#ff007a] hover:text-[#ffe500] flex items-center gap-1 font-bold underline cursor-pointer"
              >
                🎲 Random Superpower
              </button>
            </div>
            <input
              type="text"
              value={superpower}
              onChange={(e) => onSuperpowerChange(e.target.value)}
              placeholder="e.g. Turning Coconut Water into Apps"
              className="w-full bg-[#042616] text-white border border-[#148048] focus:border-[#ffe500] rounded-lg px-3 py-2 text-sm font-mono-tech outline-none transition"
            />
          </div>
        </div>
      )}

      {/* Style Remix Section */}
      <div className="space-y-2.5">
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
          className="w-full py-2.5 px-3 bg-[#042616] hover:bg-[#0b6638] text-[#ffe500] border border-[#ff007a]/60 rounded-lg font-mono-tech text-xs font-bold uppercase transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <Palette className="w-4 h-4 text-[#ffe500]" /> 🎲 Style Remix
        </button>

        {/* Style Selector Chips */}
        <div className="flex gap-1.5 pt-1">
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onStyleChange(s.id)}
              className={`flex-1 py-1 rounded text-[10px] font-mono-tech uppercase font-bold border transition cursor-pointer ${stylePreset === s.id
                ? 'bg-[#ffe500] text-[#042616] border-[#ffe500]'
                : 'bg-[#042616] text-[#e5c200] border-[#148048] hover:text-white'
                }`}
            >
              {s.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Official Round Emblem Category Badge Section */}
      <div className="space-y-2 pt-1 border-t border-[#148048]/40">
        <label className="block font-mono-tech text-xs text-[#ffe500] uppercase font-bold flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-[#ff007a]" /> Official Category Emblem Badge
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {BADGE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onBadgeCategoryChange(cat.id)}
              className={`py-1.5 px-2 rounded-xl font-mono-tech text-[11px] uppercase font-black flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                badgeCategory === cat.id
                  ? 'bg-[#ffe500] text-[#042616] border-[#ffe500] shadow-lg scale-[1.03]'
                  : 'bg-[#042616] text-[#e5c200] border-[#148048] hover:border-[#ffe500] hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Centering Presets */}
      <div className="pt-2 border-t border-[#148048]/40">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono-tech text-xs text-[#ffe500] uppercase font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#ff007a]" /> 1-Tap Fit Presets
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="py-1.5 px-2 bg-[#042616] hover:bg-[#0b6638] text-[#ffe500] border border-[#148048] rounded-md font-mono-tech text-[11px] font-bold uppercase transition text-center cursor-pointer"
          >
            🎯 Auto-Center
          </button>
          <button
            type="button"
            onClick={() => {
              onZoomChange(1.35);
            }}
            className="py-1.5 px-2 bg-[#042616] hover:bg-[#0b6638] text-[#ffe500] border border-[#148048] rounded-md font-mono-tech text-[11px] font-bold uppercase transition text-center cursor-pointer"
          >
            🔍 Zoom 1.35x
          </button>
          <button
            type="button"
            onClick={() => {
              onZoomChange(1.8);
            }}
            className="py-1.5 px-2 bg-[#042616] hover:bg-[#0b6638] text-[#ffe500] border border-[#148048] rounded-md font-mono-tech text-[11px] font-bold uppercase transition text-center cursor-pointer"
          >
            👤 Portrait Zoom
          </button>
        </div>
      </div>

      {/* Photo Alignment & Scale Controls */}
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
            <label className="font-mono-tech text-[11px] text-[#e5c200] uppercase flex items-center gap-1 font-semibold">
              <Move className="w-3 h-3" /> Horizontal ({panX}px)
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
            <label className="font-mono-tech text-[11px] text-[#e5c200] uppercase flex items-center gap-1 font-semibold">
              <Move className="w-3 h-3" /> Vertical ({panY}px)
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
  );
}
