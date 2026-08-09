'use client';

import React, { useEffect, useState } from 'react';
import { Download, WifiOff, Smartphone, X, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. Service Worker Registration (Enabled on localhost & production)
    if ('serviceWorker' in navigator) {
      if (document.readyState === 'complete') {
        navigator.serviceWorker.register('/sw.js').then(
          (reg) => console.log('[PWA] SW registered successfully:', reg.scope),
          (err) => console.log('[PWA] SW registration failed:', err)
        );
      } else {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').then(
            (reg) => console.log('[PWA] SW registered successfully:', reg.scope),
            (err) => console.log('[PWA] SW registration failed:', err)
          );
        });
      }
    }

    // 2. Check if already running in standalone mode (installed as PWA)
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsStandalone(true);
    }

    // 3. Listen for PWA BeforeInstallPrompt Event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 4. Online/Offline Status Listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User response to install prompt:', outcome);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  return (
    <>
      {/* Offline Status Badge (Visible when user is offline at beach without Wi-Fi) */}
      {isOffline && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-[#ff007a] text-white px-4 py-1.5 rounded-full font-mono-tech text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-2xl animate-pulse">
          <WifiOff className="w-4 h-4 text-[#ffe500]" />
          <span>⚡ OFFLINE MODE ACTIVE · APP WORKS 100% OFF-GRID</span>
        </div>
      )}

      {/* Floating PWA Installation Banner */}
      {showPrompt && !isStandalone && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-gradient-to-r from-[#042616] to-[#0a5c36] border-2 border-[#ffe500] p-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-bounce-short">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#042616] border border-[#ff007a] flex items-center justify-center text-2xl shadow-inner">
                📱
              </div>
              <div>
                <h4 className="font-mono-tech text-sm text-[#ffe500] font-black uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff007a]" /> INSTALL HHGOA 2026 APP
                </h4>
                <p className="text-xs font-mono-tech text-[#e5c200] leading-tight mt-0.5">
                  Install on phone to generate 2D/3D badges offline on the beach!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPrompt(false)}
              className="text-[#e5c200] hover:text-white p-1 rounded-lg hover:bg-black/20 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3 rounded-xl bg-[#ffe500] hover:bg-[#fff066] text-[#042616] font-mono-tech text-xs font-black uppercase flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Install Mobile App</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPrompt(false)}
              className="py-2 px-3 rounded-xl bg-[#042616] hover:bg-[#0a5c36] text-[#e5c200] border border-[#ffe500]/40 font-mono-tech text-xs font-bold uppercase transition cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>
      )}
    </>
  );
}
