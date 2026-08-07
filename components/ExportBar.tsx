'use client';

import React, { useState } from 'react';
import { Download, Share2, Loader2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportBarProps {
  getCanvas: () => HTMLCanvasElement | null;
  format: 'formatA' | 'formatB';
}

export default function ExportBar({ getCanvas, format }: ExportBarProps) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const handleDownload = () => {
    const canvas = getCanvas();
    if (!canvas) return;

    setDownloading(true);
    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `hh-goa-2026-${format}.png`;
      link.href = dataUrl;
      link.click();

      // Trigger celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ffe500', '#ff007a', '#0a5c36', '#ffffff'],
      });
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShareToX = async () => {
    const canvas = getCanvas();
    if (!canvas) return;

    setSharing(true);
    try {
      const dataUrl = canvas.toDataURL('image/png', 0.9);

      // Call share API to generate dynamic Open Graph URL
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      });

      let shareUrl = window.location.origin;
      if (res.ok) {
        const data = await res.json();
        if (data.shareId) {
          shareUrl = `${window.location.origin}/share/${data.shareId}`;
        }
      }

      // Construct prefilled tweet with #FrameInGoa hashtag
      const tweetText = encodeURIComponent(
        `Excited for Hacker House Goa 2026! 🌴 500 elite builders, high-speed fiber, and non-stop shipping.\n\nHere is my official builder graphic! 👇\n\n#FrameInGoa @247pmstudio @Devfolio`
      );

      const intentUrl = `https://x.com/intent/post?text=${tweetText}&url=${encodeURIComponent(
        shareUrl
      )}`;

      // Open X tweet intent in new tab
      window.open(intentUrl, '_blank', 'noopener,noreferrer');
      setShared(true);
      setTimeout(() => setShared(false), 4000);
    } catch (err) {
      console.error('Share error:', err);
      // Fallback intent without server share link
      const tweetText = encodeURIComponent(
        `Excited for Hacker House Goa 2026! 🌴 Here is my official builder graphic!\n\n#FrameInGoa @247pmstudio`
      );
      window.open(`https://x.com/intent/post?text=${tweetText}`, '_blank');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="w-full flex flex-col sm:flex-row gap-4 mt-6">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="btn-hh-yellow flex-1 py-4 px-6 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
      >
        {downloading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        Download PNG (High-Res)
      </button>

      <button
        onClick={handleShareToX}
        disabled={sharing}
        className="flex-1 py-4 px-4 rounded-xl font-mono-tech text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#ff007a] text-white hover:bg-[#e0006b] transition flex items-center justify-center gap-2 cursor-pointer shadow-lg glow-pink"
      >
        {sharing ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : shared ? (
          <Check className="w-4 h-4 text-white" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
        {sharing ? 'Preparing...' : shared ? 'Opened X!' : 'Share X (Twitter)'}
      </button>

      <button
        type="button"
        onClick={() => {
          const text = encodeURIComponent('Excited for Hacker House Goa 2026! 🌴 #FrameInGoa #HHGOA2026');
          const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://hhgoa.com')}&text=${text}`;
          window.open(shareUrl, '_blank', 'noopener,noreferrer');
        }}
        className="flex-1 py-4 px-4 rounded-xl font-mono-tech text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#0a66c2] text-white hover:bg-[#084e96] transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
      >
        <Share2 className="w-4 h-4" />
        Share LinkedIn
      </button>
    </div>
  );
}
