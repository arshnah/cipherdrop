import { NextRequest } from "next/server";
import { take } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const res = await take(params.id);
  if (res === "not_found") return Response.json({ error: "not_found" }, { status: 404 });
  if (res === "gone") return Response.json({ error: "gone" }, { status: 410 });
  return new Response(res.body, {
    status: 200,
    headers: {
      "content-type": "application/octet-stream",
      "content-length": String(res.body.length),
      "x-burned": res.meta.burn ? "1" : "0",
      "cache-control": "no-store",
    },
  });
}
