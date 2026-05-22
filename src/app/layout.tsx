import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
