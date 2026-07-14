import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: "variable",
  style: "normal",
  variable: "--font-space-grotesk",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "variable",
  style: "normal",
  variable: "--font-jetbrains-mono",
  display: "swap",
  fallback: ["ui-monospace", "Menlo", "Monaco", "Consolas", "monospace"],
});

const tsangerJinKai = localFont({
  src: "./fonts/TsangerJinKai02-W03-web.woff2",
  variable: "--font-tsanger-jinkai",
  weight: "400",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  fallback: [
    "Songti SC",
    "Noto Serif CJK SC",
    "Source Han Serif SC",
    "STSong",
    "SimSun",
  ],
});

export const metadata: Metadata = {
  title: "suzilu",
  description:
    "just a developer figuring things out, one commit at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} ${tsangerJinKai.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
