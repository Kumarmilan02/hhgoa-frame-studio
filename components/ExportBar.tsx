'use client';

import React, { useState } from 'react';
import { Download, Share2, Loader2, Check, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportBarProps {
  getCanvas: () => HTMLCanvasElement | null;
  format: 'formatA' | 'formatB';
  hasPhoto?: boolean;
  onTriggerUpload?: () => void;
}

export default function ExportBar({ getCanvas, format, hasPhoto = false, onTriggerUpload }: ExportBarProps) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const triggerWarning = () => {
    setWarningMsg('⚠️ Please upload your photo first to download or share your badge!');
    if (onTriggerUpload) onTriggerUpload();
    setTimeout(() => setWarningMsg(null), 4500);
  };

  const handleDownload = () => {
    if (!hasPhoto) {
      triggerWarning();
      return;
    }

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
    if (!hasPhoto) {
      triggerWarning();
      return;
    }

    const canvas = getCanvas();
    if (!canvas) return;

    setSharing(true);
    try {
      const rawText = `🌴 Hacker mode: ON.\n\nJust claimed my official Hacker House Goa 2026 Builder Badge! 🚀\n\ngit checkout goa-2026\ngit commit -m "Ready to build."\ngit push origin hacker-house 🚀\n\nNow it's time to build fast, break less, ship more, and maybe survive on coffee & Feni. 😄\n\nCan't wait to build with amazing hackers and builders from around the world. See you in Goa, Oct 28–31!\n\n#FrameInGoa #HHGOA2026`;

      // 1. Convert Canvas to PNG Blob & File
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        const pngFile = new File([blob], `hh-goa-2026-${format}.png`, { type: 'image/png' });

        // On mobile devices (iOS / Android), try native Web Share API with attached image file!
        if (navigator.canShare && navigator.canShare({ files: [pngFile] })) {
          try {
            await navigator.share({
              title: 'Hacker House Goa 2026 Builder Graphic',
              text: rawText,
              files: [pngFile],
            });
            setShared(true);
            setTimeout(() => setShared(false), 4000);
            setSharing(false);
            return;
          } catch (shareErr) {
            console.warn('Native share cancelled or failed, using web intent fallback:', shareErr);
          }
        }

        // Copy Image to Clipboard & Auto-Download for desktop fallback
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        } catch (clipErr) {
          console.warn('Clipboard copy warning:', clipErr);
        }
        handleDownload();
      }

      // 2. Post to /api/share to get Open Graph Twitter Card URL
      const dataUrl = canvas.toDataURL('image/png', 0.95);
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

      // 3. Launch X (Twitter) Intent DIRECTLY
      const tweetText = encodeURIComponent(rawText);
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
    if (!hasPhoto) {
      triggerWarning();
      return;
    }

    const canvas = getCanvas();
    if (!canvas) return;

    const rawText = `🌴 Hacker mode: ON.\n\nJust claimed my official Hacker House Goa 2026 Builder Badge! 🚀\n\ngit checkout goa-2026\ngit commit -m "Ready to build."\ngit push origin hacker-house 🚀\n\nNow it's time to build fast, break less, ship more, and maybe survive on coffee & Feni. 😄\n\nCan't wait to build with amazing hackers and builders from around the world. See you in Goa, Oct 28–31!\n\n#FrameInGoa #HHGOA2026`;

    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'badge.png', { type: 'image/png' })] })) {
        await navigator.share({
          title: 'Hacker House Goa 2026 Builder Graphic',
          text: rawText,
          files: [new File([blob], 'badge.png', { type: 'image/png' })],
        });
        return;
      }
    } catch (e) {
      console.warn('LinkedIn Web Share fallback', e);
    }

    // Fallback: Trigger download & open LinkedIn Share
    handleDownload();
    const text = encodeURIComponent(rawText);
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://hhgoa.com')}&text=${text}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full flex flex-col items-center mt-6 space-y-3">
      {/* Photo Required Warning Banner */}
      {warningMsg && (
        <div className="w-full bg-[#ff007a] text-white text-xs font-mono-tech py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-[#ffe500] shadow-lg animate-bounce">
          <AlertTriangle className="w-4 h-4 text-[#ffe500]" />
          <span>{warningMsg}</span>
        </div>
      )}

      {/* Success Info Toast for Direct Share */}
      {shared && (
        <div className="w-full bg-[#042616] text-[#ffe500] text-xs font-mono-tech py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-[#148048] shadow-lg">
          <Check className="w-4 h-4 text-[#22c55e]" />
          <span>📸 Badge image copied to clipboard & saved! Press Ctrl+V (Paste) in Twitter to attach.</span>
        </div>
      )}

      <div className="w-full flex flex-col sm:flex-row gap-4">
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
    </div>
  );
}
