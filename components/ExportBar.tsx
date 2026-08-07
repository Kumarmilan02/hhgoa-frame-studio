'use client';

import React, { useState } from 'react';
import { Download, Share2, Loader2, Check, AlertTriangle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportBarProps {
  getCanvas: () => HTMLCanvasElement | null;
  format: 'formatA' | 'formatB';
  hasPhoto?: boolean;
  onTriggerUpload?: () => void;
}

export default function ExportBar({ getCanvas, format, hasPhoto = false, onTriggerUpload }: ExportBarProps) {
  const [downloading, setDownloading] = useState(false);
  const [sharingX, setSharingX] = useState(false);
  const [sharingLinkedIn, setSharingLinkedIn] = useState(false);
  const [sharedPlatform, setSharedPlatform] = useState<'x' | 'linkedin' | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const triggerWarning = () => {
    setWarningMsg('⚠️ Please upload your photo first to download or share your badge!');
    if (onTriggerUpload) onTriggerUpload();
    setTimeout(() => setWarningMsg(null), 4500);
  };

  // Optimized image payload upload helper with sub-second response
  const prepareShareUrl = async (canvas: HTMLCanvasElement): Promise<string> => {
    try {
      const dataUrl = canvas.toDataURL('image/png', 0.85);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.shareId) {
          return `${window.location.origin}/share/${data.shareId}`;
        }
      }
    } catch (err) {
      console.warn('Fast share upload fallback to root origin:', err);
    }
    return window.location.origin;
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
      setErrorMsg('Failed to download image. Please try again.');
      setTimeout(() => setErrorMsg(null), 4000);
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

    setSharingX(true);
    setErrorMsg(null);

    try {
      const rawText = `🌴 Hacker mode: ON.\n\nJust claimed my official Hacker House Goa 2026 Builder Badge! 🚀\n\ngit checkout goa-2026\ngit commit -m "Ready to build."\ngit push origin hacker-house 🚀\n\nNow it's time to build fast, break less, ship more, and maybe survive on coffee & Feni. 😄\n\nCan't wait to build with amazing hackers and builders from around the world. See you in Goa, Oct 28–31!\n\n#FrameInGoa #HHGOA2026`;

      // 1. Try Web Share API (native share on mobile/supported desktop)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        const pngFile = new File([blob], `hh-goa-2026-${format}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [pngFile] })) {
          try {
            await navigator.share({
              title: 'HH GOA 2026 Builder Graphic',
              text: rawText,
              files: [pngFile],
            });
            setSharedPlatform('x');
            setTimeout(() => setSharedPlatform(null), 4000);
            return;
          } catch (shareErr) {
            console.warn('Native Web Share cancelled or unhandled, using X Intent fallback', shareErr);
          }
        }
      }

      // 2. Fallback to X Tweet Intent (https://x.com/intent/post)
      const shareUrl = await prepareShareUrl(canvas);
      const tweetText = encodeURIComponent(rawText);
      const intentUrl = `https://x.com/intent/post?text=${tweetText}&url=${encodeURIComponent(shareUrl)}`;
      window.open(intentUrl, '_blank', 'noopener,noreferrer');

      setSharedPlatform('x');
      setTimeout(() => setSharedPlatform(null), 4000);
    } catch (err) {
      console.error('X Share Error:', err);
      setErrorMsg('Failed to open X share. Try downloading your image manually.');
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setSharingX(false);
    }
  };

  const handleShareToLinkedIn = async () => {
    if (!hasPhoto) {
      triggerWarning();
      return;
    }

    const canvas = getCanvas();
    if (!canvas) return;

    setSharingLinkedIn(true);
    setErrorMsg(null);

    try {
      const rawText = `🌴 Hacker mode: ON.\n\nJust claimed my official Hacker House Goa 2026 Builder Badge! 🚀\n\ngit checkout goa-2026\ngit commit -m "Ready to build."\ngit push origin hacker-house 🚀\n\nNow it's time to build fast, break less, ship more, and maybe survive on coffee & Feni. 😄\n\nCan't wait to build with amazing hackers and builders from around the world. See you in Goa, Oct 28–31!\n\n#FrameInGoa #HHGOA2026`;

      // 1. Try Web Share API (native share on mobile/supported desktop)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        const pngFile = new File([blob], `hh-goa-2026-${format}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [pngFile] })) {
          try {
            await navigator.share({
              title: 'HH GOA 2026 Builder Graphic',
              text: rawText,
              files: [pngFile],
            });
            setSharedPlatform('linkedin');
            setTimeout(() => setSharedPlatform(null), 4000);
            return;
          } catch (shareErr) {
            console.warn('Native Web Share cancelled or unhandled, using LinkedIn fallback', shareErr);
          }
        }
      }

      // 2. Copy post text to clipboard as convenience for LinkedIn Web fallback
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(rawText);
        } catch (clipErr) {
          console.warn('Clipboard write error:', clipErr);
        }
      }

      // 3. Fallback to LinkedIn Web Share (https://www.linkedin.com/sharing/share-offsite/)
      const shareUrl = await prepareShareUrl(canvas);
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(linkedInUrl, '_blank', 'noopener,noreferrer');

      setSharedPlatform('linkedin');
      setTimeout(() => setSharedPlatform(null), 4000);
    } catch (err) {
      console.error('LinkedIn Share Error:', err);
      setErrorMsg('Failed to open LinkedIn share. Try downloading your image manually.');
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setSharingLinkedIn(false);
    }
  };

  const isAnyProcessing = downloading || sharingX || sharingLinkedIn;

  return (
    <div className="w-full flex flex-col items-center mt-6 space-y-3">
      {/* Photo Required Warning Banner */}
      {warningMsg && (
        <div className="w-full bg-[#ff007a] text-white text-xs font-mono-tech py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-[#ffe500] shadow-lg animate-bounce">
          <AlertTriangle className="w-4 h-4 text-[#ffe500]" />
          <span>{warningMsg}</span>
        </div>
      )}

      {/* Error Message Toast */}
      {errorMsg && (
        <div className="w-full bg-[#4a1503] text-[#ffe500] text-xs font-mono-tech py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-[#ff007a] shadow-lg">
          <AlertCircle className="w-4 h-4 text-[#ff007a]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Info Toast for Direct Share */}
      {sharedPlatform && (
        <div className="w-full bg-[#042616] text-[#ffe500] text-xs font-mono-tech py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-[#148048] shadow-lg">
          <Check className="w-4 h-4 text-[#22c55e]" />
          <span>
            {sharedPlatform === 'x'
              ? '🚀 Shared / Opened X (Twitter)!'
              : '💼 Shared / Opened LinkedIn! Post text copied.'}
          </span>
        </div>
      )}

      <div className="w-full flex flex-col sm:flex-row gap-4">
        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isAnyProcessing}
          className="btn-hh-yellow flex-1 py-4 px-6 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {downloading ? 'Downloading...' : 'Download PNG (High-Res)'}
        </button>

        {/* Share X Button */}
        <button
          onClick={handleShareToX}
          disabled={isAnyProcessing}
          className="flex-1 py-4 px-4 rounded-xl font-mono-tech text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#ff007a] text-white hover:bg-[#e0006b] transition flex items-center justify-center gap-2 cursor-pointer shadow-lg glow-pink disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sharingX ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : sharedPlatform === 'x' ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          {sharingX ? 'Preparing X...' : sharedPlatform === 'x' ? 'Opened X!' : 'Share X (Twitter)'}
        </button>

        {/* Share LinkedIn Button */}
        <button
          type="button"
          onClick={handleShareToLinkedIn}
          disabled={isAnyProcessing}
          className="flex-1 py-4 px-4 rounded-xl font-mono-tech text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#0a66c2] text-white hover:bg-[#084e96] transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sharingLinkedIn ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : sharedPlatform === 'linkedin' ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          {sharingLinkedIn
            ? 'Preparing LinkedIn...'
            : sharedPlatform === 'linkedin'
            ? 'Opened LinkedIn!'
            : 'Share LinkedIn'}
        </button>
      </div>
    </div>
  );
}
