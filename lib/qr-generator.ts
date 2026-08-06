import QRCode from 'qrcode';

let qrCanvasCache: HTMLCanvasElement | null = null;

/**
 * Generates an HTMLCanvasElement containing the QR code for https://hhgoa.com
 */
export async function getEventQRCodeCanvas(url = 'https://hhgoa.com'): Promise<HTMLCanvasElement> {
  if (qrCanvasCache) return qrCanvasCache;

  const canvas = document.createElement('canvas');
  canvas.width = 180;
  canvas.height = 180;

  await QRCode.toCanvas(canvas, url, {
    margin: 1,
    scale: 6,
    color: {
      dark: '#042616',
      light: '#FFE500',
    },
  });

  qrCanvasCache = canvas;
  return canvas;
}
