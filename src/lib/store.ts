import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const root = path.join(process.cwd(), "data");
const blobs = path.join(root, "blobs");

export const MAX_BYTES = 100 * 1024 * 1024;
const TTLS: Record<string, number> = {
  "1h": 3600e3,
  "1d": 86400e3,
  "7d": 604800e3,
};

export interface DropMeta { expiresAt: number; burn: boolean; size: number; }

async function ensure() {
  await fs.mkdir(blobs, { recursive: true });
}

function newId(): string {
  return crypto.randomBytes(9).toString("base64url");
}

export function ttlFor(key: string): number | null {
  return TTLS[key] ?? null;
}

export async function put(body: Uint8Array, ttlMs: number, burn: boolean): Promise<string> {
  await ensure();
  const id = newId();
  const meta: DropMeta = { expiresAt: Date.now() + ttlMs, burn, size: body.length };
  await fs.writeFile(path.join(blobs, id + ".bin"), body);
  await fs.writeFile(path.join(blobs, id + ".json"), JSON.stringify(meta));
  return id;
}

export async function take(id: string): Promise<{ body: Buffer; meta: DropMeta } | "gone" | "not_found"> {
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) return "not_found";
  const bin = path.join(blobs, id + ".bin");
  const metaPath = path.join(blobs, id + ".json");
  let meta: DropMeta;
  try {
    meta = JSON.parse(await fs.readFile(metaPath, "utf8"));
  } catch {
    return "not_found";
  }
  if (Date.now() > meta.expiresAt) {
    await drop(id);
    return "gone";
  }
  let body: Buffer;
  try {
    body = await fs.readFile(bin);
  } catch {
    return "not_found";
  }
  if (meta.burn) await drop(id);
  return { body, meta };
}

export async function drop(id: string) {
  const bin = path.join(blobs, id + ".bin");
  const metaPath = path.join(blobs, id + ".json");
  await Promise.allSettled([fs.rm(bin, { force: true }), fs.rm(metaPath, { force: true })]);
}

let swept = 0;
export async function sweep() {
  if (Date.now() - swept < 60e3) return;
  swept = Date.now();
  try {
    const files = await fs.readdir(blobs);
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      const id = f.slice(0, -5);
      try {
        const meta: DropMeta = JSON.parse(await fs.readFile(path.join(blobs, f), "utf8"));
        if (Date.now() > meta.expiresAt) await drop(id);
      } catch {}
    }
  } catch {}
}
