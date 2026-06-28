import { NextResponse } from "next/server";
import { saveSeed } from "@/lib/curator/store";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { id?: number; patch?: Record<string, unknown> };
    if (typeof body.id !== "number" || !body.patch) {
      return NextResponse.json({ error: "missing id or patch" }, { status: 400 });
    }
    const result = await saveSeed(body.id, body.patch);
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
