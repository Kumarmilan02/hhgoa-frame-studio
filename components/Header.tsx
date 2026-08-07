import React from 'react';

export default function Header() {
  return (
    <header className="w-full border-b border-[#148048]/50 bg-[#042616]/90 backdrop-blur-md px-3 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Left */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#ffe500] text-[#042616] font-mono-tech font-black text-[10px] sm:text-xs flex items-center justify-center border border-[#042616] flex-shrink-0">
            2:47
          </div>
          <div>
            <div className="font-mono-tech text-[9px] sm:text-[10px] text-[#e5c200] tracking-widest uppercase font-bold">
              2:47 PM STUDIO
            </div>
            <div className="font-display font-black text-sm sm:text-lg text-[#ffe500] leading-none tracking-tight">
              HH <span className="text-[#ff007a] font-sans text-xs sm:text-sm">गोवा</span> 2026
            </div>
          </div>
        </div>

        {/* Right Hashtag & Website Link */}
        <div className="flex items-center gap-2">
          <span className="font-mono-tech text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#ff007a]/20 text-[#ff007a] border border-[#ff007a]/40 rounded-md font-semibold">
            #FrameInGoa
          </span>
          <a
            href="https://hhgoa.com"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] sm:text-xs font-mono-tech text-[#e5c200] hover:text-[#ffe500] underline font-bold"
          >
            hhgoa.com ↗
          </a>
        </div>
      </div>
    </header>
  );
}
