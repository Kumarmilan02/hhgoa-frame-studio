import type { Metadata } from "next";
import { Anton, Teko, Space_Mono, Barlow_Condensed, IBM_Plex_Mono, Poppins, Playfair_Display, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const teko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  weight: "700",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700"],
});

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
    <html lang="en" className={`${anton.variable} ${teko.variable} ${spaceMono.variable} ${barlowCondensed.variable} ${ibmPlexMono.variable} ${poppins.variable} ${displayFont.variable} ${monoFont.variable} ${sansFont.variable}`}>
      <head>
        {/* Anti-Inspect & DevTools Hiding Script */}
        <Script id="anti-inspect-script" strategy="beforeInteractive">
          {`
            // Disable Right-Click Context Menu
            document.addEventListener('contextmenu', function (e) {
              e.preventDefault();
            });

            // Disable Inspect Keyboard Shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S)
            document.addEventListener('keydown', function (e) {
              if (
                e.keyCode === 123 || // F12
                (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || // Ctrl+Shift+I/J/C
                (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
                (e.ctrlKey && e.keyCode === 83) || // Ctrl+S
                (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || // Cmd+Option+I/J/C (Mac)
                (e.metaKey && e.keyCode === 85) || // Cmd+U (Mac)
                (e.metaKey && e.keyCode === 83)    // Cmd+S (Mac)
              ) {
                e.preventDefault();
                return false;
              }
            });

            // Disable Image & Element Dragging
            document.addEventListener('dragstart', function (e) {
              if (e.target.tagName === 'IMG' || e.target.tagName === 'SVG' || e.target.tagName === 'CANVAS') {
                e.preventDefault();
              }
            });

            // Override Console Methods & Auto-Clear Console Logs
            (function () {
              var noop = function () {};
              window.console.log = noop;
              window.console.warn = noop;
              window.console.error = noop;
              window.console.info = noop;
              window.console.debug = noop;
              window.console.dir = noop;
              setInterval(function () {
                console.clear();
              }, 300);
            })();

            // DevTools Detection & Anti-Debugging Protection
            (function () {
              function detectDevTools() {
                var threshold = 160;
                var widthThreshold = window.outerWidth - window.innerWidth > threshold;
                var heightThreshold = window.outerHeight - window.innerHeight > threshold;
                if (widthThreshold || heightThreshold) {
                  console.clear();
                }
              }
              setInterval(detectDevTools, 500);

              // Debugger Trap
              setInterval(function () {
                (function () {
                  return false;
                })['constructor']('debugger')['call']();
              }, 500);
            })();
          `}
        </Script>
      </head>
      <body className="antialiased selection:bg-[#ffe500] selection:text-[#042616]">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
