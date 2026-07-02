import Link from "next/link";
import { Lock, Eye, Github, ArrowUpRight, Plus } from "lucide-react";

const tools = [
  { href: "/cipherdrop", name: "cipherdrop", tag: "encrypted drops", a: "#34d399", Icon: Lock,
    desc: "share a file or a note the server cannot read. it is encrypted here and the key rides in the link, never the wire." },
  { href: "/veil", name: "veil", tag: "steganography", a: "#a78bfa", Icon: Eye,
    desc: "hide an encrypted message inside the pixels of an ordinary image. the picture looks untouched." },
];

export default function Drop() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[860px] px-6">
        <nav className="flex items-center justify-between py-6">
          <span className="font-semibold text-[17px] tracking-tight flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-ink" /> drop
          </span>
          <a href="https://github.com/arshnah" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[13px] text-muted hover:text-ink transition"><Github size={15} /> source</a>
        </nav>

        <header className="pt-16 pb-12">
          <h1 className="text-[clamp(42px,9vw,80px)] font-bold leading-[0.95] tracking-[-0.04em]">drop</h1>
          <p className="mt-6 max-w-[46ch] text-[17px] text-muted leading-[1.6]">a small shelf of privacy tools that run entirely in your browser. no accounts, no server reading your stuff. pick one.</p>
        </header>

        <section className="grid sm:grid-cols-2 gap-4 pb-16">
          {tools.map((t) => (
            <Link key={t.href} href={t.href} style={{ "--a": t.a } as React.CSSProperties}
              className="group relative block rounded-2xl border border-line bg-surf p-6 transition duration-200 hover:-translate-y-1 hover:border-[color:var(--a)]">
              <ArrowUpRight size={18} className="absolute top-5 right-5 text-faint group-hover:text-[color:var(--a)] transition" />
              <span className="inline-grid place-items-center w-11 h-11 rounded-xl mb-5" style={{ background: t.a + "1f", color: t.a }}>
                <t.Icon size={20} />
              </span>
              <div className="text-[19px] font-semibold tracking-tight">{t.name}</div>
              <div className="font-mono text-[12px] mt-0.5" style={{ color: t.a }}>{t.tag}</div>
              <p className="mt-3 text-[13.5px] text-muted leading-[1.55] max-w-[34ch]">{t.desc}</p>
            </Link>
          ))}
          <div className="rounded-2xl border border-dashed border-line p-6 grid place-content-center text-center min-h-[196px]">
            <Plus size={18} className="mx-auto text-faint mb-2" />
            <div className="text-[13.5px] text-faint">more tools soon</div>
            <div className="font-mono text-[11.5px] text-faint mt-1">this shelf keeps growing</div>
          </div>
        </section>

        <footer className="py-9 border-t border-line font-mono text-[12.5px] text-faint flex items-center justify-between">
          <span>made by <a href="https://arshnah.in" className="text-muted hover:text-ink transition">arshdeep singh</a> · one vps, no black boxes</span>
          <span>MIT</span>
        </footer>
      </div>
    </main>
  );
}
