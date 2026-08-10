import React from 'react';
import { User, CreditCard, Users } from 'lucide-react';

interface FormatTabsProps {
  activeFormat: 'formatA' | 'formatB' | 'formatC';
  onChange: (format: 'formatA' | 'formatB' | 'formatC') => void;
}

export default function FormatTabs({ activeFormat, onChange }: FormatTabsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-6 p-1.5 bg-[#042616] rounded-xl border border-[#148048] grid grid-cols-3 gap-1.5 sm:gap-2">
      <button
        type="button"
        onClick={() => onChange('formatA')}
        className={`py-2.5 px-2 sm:px-4 rounded-lg font-mono-tech text-[10px] sm:text-xs font-black uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${activeFormat === 'formatA'
            ? 'bg-[#ffe500] text-[#042616] shadow-lg glow-yellow'
            : 'text-white hover:text-[#ffe500] hover:bg-[#0b6638]/50'
          }`}
      >
        <User className="w-3.5 h-3.5 shrink-0" />
        <span>PFP Badge</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('formatB')}
        className={`py-2.5 px-2 sm:px-4 rounded-lg font-mono-tech text-[10px] sm:text-xs font-black uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${activeFormat === 'formatB'
            ? 'bg-[#ffe500] text-[#042616] shadow-lg glow-yellow'
            : 'text-white hover:text-[#ffe500] hover:bg-[#0b6638]/50'
          }`}
      >
        <CreditCard className="w-3.5 h-3.5 shrink-0" />
        <span>BUILDER ID BADGE</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('formatC')}
        className={`py-2.5 px-2 sm:px-4 rounded-lg font-mono-tech text-[10px] sm:text-xs font-black uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${activeFormat === 'formatC'
            ? 'bg-[#ff007a] text-white shadow-lg glow-pink'
            : 'text-white hover:text-[#ff007a] hover:bg-[#0b6638]/50'
          }`}
      >
        <Users className="w-3.5 h-3.5 shrink-0 text-[#ffe500]" />
        <span>Group Squad</span>
      </button>
    </div>
  );
}
