export interface Meta { kind: "text" | "file"; name?: string; mime?: string; lang?: string; }

const enc = new TextEncoder();
const dec = new TextDecoder();

export function toB64u(bytes: Uint8Array): string {
  let s = ""; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function fromB64u(s: string): Uint8Array {
  const b = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b + "=".repeat((4 - (b.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function makeKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}
export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return toB64u(new Uint8Array(raw));
}
export async function importKey(b64u: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", fromB64u(b64u), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export function pack(meta: Meta, data: Uint8Array): Uint8Array {
  const head = enc.encode(JSON.stringify(meta));
  const out = new Uint8Array(4 + head.length + data.length);
  new DataView(out.buffer).setUint32(0, head.length);
  out.set(head, 4);
  out.set(data, 4 + head.length);
  return out;
}
export function unpack(buf: Uint8Array): { meta: Meta; data: Uint8Array } {
  const len = new DataView(buf.buffer, buf.byteOffset).getUint32(0);
  const meta = JSON.parse(dec.decode(buf.subarray(4, 4 + len)));
  return { meta, data: buf.subarray(4 + len) };
}

export async function seal(key: CryptoKey, plain: Uint8Array): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain as BufferSource);
  const out = new Uint8Array(12 + ct.byteLength);
  out.set(iv);
  out.set(new Uint8Array(ct), 12);
  return out;
}
export async function open(key: CryptoKey, blob: Uint8Array): Promise<Uint8Array> {
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: blob.subarray(0, 12) }, key, blob.subarray(12) as BufferSource);
  return new Uint8Array(pt);
}

// ---- optional passphrase layer ------------------------------------------------
// The random AES key can be wrapped with a passphrase-derived key. The wrapped
// key (not the raw one) goes in the URL fragment, prefixed "p.". A wrong
// passphrase fails to unwrap locally, so the drop is never fetched — burn-after-
// read is preserved. No passphrase => the fragment is the raw key, exactly as
// before, so existing links are unaffected.

async function deriveWrapKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 200000, hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"],
  );
}

export const isPassProtected = (frag: string): boolean => frag.startsWith("p.");

export async function wrapKeyWithPass(key: CryptoKey, passphrase: string): Promise<string> {
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", key));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wk = await deriveWrapKey(passphrase, salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, wk, raw as BufferSource));
  const payload = new Uint8Array(12 + ct.length);
  payload.set(iv); payload.set(ct, 12);
  return `p.${toB64u(salt)}.${toB64u(payload)}`;
}

export async function unwrapKeyWithPass(frag: string, passphrase: string): Promise<CryptoKey> {
  const [, saltB, payloadB] = frag.split(".");
  const salt = fromB64u(saltB), payload = fromB64u(payloadB);
  const wk = await deriveWrapKey(passphrase, salt);
  const raw = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: payload.subarray(0, 12) }, wk, payload.subarray(12) as BufferSource));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}
