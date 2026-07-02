import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
const sans = Space_Grotesk({ subsets:["latin"], variable:"--font-sans" });
const mono = JetBrains_Mono({ subsets:["latin"], variable:"--font-mono" });
export const metadata: Metadata = {
  title: "drop · privacy tools that run in your browser",
  description: "A small shelf of client-side privacy tools. cipherdrop shares files and text the server cannot read, veil hides encrypted messages inside images. Nothing leaves your device unencrypted.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${sans.variable} ${mono.variable}`}><body className="font-sans">{children}</body></html>;
}
