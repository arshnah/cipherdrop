import Create from "@/components/Create";
import { Shield, Github, KeyRound, ServerOff, Timer } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="max-w-[840px] mx-auto px-6">
        <nav className="flex items-center justify-between py-6">
          <span className="font-bold text-[18px] tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-accent/20 grid place-items-center"><Shield size={13} className="text-accent" /></span>
            cipherdrop
          </span>
          <a href="https://github.com/arshnah" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[13.5px] text-muted hover:text-ink transition"><Github size={16} /> source</a>
        </nav>

        <header className="pt-[54px] pb-[42px] text-center">
          <div className="inline-flex items-center gap-2 text-[12px] font-mono text-accent border border-accent/30 rounded-full px-3 py-1 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" /> zero-knowledge · self-hosted
          </div>
          <h1 className="text-[clamp(32px,6vw,54px)] font-bold leading-[1.05] tracking-[-0.03em] max-w-[18ch] mx-auto">
            Send a file or a note the server cannot read.
          </h1>
          <p className="mt-6 max-w-[54ch] mx-auto text-[17px] text-muted leading-[1.6]">
            Everything is encrypted in your browser before it leaves. The key stays in the link fragment, which never reaches the server, so all it ever stores is scrambled bytes it cannot read.
          </p>
        </header>

        <section className="pb-[36px]">
          <Create />
          <p className="text-center text-faint text-[12.5px] mt-4 font-mono">
            AES-GCM 256. the key lives after the # in your link and is generated on this device.
          </p>
        </section>

        <section className="py-[56px] grid sm:grid-cols-3 gap-4">
          {[
            { icon: KeyRound, t: "The key never leaves", d: "It is generated here and lives in the part of the link after the #, which browsers never send to a server." },
            { icon: ServerOff, t: "The server holds gibberish", d: "It only ever receives ciphertext. If the disk leaked tomorrow, there would be nothing readable on it." },
            { icon: Timer, t: "Gone when you want", d: "Pick an expiry, or burn after the first read. Expired drops are swept off disk, not just hidden." },
          ].map((f, i) => (
            <div key={i} className="p-5 rounded-[14px] border border-line bg-surf">
              <f.icon size={18} className="text-accent mb-3" />
              <h3 className="text-[15px] font-semibold">{f.t}</h3>
              <p className="mt-1.5 text-[13.5px] text-muted leading-[1.55]">{f.d}</p>
            </div>
          ))}
        </section>

        <footer className="py-10 border-t border-line text-center text-[13px] text-faint">
          made by <a href="https://arshnah.vercel.app" className="text-muted hover:text-ink transition">Arshdeep Singh</a> · MIT · pull requests welcome
        </footer>
      </div>
    </main>
  );
}
