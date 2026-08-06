import type { Metadata } from "next";
import { Playfair_Display, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const displayFont = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HH GOA 2026 | Frame & Builder ID Card Generator",
  description: "Generate your official HH Goa 2026 PFP Frame and Builder ID Card. Download & Share to X with #FrameInGoa!",
  keywords: ["HH GOA", "Hacker House Goa 2026", "FrameInGoa", "Builder ID", "Devfolio", "Goa Hackathon"],
  openGraph: {
    title: "HH GOA 2026 | Frame & Builder ID Card Generator",
    description: "Generate your official HH Goa 2026 PFP Frame and Builder ID Card. Download & Share to X with #FrameInGoa!",
    url: "https://hhgoa.com",
    siteName: "Hacker House Goa 2026",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HH GOA 2026 | Frame & Builder ID Card Generator",
    description: "Generate your official HH Goa 2026 graphic and share to X with #FrameInGoa!",
    creator: "@247pmstudio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${monoFont.variable} ${sansFont.variable}`}>
      <body className="antialiased selection:bg-[#ffe500] selection:text-[#042616]">
        {children}
      </body>
    </html>
  );
}
