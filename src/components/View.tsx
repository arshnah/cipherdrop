"use client";
import { useEffect, useRef, useState } from "react";
import { Copy, Check, Download, Loader2, ShieldAlert, Shield, Flame, ArrowLeft } from "lucide-react";
import { importKey, open, unpack, type Meta } from "@/lib/crypto";

type State =
  | { s: "loading" }
  | { s: "text"; text: string; html?: string; burned: boolean }
  | { s: "file"; meta: Meta; url: string; size: number; burned: boolean }
  | { s: "error"; kind: "nokey" | "notfound" | "gone" | "badkey" };

export default function View({ id }: { id: string }) {
  const [st, setSt] = useState<State>({ s: "loading" });
  const [copied, setCopied] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      const raw = location.hash.slice(1);
      if (!raw) return setSt({ s: "error", kind: "nokey" });
      let key: CryptoKey;
      try {
        key = await importKey(raw);
      } catch {
        return setSt({ s: "error", kind: "badkey" });
      }
      const res = await fetch(`/api/drops/${id}`, { cache: "no-store" });
      if (res.status === 404) return setSt({ s: "error", kind: "notfound" });
      if (res.status === 410) return setSt({ s: "error", kind: "gone" });
      if (!res.ok) return setSt({ s: "error", kind: "notfound" });
      const burned = res.headers.get("x-burned") === "1";
      const blob = new Uint8Array(await res.arrayBuffer());
      try {
        const { meta, data } = unpack(await open(key, blob));
        if (meta.kind === "text") {
          const text = new TextDecoder().decode(data);
          if (meta.lang) {
            const { highlight } = await import("@/lib/highlight");
            setSt({ s: "text", text, html: highlight(text).html, burned });
          } else {
            setSt({ s: "text", text, burned });
          }
        } else {
          const url = URL.createObjectURL(new Blob([data as BlobPart], { type: meta.mime || "application/octet-stream" }));
          setSt({ s: "file", meta, url, size: data.length, burned });
        }
      } catch {
        setSt({ s: "error", kind: "badkey" });
      }
    })();
  }, [id]);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  if (st.s === "loading") {
    return <Shell><div className="grid place-items-center h-44 text-muted"><Loader2 size={22} className="animate-spin" /></div></Shell>;
  }

  if (st.s === "error") {
    const map = {
      nokey: { t: "no key in this link", d: "the part after the # is missing, so there is nothing to decrypt with. you probably got a link that was cut short." },
      badkey: { t: "this key does not fit", d: "the link decrypts to nothing. it may be corrupted, or it was tampered with in transit." },
      notfound: { t: "nothing here", d: "no drop with this id. it may never have existed, or it already expired and was swept." },
      gone: { t: "this drop expired", d: "its time was up, so the server deleted it. ask the sender for a fresh one." },
    }[st.kind];
    return (
      <Shell>
        <div className="text-center py-8">
          <ShieldAlert size={26} className="mx-auto text-bad mb-4" />
          <h2 className="text-[17px] font-semibold">{map.t}</h2>
          <p className="mt-2 max-w-[42ch] mx-auto text-[13.5px] text-muted leading-[1.55]">{map.d}</p>
          <a href="/cipherdrop" className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] text-accent hover:brightness-110 transition"><ArrowLeft size={15} /> make your own drop</a>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {st.burned && (
        <div className="flex items-center gap-2 text-[12.5px] font-mono text-warn mb-4">
          <Flame size={14} /> this was burn-after-read. it is gone from the server now.
        </div>
      )}
      {st.s === "text" ? (
        <>
          {st.html ? (
            <CodeBlock html={st.html} text={st.text} />
          ) : (
            <div className="bg-bg border border-line rounded-xl px-4 py-3.5 font-mono text-[13.5px] leading-[1.6] text-ink whitespace-pre-wrap break-words max-h-[60vh] overflow-auto">
              {st.text}
            </div>
          )}
          <div className="mt-4 flex items-center gap-3">
            <button onClick={() => copy(st.text)} className="flex items-center gap-2 bg-accent text-bg font-medium text-[13.5px] px-4 py-2 rounded-lg hover:brightness-110 transition">
              {copied ? <><Check size={15} /> copied</> : <><Copy size={15} /> copy</>}
            </button>
            <a href="/cipherdrop" className="ml-auto text-[13px] text-muted hover:text-ink transition">make your own</a>
          </div>
        </>
      ) : (
        <div className="text-center py-6">
          <Download size={24} className="mx-auto text-accent mb-4" />
          <div className="text-[15px] text-ink font-medium break-all">{st.meta.name}</div>
          <div className="text-[12.5px] text-faint font-mono mt-1">{fmt(st.size)}</div>
          <a href={st.url} download={st.meta.name} className="mt-5 inline-flex items-center gap-2 bg-accent text-bg font-medium text-[13.5px] px-5 py-2.5 rounded-xl hover:brightness-110 transition">
            <Download size={16} /> download
          </a>
          <div className="mt-5"><a href="/cipherdrop" className="text-[13px] text-muted hover:text-ink transition">make your own</a></div>
        </div>
      )}
    </Shell>
  );
}

function CodeBlock({ html, text }: { html: string; text: string }) {
  const gutter = text.replace(/\n$/, "").split("\n").map((_, i) => i + 1).join("\n");
  return (
    <div className="bg-bg border border-line rounded-xl overflow-auto max-h-[60vh]">
      <div className="flex min-w-max text-[13px] leading-[1.6] font-mono">
        <div className="sticky left-0 shrink-0 select-none text-right bg-bg text-faint py-3.5 pl-4 pr-3 border-r border-line whitespace-pre">{gutter}</div>
        <pre className="hljs bg-transparent py-3.5 px-4 whitespace-pre"><code dangerouslySetInnerHTML={{ __html: html }} /></pre>
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen">
      <div className="max-w-[720px] mx-auto px-6">
        <nav className="py-6">
          <a href="/cipherdrop" className="font-bold text-[18px] tracking-tight flex items-center gap-2 w-fit">
            <span className="w-6 h-6 rounded-md bg-accent/20 grid place-items-center"><Shield size={13} className="text-accent" /></span>
            cipherdrop
          </a>
        </nav>
        <div className="pt-8 rounded-[18px]">
          <div className="rounded-[18px] border border-line bg-surf p-6">{children}</div>
          <p className="text-center text-faint text-[12.5px] mt-4 font-mono">decrypted in your browser. the server only ever sent ciphertext.</p>
        </div>
      </div>
    </main>
  );
}

function fmt(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
