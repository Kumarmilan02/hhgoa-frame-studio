import { NextResponse } from 'next/server';

// In-memory cache for temporary share images (keyed by short id)
const shareCache = new Map<string, { image: string; createdAt: number }>();

// Cleanup images older than 24 hours
function cleanupCache() {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000;
  for (const [id, item] of shareCache.entries()) {
    if (now - item.createdAt > maxAge) {
      shareCache.delete(id);
    }
  }
}

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
    }

    cleanupCache();

    // Generate unique 8-character ID
    const shareId = Math.random().toString(36).substring(2, 10);
    shareCache.set(shareId, {
      image,
      createdAt: Date.now(),
    });

    return NextResponse.json({ shareId, success: true });
  } catch (err) {
    console.error('Share creation error:', err);
    return NextResponse.json({ error: 'Failed to process share request' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id || !shareCache.has(id)) {
    return new NextResponse('Image not found', { status: 404 });
  }

  const { image } = shareCache.get(id)!;
  // Convert base64 data URI to binary buffer
  const base64Data = image.replace(/^data:image\/(png|jpeg|webp);base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
}
