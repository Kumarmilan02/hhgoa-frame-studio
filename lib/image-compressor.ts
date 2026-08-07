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
    const objectUrl = URL.createObjectURL(imageFile);
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';

    tempImg.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_DIM = 1920;
      let w = tempImg.width;
      let h = tempImg.height;

      // If photo is already within normal resolution, resolve instantly (0ms delay!)
      if (w <= MAX_DIM && h <= MAX_DIM) {
        resolve(tempImg);
        return;
      }

      // Fast downscale offscreen canvas for huge high-res phone photos
      if (w > h) {
        h = Math.round((h * MAX_DIM) / w);
        w = MAX_DIM;
      } else {
        w = Math.round((w * MAX_DIM) / h);
        h = MAX_DIM;
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
      ctx.imageSmoothingQuality = 'medium';
      ctx.drawImage(tempImg, 0, 0, w, h);

      const compressedImg = new Image();
      compressedImg.crossOrigin = 'anonymous';
      compressedImg.onload = () => resolve(compressedImg);
      compressedImg.onerror = () => resolve(tempImg);
      compressedImg.src = offscreenCanvas.toDataURL('image/jpeg', 0.9);
    };

    tempImg.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    tempImg.src = objectUrl;
  });
}
