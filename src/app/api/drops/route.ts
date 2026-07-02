import { NextRequest } from "next/server";
import { put, sweep, ttlFor, MAX_BYTES } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await sweep();
  const ttl = ttlFor(req.nextUrl.searchParams.get("ttl") ?? "1d");
  if (ttl == null) return Response.json({ error: "bad_ttl" }, { status: 400 });
  const burn = req.nextUrl.searchParams.get("burn") === "1";

  const buf = new Uint8Array(await req.arrayBuffer());
  if (buf.length === 0) return Response.json({ error: "empty" }, { status: 400 });
  if (buf.length > MAX_BYTES) return Response.json({ error: "too_big" }, { status: 413 });

  const id = await put(buf, ttl, burn);
  return Response.json({ id });
}
