import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
const sans = Space_Grotesk({ subsets:["latin"], variable:"--font-sans" });
const mono = JetBrains_Mono({ subsets:["latin"], variable:"--font-mono" });
export const metadata: Metadata = {
  title: "cipherdrop · zero-knowledge file & text drops",
  description: "Share files and text that the server cannot read. Everything is encrypted in your browser and the key stays in the link fragment, so it never touches the wire.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${sans.variable} ${mono.variable}`}><body className="font-sans">{children}</body></html>;
}
