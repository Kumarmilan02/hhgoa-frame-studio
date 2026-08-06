'use client';

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';

interface ImageUploaderProps {
  onImageLoaded: (img: HTMLImageElement) => void;
}

export default function ImageUploader({ onImageLoaded }: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file) return;
    setLoading(true);
    setErrorMsg(null);
    setFileName(file.name);

    try {
      let imageFile = file;

      // Handle iPhone HEIC format conversion
      if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/png',
          quality: 0.9,
        });

        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        imageFile = new File([blob], file.name.replace(/\.heic$/i, '.png'), {
          type: 'image/png',
        });
      }

      // Read image via FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            onImageLoaded(img);
            setLoading(false);
          };
          img.onerror = () => {
            setErrorMsg('Failed to decode image file. Try another photo.');
            setLoading(false);
          };
          img.src = result;
        }
      };
      reader.onerror = () => {
        setErrorMsg('Error reading file.');
        setLoading(false);
      };
      reader.readAsDataURL(imageFile);
    } catch (err) {
      console.error('File conversion error:', err);
      setErrorMsg('Could not process this file format. Please upload JPG or PNG.');
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="card-hh-emerald border-2 border-dashed border-[#148048] hover:border-[#ffe500] p-6 rounded-xl text-center cursor-pointer transition-all duration-200 group relative overflow-hidden"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/heic"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="w-8 h-8 text-[#ffe500] animate-spin mb-2" />
            <p className="font-mono-tech text-xs text-[#ffe500] uppercase">Converting & Loading Image...</p>
          </div>
        ) : fileName ? (
          <div className="flex items-center justify-center gap-3 py-2">
            <CheckCircle2 className="w-6 h-6 text-[#ffe500]" />
            <span className="font-mono-tech text-xs text-white truncate max-w-xs">{fileName}</span>
            <span className="text-xs text-[#e5c200] underline font-mono-tech ml-2">(Click to Change)</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-12 h-12 rounded-full bg-[#0a5c36] text-[#ffe500] flex items-center justify-center mb-3 group-hover:scale-110 transition border border-[#148048]">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-mono-tech text-sm text-white font-semibold">
              Drop Your Photo Here or <span className="text-[#ffe500] underline">Browse</span>
            </p>
            <p className="text-xs text-[#e5c200] mt-1 font-mono-tech">
              Supports JPG, PNG, WEBP, and iPhone HEIC photos
            </p>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="mt-2 text-xs font-mono-tech text-[#ff007a] text-center">{errorMsg}</p>
      )}
    </div>
  );
}
