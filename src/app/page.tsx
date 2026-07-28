import Link from "next/link";

// Two tools, one accent. The old version gave each its own colour, which is how
// a shelf of two things starts reading as a dashboard — see grain.md rule 6.
const tools = [
  {
    href: "/cipherdrop",
    name: "cipherdrop",
    tag: "encrypted drops",
    desc: "share a file or a note the server cannot read. it is encrypted in your browser and the key rides in the link, never over the wire.",
    facts: "AES-GCM · key in the URL fragment · burn after read · 100 MB",
  },
  {
    href: "/veil",
    name: "veil",
    tag: "steganography",
    desc: "hide an encrypted message inside the pixels of an ordinary image. the picture comes out looking untouched.",
    facts: "LSB · PBKDF2 · PNG out",
  },
];

export default function Drop() {
  return (
    <main className="mx-auto max-w-[46em] px-5 py-10">
      <nav className="flex items-baseline justify-between font-mono text-[12.5px] text-faint">
        <span>drop.arshnah.in</span>
        <a href="https://github.com/arshnah/cipherdrop" target="_blank" rel="noopener noreferrer" className="hover:text-ink transition">
          source ↗
        </a>
      </nav>

      {/* The prompt IS the header. cipherdrop's material is a terminal, and the
          cursor is the one flourish it gets — grain allows exactly one. */}
      <header className="pt-14 pb-2">
        <h1 className="font-mono text-[clamp(30px,7vw,44px)] leading-none tracking-tight">
          <span className="text-faint">~/</span>
          <span className="text-ink">drop</span>
          <span className="cursor align-baseline" />
        </h1>
        <p className="mt-5 text-[16.5px] leading-[1.65] text-muted">
          privacy tools that run entirely in your browser. no accounts, nothing to sign up for, and no server
          that can read what you put in. two of them so far.
        </p>
      </header>

      <hr className="my-9 border-0 border-t border-line" />

      {/* A left rail, not a card. No box, no hover lift, no icon in a tinted
          square — the same shape the portfolio lists its work in. */}
      <div>
        {tools.map((t) => (
          <div key={t.href} className="mb-7 border-l-2 border-accent pl-4">
            <div className="flex flex-wrap items-baseline gap-x-2.5">
              <Link href={t.href} className="text-[18px] font-semibold tracking-tight text-ink hover:text-accent transition">
                {t.name}
              </Link>
              <span className="font-mono text-[12.5px] text-faint">{t.tag} →</span>
            </div>
            <p className="mt-1 text-[15px] leading-[1.6] text-muted">{t.desc}</p>
            <p className="mt-1.5 font-mono text-[12px] text-faint">{t.facts}</p>
          </div>
        ))}
      </div>

      {/* What used to be a dashed "more tools soon" tile holding a grid cell
          open. One honest line says the same thing and takes no space it has
          not earned. */}
      <p className="text-[14px] text-faint">
        more when there is something worth putting here.
      </p>

      <hr className="my-9 border-0 border-t border-line" />

      <footer className="flex flex-wrap items-baseline justify-between gap-2 font-mono text-[12px] text-faint">
        <span>
          by{" "}
          <a href="https://arshnah.in" className="text-muted hover:text-ink transition">
            arshdeep singh
          </a>{" "}
          · one vps, no black boxes
        </span>
        <span>MIT</span>
      </footer>
    </main>
  );
}
