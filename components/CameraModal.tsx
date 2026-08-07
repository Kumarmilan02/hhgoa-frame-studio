'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (image: HTMLImageElement) => void;
}

export default function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access webcam. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally for selfie mirror effect
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);

    const dataUrl = canvas.toDataURL('image/png');
    const img = new Image();
    img.onload = () => {
      onCapture(img);
      stopCamera();
      onClose();
    };
    img.src = dataUrl;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#042616] border-2 border-[#ffe500] rounded-2xl p-5 max-w-lg w-full shadow-2xl relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#148048] pb-3">
          <h3 className="font-mono-tech text-sm text-[#ffe500] uppercase font-bold flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#ff007a]" /> 📷 Snap Live Selfie
          </h3>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-gray-400 hover:text-white transition cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Preview */}
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-[#148048] flex items-center justify-center">
          {error ? (
            <div className="text-center p-4 text-red-400 font-mono-tech text-xs">
              {error}
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Controls */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={startCamera}
            className="py-2 px-4 bg-[#0b6638] hover:bg-[#148048] text-white rounded-lg font-mono-tech text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restart
          </button>

          <button
            type="button"
            onClick={handleCapture}
            disabled={!!error}
            className="flex-1 py-2.5 bg-[#ffe500] hover:bg-[#e5c200] text-[#042616] rounded-lg font-mono-tech text-xs font-bold uppercase transition flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
          >
            <Camera className="w-4 h-4" /> 📸 Capture Snapshot
          </button>
        </div>
      </div>
    </div>
  );
}
