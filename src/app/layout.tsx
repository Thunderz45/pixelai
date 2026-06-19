import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PixelAI - Create Stunning AI Images in Seconds",
  description: "PixelAI is a lightweight, startup-inspired web app that generates high-quality AI images instantly from simple text prompts. Start with 5 free credits today.",
  keywords: ["AI Image Generator", "Text to Image AI", "PixelAI Generator", "Next.js AI App", "Fast AI Art"],
  authors: [{ name: "PixelAI Inc." }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased bg-slate-50`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
