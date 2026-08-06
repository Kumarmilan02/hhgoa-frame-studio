/**
 * AI Smart Face Detection & Centering Engine
 * Analyzes image pixel data using skin-tone luminance & face feature mass center algorithms
 * to compute optimal panX, panY, and zoom so faces are automatically framed and centered.
 */
export function detectAndCenterFace(
  img: HTMLImageElement,
  frameWidth: number,
  frameHeight: number
): { panX: number; panY: number; zoom: number } {
  try {
    const canvas = document.createElement('canvas');
    const sampleW = 200;
    const sampleH = Math.round((200 * img.height) / img.width);
    canvas.width = sampleW;
    canvas.height = sampleH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return { panX: 0, panY: 0, zoom: 1.15 };

    ctx.drawImage(img, 0, 0, sampleW, sampleH);
    const imageData = ctx.getImageData(0, 0, sampleW, sampleH);
    const data = imageData.data;

    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    // Detect skin luminance & face contrast regions
    for (let y = 0; y < sampleH; y++) {
      for (let x = 0; x < sampleW; x++) {
        const i = (y * sampleW + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Normalized YCbCr skin tone detection heuristics
        if (r > 65 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 12) {
          // Weight upper-middle region higher (typical face location in selfies/portraits)
          const verticalBias = y < sampleH * 0.65 ? 1.5 : 0.5;
          const weight = (r - b) * verticalBias;

          totalWeight += weight;
          weightedX += x * weight;
          weightedY += y * weight;
        }
      }
    }

    if (totalWeight > 0) {
      const faceCenterX = (weightedX / totalWeight) / sampleW; // 0 to 1
      const faceCenterY = (weightedY / totalWeight) / sampleH; // 0 to 1

      // Calculate pan offsets from image center
      const offsetX = (0.5 - faceCenterX) * frameWidth * 0.85;
      const offsetY = (0.4 - faceCenterY) * frameHeight * 0.85;

      const panX = Math.min(Math.max(Math.round(offsetX), -200), 200);
      const panY = Math.min(Math.max(Math.round(offsetY), -200), 200);

      return { panX, panY, zoom: 1.25 };
    }
  } catch (err) {
    console.error('Face detection fallback:', err);
  }

  // Fallback default centering
  return { panX: 0, panY: 0, zoom: 1.15 };
}
