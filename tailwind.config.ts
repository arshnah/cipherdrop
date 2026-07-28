import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: {
      bg:"#0a0c0b", surf:"#101413", surf2:"#161c1a", line:"#232b28",
      ink:"#eef2f0", muted:"#8a948e", faint:"#545e58",
      accent:"#34d399", warn:"#e0a35a", bad:"#f47171",
    },
    // One radius, and it is sharp. grain's kit says pick one and hold it —
    // terminal runs sharp, paper runs round. This was rounded-xl and
    // rounded-2xl, which is paper, on a project whose entire material is a
    // terminal.
    //
    // Collapsed here rather than edited across every file so the rule holds by
    // itself: a `rounded-2xl` someone reaches for out of habit next month still
    // comes out sharp.
    borderRadius: {
      none: "0", sm: "2px", DEFAULT: "3px", md: "3px",
      lg: "3px", xl: "3px", "2xl": "4px", "3xl": "4px", full: "9999px",
    },
    // JetBrains Mono is the display face here, not just the machine voice.
    // grain's material table has said so all along — "cipherdrop · terminal ·
    // mono, oversized, lowercase" — while the code ran Space Grotesk for
    // everything that was not explicitly font-mono.
    fontFamily: { sans:["var(--font-mono)","ui-monospace","monospace"], mono:["var(--font-mono)","ui-monospace","monospace"] },
  }},
  plugins: [],
} satisfies Config;
