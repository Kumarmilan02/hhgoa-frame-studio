'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, Share2, Loader2, Check, AlertTriangle, AlertCircle, ChevronDown, Video, Image as ImageIcon, FileType } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportBarProps {
  getCanvas: () => HTMLCanvasElement | null;
  format: 'formatA' | 'formatB' | 'formatC';
  hasPhoto?: boolean;
  onTriggerUpload?: () => void;
  onOpen3D?: (autoRecord?: boolean) => void;
}

export default function ExportBar({
  getCanvas,
  format,
  hasPhoto = false,
  onTriggerUpload,
  onOpen3D,
}: ExportBarProps) {
  const [downloading, setDownloading] = useState(false);
  const [sharingX, setSharingX] = useState(false);
  const [sharingLinkedIn, setSharingLinkedIn] = useState(false);
  const [sharedPlatform, setSharedPlatform] = useState<'x' | 'linkedin' | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Download format selection state: 'png' | 'jpg' | 'video'
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'video'>('png');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // 1. Download High-Res PNG
  const handleDownloadPng = () => {
    const canvas = getCanvas();
    if (!canvas) return;

    setDownloading(true);
    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `hh-goa-2026-${format}.png`;
      link.href = dataUrl;
      link.click();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ffe500', '#ff007a', '#0a5c36', '#ffffff'],
      });
    } catch (err) {
      console.error('PNG Download error:', err);
      setErrorMsg('Failed to download PNG image. Please try again.');
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setDownloading(false);
    }
  };

  // 2. Download High-Res JPG
  const handleDownloadJpg = () => {
    const canvas = getCanvas();
    if (!canvas) return;

    setDownloading(true);
    try {
      // Draw onto offscreen canvas with emerald background for JPEG
      const offscreen = document.createElement('canvas');
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0a5c36'; // Primary HH GOA emerald green background
        ctx.fillRect(0, 0, offscreen.width, offscreen.height);
        ctx.drawImage(canvas, 0, 0);

        const dataUrl = offscreen.toDataURL('image/jpeg', 0.95);
        const link = document.createElement('a');
        link.download = `hh-goa-2026-${format}.jpg`;
        link.href = dataUrl;
        link.click();
      }

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ffe500', '#ff007a', '#0a5c36', '#ffffff'],
      });
    } catch (err) {
      console.error('JPG Download error:', err);
      setErrorMsg('Failed to download JPG image. Please try again.');
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setDownloading(false);
    }
  };

  // 3. Trigger 3D Video Spin Player & Recorder
  const handleDownloadVideo = () => {
    if (onOpen3D) {
      onOpen3D(true);
    }
    window.dispatchEvent(new CustomEvent('open-3d-modal', { detail: { autoRecord: true } }));
  };

  // Master Download Trigger Action
  const handleDownloadAction = () => {
    if (!hasPhoto) {
      triggerWarning();
      return;
    }

    if (exportFormat === 'png') {
      handleDownloadPng();
    } else if (exportFormat === 'jpg') {
      handleDownloadJpg();
    } else if (exportFormat === 'video') {
      handleDownloadVideo();
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
      const rawText = `🌴 Hacker mode: ON!\n\nCoffee ☕ + Code 💻 + Goa 🌴\n\nJust created my HH Goa 2026 Builder Badge 🚀\n\nCreate yours 👇\nhttps://hhgoa-frame-studio.vercel.app/\n\n#FrameInGoa #HHGOA2026`;

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
      const rawText = `🌴 Hacker mode: ON!\n\nCoffee ☕ + Code 💻 + Goa 🌴\n\nJust created my HH Goa 2026 Builder Badge 🚀\n\nCreate yours 👇\nhttps://hhgoa-frame-studio.vercel.app/\n\n#FrameInGoa #HHGOA2026`;
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

      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(rawText);
        } catch (clipErr) {
          console.warn('Clipboard write error:', clipErr);
        }
      }

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

      {/* Single Multi-Format Download Button & Share Buttons Row */}
      <div className="w-full flex flex-col sm:flex-row gap-3">
        {/* Multi-Format Download Button with Dropdown */}
        <div ref={dropdownRef} className="relative flex-1 flex items-stretch">
          <button
            type="button"
            onClick={handleDownloadAction}
            disabled={isAnyProcessing}
            className={`btn-hh-yellow flex-1 py-4 px-4 sm:px-6 rounded-l-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${
              exportFormat === 'video' ? 'bg-[#ff007a] text-white border-[#ffe500]' : ''
            }`}
          >
            {downloading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : exportFormat === 'video' ? (
              <Video className="w-5 h-5 text-[#ffe500] animate-bounce" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span>
              {downloading
                ? 'Processing...'
                : exportFormat === 'png'
                ? 'DOWNLOAD PNG (HD)'
                : exportFormat === 'jpg'
                ? 'DOWNLOAD JPG (HD)'
                : 'EXPORT 3D VIDEO 🎬'}
            </span>
          </button>

          {/* Dropdown Toggle Button */}
          <button
            type="button"
            onClick={() => setShowDropdown((prev) => !prev)}
            disabled={isAnyProcessing}
            className="px-3 bg-[#ffe500] text-[#042616] border-l border-[#042616]/30 rounded-r-xl flex items-center justify-center hover:bg-[#fff066] transition cursor-pointer"
            title="Choose download format (PNG, JPG, 3D Video)"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu Popup (Opens UPWARDS so it is never clipped by page bottom) */}
          {showDropdown && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#042616]/98 border-2 border-[#ffe500] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.9)] z-50 p-2 space-y-1 font-mono-tech backdrop-blur-md animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setExportFormat('png');
                  setShowDropdown(false);
                }}
                className={`w-full p-2.5 rounded-lg text-left text-xs font-bold uppercase flex items-center justify-between transition cursor-pointer ${
                  exportFormat === 'png'
                    ? 'bg-[#ffe500] text-[#042616]'
                    : 'text-white hover:bg-[#0a5c36]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#ff007a] shrink-0" />
                  <div>
                    <div className="font-extrabold tracking-wide">PNG Image</div>
                    <div className="text-[9px] opacity-80 font-normal">HD 1080p · Transparent</div>
                  </div>
                </div>
                {exportFormat === 'png' && <Check className="w-4 h-4 text-[#042616] shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setExportFormat('jpg');
                  setShowDropdown(false);
                }}
                className={`w-full p-2.5 rounded-lg text-left text-xs font-bold uppercase flex items-center justify-between transition cursor-pointer ${
                  exportFormat === 'jpg'
                    ? 'bg-[#ffe500] text-[#042616]'
                    : 'text-white hover:bg-[#0a5c36]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileType className="w-4 h-4 text-[#ffe500] shrink-0" />
                  <div>
                    <div className="font-extrabold tracking-wide">JPG Image</div>
                    <div className="text-[9px] opacity-80 font-normal">Compressed · Quick Share</div>
                  </div>
                </div>
                {exportFormat === 'jpg' && <Check className="w-4 h-4 text-[#042616] shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setExportFormat('video');
                  setShowDropdown(false);
                  if (!hasPhoto) {
                    triggerWarning();
                    return;
                  }
                  handleDownloadVideo();
                }}
                className={`w-full p-2.5 rounded-lg text-left text-xs font-bold uppercase flex items-center justify-between transition cursor-pointer ${
                  exportFormat === 'video'
                    ? 'bg-[#ff007a] text-white'
                    : 'text-white hover:bg-[#0a5c36]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#ffe500] shrink-0" />
                  <div>
                    <div className="font-extrabold tracking-wide">3D Spin Video</div>
                    <div className="text-[9px] opacity-90 font-normal">6s 360° HD Video Clip</div>
                  </div>
                </div>
                {exportFormat === 'video' && <Check className="w-4 h-4 text-white shrink-0" />}
              </button>
            </div>
          )}
        </div>

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
