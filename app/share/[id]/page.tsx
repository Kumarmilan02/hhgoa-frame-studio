import { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const headerList = await headers();
  const host = headerList.get('host') || 'hhgoa.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
  const imageUrl = `${baseUrl}/api/share?id=${id}&file=hhgoa-badge.png`;

  return {
    title: 'HH GOA 2026 | Builder Graphic #FrameInGoa',
    description: 'Check out my official HH Goa 2026 graphic! Build, ship, and lock in for October 28-31 in Goa. #FrameInGoa',
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: 'HH GOA 2026 | Builder Graphic',
      description: 'Hacker House Goa 2026 — 500 Elite Builders. Goa, India. #FrameInGoa',
      url: `${baseUrl}/share/${id}`,
      siteName: 'Hacker House Goa 2026',
      images: [
        {
          url: imageUrl,
          width: 1080,
          height: 1350,
          type: 'image/png',
          alt: 'HH Goa 2026 Graphic',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'HH GOA 2026 | Builder Graphic #FrameInGoa',
      description: 'Hacker House Goa 2026 — 500 Elite Builders. Goa, India. #FrameInGoa',
      site: '@247pmstudio',
      creator: '@247pmstudio',
      images: [imageUrl],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const imageUrl = `/api/share?id=${id}`;

  return (
    <main className="min-h-screen bg-[#0a5c36] text-white flex flex-col items-center justify-center p-6 text-center">
      <header className="mb-8">
        <h1 className="font-display text-4xl sm:text-6xl text-[#ffe500] uppercase font-black tracking-tight">
          HACKER HOUSE <span className="text-[#ff007a] font-sans">गोवा</span>
        </h1>
        <p className="font-mono-tech text-[#e5c200] text-sm sm:text-base mt-2 tracking-widest">
          GOA, INDIA · 28 – 31 OCT 2026 · #FrameInGoa
        </p>
      </header>

      <div className="card-hh-emerald p-4 sm:p-6 rounded-2xl max-w-2xl w-full border border-[#148048] shadow-2xl">
        {/* Render Generated Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Generated HH Goa 2026 Graphic"
          className="w-full h-auto rounded-xl border border-[#ffe500]/40 mb-6"
        />

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={imageUrl}
            download="hh-goa-2026-graphic.png"
            className="btn-hh-yellow py-3 px-6 rounded-lg text-sm uppercase flex items-center justify-center gap-2"
          >
            📥 Download Graphic
          </a>
          <Link
            href="/"
            className="py-3 px-6 rounded-lg text-sm font-mono-tech uppercase bg-[#042616] text-[#ffe500] border border-[#148048] hover:bg-[#0b6638] transition"
          >
            ✨ Create Your Own Frame
          </Link>
        </div>
      </div>

      <footer className="mt-12 text-[#e5c200] font-mono-tech text-xs">
        DEVELOPED BY CODINGKOALAS © 2026 HH GOA. ALL RIGHTS RESERVED.
      </footer>
    </main>
  );
}
