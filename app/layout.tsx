import type { Metadata } from "next";
import { Playfair_Display, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
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
      <head>
        {/* Anti-Inspect & Asset Protection Script */}
        <Script id="anti-inspect-script" strategy="beforeInteractive">
          {`
            // Disable Right-Click Context Menu
            document.addEventListener('contextmenu', function (e) {
              e.preventDefault();
            });

            // Disable Inspect Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S)
            document.addEventListener('keydown', function (e) {
              if (
                e.keyCode === 123 || // F12
                (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
                (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
                (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
                (e.ctrlKey && e.keyCode === 83) || // Ctrl+S
                (e.metaKey && e.altKey && e.keyCode === 73) || // Cmd+Option+I (Mac)
                (e.metaKey && e.altKey && e.keyCode === 74) || // Cmd+Option+J (Mac)
                (e.metaKey && e.keyCode === 85) || // Cmd+U (Mac)
                (e.metaKey && e.keyCode === 83)    // Cmd+S (Mac)
              ) {
                e.preventDefault();
                return false;
              }
            });

            // Disable Image Dragging
            document.addEventListener('dragstart', function (e) {
              if (e.target.tagName === 'IMG' || e.target.tagName === 'SVG' || e.target.tagName === 'CANVAS') {
                e.preventDefault();
              }
            });
          `}
        </Script>
      </head>
      <body className="antialiased selection:bg-[#ffe500] selection:text-[#042616]">
        {children}
      </body>
    </html>
  );
}
