/**
 * Fast client-side image downscaling & compression.
 * Downscales large phone camera photos (e.g. 6000x4000) to max 1920px
 * to ensure instant rendering (< 1s) and smooth client-side canvas performance.
 */
export async function compressAndProcessImage(file: File): Promise<HTMLImageElement> {
  let imageFile = file;

  // Handle iPhone HEIC format conversion if needed
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

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        reject(new Error('Failed to read image source'));
        return;
      }

      const tempImg = new Image();
      tempImg.crossOrigin = 'anonymous';
      tempImg.onload = () => {
        const MAX_DIM = 1920;
        let w = tempImg.width;
        let h = tempImg.height;

        // If photo is huge (e.g. 6000x4000), downscale offscreen
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          } else {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = w;
        offscreenCanvas.height = h;
        const ctx = offscreenCanvas.getContext('2d');

        if (!ctx) {
          resolve(tempImg);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(tempImg, 0, 0, w, h);

        const compressedImg = new Image();
        compressedImg.crossOrigin = 'anonymous';
        compressedImg.onload = () => resolve(compressedImg);
        compressedImg.onerror = () => resolve(tempImg);
        compressedImg.src = offscreenCanvas.toDataURL('image/jpeg', 0.92);
      };
      tempImg.onerror = (err) => reject(err);
      tempImg.src = src;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(imageFile);
  });
}
