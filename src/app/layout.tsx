import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
// One face. Space Grotesk was loaded as --font-sans and used for every line
// that was not explicitly font-mono, which is a second display face on a
// project the design notes describe as "mono, oversized, lowercase". Dropping
// it is also one less font to fetch.
const mono = JetBrains_Mono({ subsets:["latin"], variable:"--font-mono" });
export const metadata: Metadata = {
  title: "drop · privacy tools that run in your browser",
  description: "A small shelf of client-side privacy tools. cipherdrop shares files and text the server cannot read, veil hides encrypted messages inside images. Nothing leaves your device unencrypted.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={mono.variable}><body className="font-mono">{children}</body></html>;
}
