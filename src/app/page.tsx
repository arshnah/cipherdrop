import Create from "@/components/Create";
import { Github } from "lucide-react";

const spec: [string, string][] = [
  ["cipher", "AES-GCM 256"],
  ["key", "in the URL #fragment"],
  ["server", "ciphertext only"],
  ["expiry", "1h · 1d · 7d"],
  ["burn", "delete on first read"],
  ["max", "100 MB"],
];

const why: [string, string][] = [
  ["the key never leaves", "it is generated on this device and lives after the # in the link, which browsers never send to a server."],
  ["the server holds gibberish", "only ciphertext ever lands on disk. if it leaked tomorrow there would be nothing readable on it."],
  ["gone when you want", "set an expiry or burn on the first read. expired drops get swept off disk, not just hidden."],
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1060px] px-6">
        <nav className="flex items-center justify-between py-6">
          <span className="font-mono font-semibold text-[15px] tracking-tight flex items-center gap-2.5">
            <span className="w-3 h-3 bg-accent" /> cipherdrop
          </span>
          <a href="https://github.com/arshnah/cipherdrop" target="_blank" rel="noopener noreferrer" className="font-mono flex items-center gap-1.5 text-[13px] text-muted hover:text-ink transition"><Github size={15} /> source</a>
        </nav>

        <header className="pt-14 pb-10 grid lg:grid-cols-[1fr_300px] gap-x-12 gap-y-9 items-end">
          <div>
            <div className="font-mono text-[12.5px] text-faint mb-6">
              <span className="text-accent">cipherdrop</span> ~ $ share --encrypt --burn
            </div>
            <h1 className="font-mono font-bold lowercase text-[clamp(30px,5.4vw,52px)] leading-[1.05] tracking-[-0.02em]">
              send a file or note<br className="hidden sm:block" /> the server cannot read<span className="cursor" />
            </h1>
            <p className="mt-6 max-w-[50ch] text-[16.5px] text-muted leading-[1.6]">
              it is encrypted in your browser before it leaves. the key rides in the link fragment, which never reaches the server, so all it ever stores is scrambled bytes it cannot read.
            </p>
          </div>
          <div className="font-mono text-[12.5px] border border-line rounded-lg divide-y divide-line overflow-hidden">
            {spec.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between px-3.5 py-2 bg-surf/40">
                <span className="text-faint">{k}</span>
                <span className="text-ink">{v}</span>
              </div>
            ))}
          </div>
        </header>

        <section className="pb-16">
          <div className="rounded-t-lg border border-b-0 border-line bg-surf2/40 flex items-center gap-2 px-4 py-2.5">
            <span className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-bad/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-warn/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-accent/70" />
            </span>
            <span className="font-mono text-[12px] text-faint ml-1.5">~/cipherdrop</span>
            <span className="ml-auto font-mono text-[11.5px] text-faint hidden sm:block">encrypt → link → decrypt</span>
          </div>
          <Create />
          <p className="mt-3 font-mono text-[12px] text-faint">the key lives after the # in your link and is generated on this device, never sent.</p>
        </section>

        <section className="pb-16 border-t border-line pt-11">
          <div className="font-mono text-[12.5px] text-faint mb-7">$ why cipherdrop</div>
          <div className="space-y-5 max-w-[680px]">
            {why.map(([t, d]) => (
              <div key={t} className="flex flex-col sm:flex-row sm:gap-5">
                <div className="font-mono text-[13.5px] text-accent shrink-0 sm:w-[210px]">{"> "}{t}</div>
                <p className="text-[13.5px] text-muted leading-[1.55]">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="py-9 border-t border-line font-mono text-[12.5px] text-faint flex items-center justify-between">
          <span>made by <a href="https://arshnah.vercel.app" className="text-muted hover:text-ink transition">arshdeep singh</a></span>
          <span>MIT</span>
        </footer>
      </div>
    </main>
  );
}
