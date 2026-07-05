"use client";
import { useRef, useState } from "react";
import { FileUp, Type, Link2, Copy, Check, Loader2, Flame, X, Code } from "lucide-react";
import { makeKey, exportKey, wrapKeyWithPass, pack, seal, type Meta } from "@/lib/crypto";

const MAX = 100 * 1024 * 1024;
type Tab = "text" | "file";

export default function Create() {
  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [ttl, setTtl] = useState("1d");
  const [burn, setBurn] = useState(false);
  const [pass, setPass] = useState("");
  const [code, setCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState("");
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const ready = tab === "text" ? text.trim().length > 0 : !!file;

  async function submit() {
    setErr("");
    if (!ready || busy) return;
    setBusy(true);
    try {
      let meta: Meta;
      let data: Uint8Array;
      if (tab === "text") {
        meta = code ? { kind: "text", lang: "auto" } : { kind: "text" };
        data = new TextEncoder().encode(text);
      } else {
        if (file!.size > MAX) throw new Error("that file is over the 100 MB limit");
        meta = { kind: "file", name: file!.name, mime: file!.type || "application/octet-stream" };
        data = new Uint8Array(await file!.arrayBuffer());
      }
      const key = await makeKey();
      const blob = await seal(key, pack(meta, data));
      const res = await fetch(`/api/drops?ttl=${ttl}&burn=${burn ? 1 : 0}`, {
        method: "POST",
        headers: { "content-type": "application/octet-stream" },
        body: blob,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error === "too_big" ? "that file is too large" : "upload failed, try again");
      }
      const { id } = await res.json();
      const k = pass.trim() ? await wrapKeyWithPass(key, pass.trim()) : await exportKey(key);
      setLink(`${location.origin}/d/${id}#${k}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function reset() {
    setLink(""); setText(""); setFile(null); setErr(""); setCopied(false); setPass("");
    if (fileRef.current) fileRef.current.value = "";
  }

  if (link) {
    return (
      <div className="rounded-b-lg border border-t-0 border-line bg-surf p-6">
        <div className="flex items-center gap-2 text-accent text-[13px] font-mono mb-4">
          <Link2 size={15} /> your link is ready
        </div>
        <div className="flex items-stretch gap-2">
          <div className="flex-1 min-w-0 bg-bg border border-line rounded-lg px-3.5 py-3 font-mono text-[13px] text-ink overflow-x-auto whitespace-nowrap">
            {link}
          </div>
          <button onClick={copy} className="shrink-0 grid place-items-center w-12 rounded-lg bg-accent text-bg hover:brightness-110 transition">
            {copied ? <Check size={17} /> : <Copy size={17} />}
          </button>
        </div>
        <p className="mt-4 text-[13px] text-muted leading-[1.55]">
          the part after <span className="font-mono text-ink">#</span> is the key. it never reached the server, so keep the whole link together. {burn ? "anyone with the link can open it once, then it is gone." : "anyone with the link can open it until it expires."}
          {pass.trim() && " they will also need the passphrase you set — send it separately."}
        </p>
        <div className="mt-5 flex items-center gap-3 text-[13px]">
          <span className="text-faint font-mono">expires in {ttl}{burn ? " · burns on open" : ""}</span>
          <button onClick={reset} className="ml-auto text-muted hover:text-ink transition">make another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-b-lg border border-t-0 border-line bg-surf p-6">
      <div className="flex gap-1 mb-5 p-1 bg-bg rounded-xl w-fit">
        <button onClick={() => setTab("text")} className={`flex items-center gap-1.5 text-[13.5px] px-3.5 py-1.5 rounded-lg transition ${tab === "text" ? "bg-surf2 text-ink" : "text-muted hover:text-ink"}`}>
          <Type size={14} /> text
        </button>
        <button onClick={() => setTab("file")} className={`flex items-center gap-1.5 text-[13.5px] px-3.5 py-1.5 rounded-lg transition ${tab === "file" ? "bg-surf2 text-ink" : "text-muted hover:text-ink"}`}>
          <FileUp size={14} /> file
        </button>
      </div>

      {tab === "text" ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={code ? "paste code, it gets highlighted when someone opens it" : "paste a secret, a note, a token, anything"}
          className="w-full h-44 resize-none bg-bg border border-line rounded-xl px-4 py-3.5 text-[14px] leading-[1.6] text-ink placeholder:text-faint outline-none focus:border-accent/50 transition font-mono"
        />
      ) : file ? (
        <div className="h-44 bg-bg border border-line rounded-xl grid place-items-center">
          <div className="text-center px-4">
            <div className="text-[14px] text-ink font-medium break-all">{file.name}</div>
            <div className="text-[12.5px] text-faint font-mono mt-1">{fmt(file.size)}</div>
            <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }} className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-muted hover:text-ink transition">
              <X size={13} /> remove
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => fileRef.current?.click()} className="w-full h-44 bg-bg border border-dashed border-line rounded-xl grid place-items-center hover:border-accent/50 transition group">
          <div className="text-center">
            <FileUp size={22} className="mx-auto text-faint group-hover:text-accent transition" />
            <div className="mt-2 text-[13.5px] text-muted">click to pick a file</div>
            <div className="text-[12px] text-faint font-mono mt-0.5">up to 100 MB</div>
          </div>
        </button>
      )}
      <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

      <input
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        placeholder="passphrase (optional, adds a second lock)"
        className="mt-4 w-full bg-bg border border-line rounded-xl px-4 py-2.5 text-[13.5px] text-ink placeholder:text-faint outline-none focus:border-accent/50 transition font-mono"
      />

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-[13px] text-muted">
          expires
          <select value={ttl} onChange={(e) => setTtl(e.target.value)} className="bg-bg border border-line rounded-lg px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-accent/50 transition">
            <option value="1h">1 hour</option>
            <option value="1d">1 day</option>
            <option value="7d">7 days</option>
          </select>
        </label>
        {tab === "text" && (
          <button onClick={() => setCode(!code)} className={`flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-lg border transition ${code ? "border-accent/50 text-accent bg-accent/10" : "border-line text-muted hover:text-ink"}`}>
            <Code size={14} /> code
          </button>
        )}
        <button onClick={() => setBurn(!burn)} className={`flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-lg border transition ${burn ? "border-warn/50 text-warn bg-warn/10" : "border-line text-muted hover:text-ink"}`}>
          <Flame size={14} /> burn after read
        </button>
        <button onClick={submit} disabled={!ready || busy} className="ml-auto flex items-center gap-2 bg-accent text-bg font-medium text-[14px] px-5 py-2.5 rounded-xl hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed">
          {busy ? <><Loader2 size={16} className="animate-spin" /> encrypting</> : "encrypt & get link"}
        </button>
      </div>

      {err && <p className="mt-4 text-[13px] text-bad">{err}</p>}
    </div>
  );
}

function fmt(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
