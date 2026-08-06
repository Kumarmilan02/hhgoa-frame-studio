'use client';

import React from 'react';

export default function MovingGoaScooty() {
  return (
    <div className="w-full relative h-20 sm:h-24 bg-[#181c20] border-t-2 border-b-2 border-white/90 overflow-hidden select-none z-10 my-3 shadow-lg">
      {/* Top Road Curb (Red & White Coastal Curb) */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#ff007a_0px,#ff007a_20px,#ffffff_20px,#ffffff_40px)]" />

      {/* Bottom Road Curb (Yellow & Black Curb) */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#ffe500_0px,#ffe500_20px,#181c20_20px,#181c20_40px)]" />

      {/* Static Yellow Center Dash Line */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 border-t-2 border-dashed border-[#ffe500]/70 w-full" />

      {/* Roadside Milestone Marker Badge */}
      <div className="absolute top-2 right-4 bg-[#ffe500] text-[#042616] font-mono-tech text-[9px] font-extrabold px-2 py-0.5 rounded border border-[#042616] shadow-sm z-20 hidden sm:block">
        📍 ANJUNA BEACH 2.5 KM
      </div>

      {/* Scooty 1 (Green / Light Scooty) - Compact Size (w-20 h-20 sm:w-24 sm:h-24) */}
      <div
        className="animate-scooty-ride absolute top-1/2 -translate-y-1/2 left-0 flex items-center justify-center z-10"
        style={{ animationDuration: '14s', animationDelay: '0s' }}
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center">
          <iframe
            src="https://lottie.host/embed/e4bcd9f2-08fc-4cce-8f7e-6d4fab708a52/yk8GoPog39.lottie"
            className="w-full h-full border-0 pointer-events-none bg-transparent"
            title="Lottie Scooty 1"
          />
        </div>
      </div>

      {/* Scooty 2 (Blue / Purple Scooty) - Half-Loop Staggered (7s delay) */}
      <div
        className="animate-scooty-ride absolute top-1/2 -translate-y-1/2 left-0 flex items-center justify-center z-10"
        style={{ animationDuration: '14s', animationDelay: '7s' }}
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center">
          <iframe
            src="https://lottie.host/embed/f9c4a803-752b-4050-87f8-b14bc48c0688/kTtbL5UUbD.json"
            className="w-full h-full border-0 pointer-events-none bg-transparent"
            title="Lottie Scooty 2"
          />
        </div>
      </div>
    </div>
  );
}
