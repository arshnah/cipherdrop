import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: {
      bg:"#0a0c0b", surf:"#101413", surf2:"#161c1a", line:"#232b28",
      ink:"#eef2f0", muted:"#8a948e", faint:"#545e58",
      accent:"#34d399", warn:"#e0a35a", bad:"#f47171",
    },
    fontFamily: { sans:["var(--font-sans)","system-ui","sans-serif"], mono:["var(--font-mono)","monospace"] },
  }},
  plugins: [],
} satisfies Config;
