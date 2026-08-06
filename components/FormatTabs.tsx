import React from 'react';
import { User, CreditCard } from 'lucide-react';

interface FormatTabsProps {
  activeFormat: 'formatA' | 'formatB';
  onChange: (format: 'formatA' | 'formatB') => void;
}

export default function FormatTabs({ activeFormat, onChange }: FormatTabsProps) {
  return (
    <div className="w-full max-w-xl mx-auto mb-6 p-1.5 bg-[#042616] rounded-xl border border-[#148048] flex gap-2">
      <button
        onClick={() => onChange('formatA')}
        className={`flex-1 py-3 px-4 rounded-lg font-mono-tech text-xs sm:text-sm font-bold uppercase transition flex items-center justify-center gap-2 ${activeFormat === 'formatA'
          ? 'bg-[#ffe500] text-[#042616] shadow-lg glow-yellow'
          : 'text-white hover:text-[#ffe500] hover:bg-[#0b6638]/50'
          }`}
      >
        <User className="w-4 h-4" />
        PFP Overlay
      </button>

      <button
        onClick={() => onChange('formatB')}
        className={`flex-1 py-3 px-4 rounded-lg font-mono-tech text-xs sm:text-sm font-bold uppercase transition flex items-center justify-center gap-2 ${activeFormat === 'formatB'
          ? 'bg-[#ffe500] text-[#042616] shadow-lg glow-yellow'
          : 'text-white hover:text-[#ffe500] hover:bg-[#0b6638]/50'
          }`}
      >
        <CreditCard className="w-4 h-4" />
        Builder ID Badge
      </button>
    </div>
  );
}
