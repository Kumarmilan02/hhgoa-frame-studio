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
      // 1. Convert Canvas to PNG Data URL & Blob
      const dataUrl = canvas.toDataURL('image/png', 0.95);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));

      // 2. Copy Image to Clipboard & Auto-Download for instant backup
      if (blob) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        } catch (clipErr) {
          console.warn('Clipboard copy warning:', clipErr);
        }
        handleDownload();
      }

      // 3. Post to /api/share to get Open Graph Twitter Card URL
      let shareUrl = window.location.origin;
      try {
        const res = await fetch('/api/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.shareId) {
            shareUrl = `${window.location.origin}/share/${data.shareId}`;
          }
        }
      } catch (e) {
        console.warn('Share API error:', e);
      }

      // 4. Launch X (Twitter) Intent DIRECTLY - No intermediate share options!
      const tweetText = encodeURIComponent(
        `Excited for Hacker House Goa 2026! 🌴 Here is my official builder graphic! 👇\n\n#FrameInGoa #HHGOA2026`
      );

      const intentUrl = `https://x.com/intent/post?text=${tweetText}&url=${encodeURIComponent(shareUrl)}`;
      window.open(intentUrl, '_blank', 'noopener,noreferrer');

      setShared(true);
      setTimeout(() => setShared(false), 4000);
    } catch (err) {
      console.error('Share error:', err);
    } finally {
      setSharing(false);
    }
  };

  const handleShareToLinkedIn = async () => {
    const canvas = getCanvas();
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'badge.png', { type: 'image/png' })] })) {
        await navigator.share({
          title: 'Hacker House Goa 2026 Builder Graphic',
          text: 'Excited for Hacker House Goa 2026! 🌴 #FrameInGoa #HHGOA2026',
          files: [new File([blob], 'badge.png', { type: 'image/png' })],
        });
        return;
      }
    } catch (e) {
      console.warn('LinkedIn Web Share fallback', e);
    }

    // Fallback: Trigger download & open LinkedIn Share
    handleDownload();
    const text = encodeURIComponent('Excited for Hacker House Goa 2026! 🌴 #FrameInGoa #HHGOA2026');
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://hhgoa.com')}&text=${text}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
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
        {sharing ? 'Attaching Image...' : shared ? 'Image Shared / Copied!' : 'Share X (Twitter)'}
      </button>

      <button
        type="button"
        onClick={handleShareToLinkedIn}
        className="flex-1 py-4 px-4 rounded-xl font-mono-tech text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#0a66c2] text-white hover:bg-[#084e96] transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
      >
        <Share2 className="w-4 h-4" />
        Share LinkedIn
      </button>
    </div>
  );
}
