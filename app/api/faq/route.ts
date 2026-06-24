import { NextResponse } from "next/server";
import { answerFaq } from "@/lib/faq";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";
  if (!query) return NextResponse.json({ error: "missing_q" }, { status: 400 });
  const ans = await answerFaq(query, searchParams.get("category") ?? undefined);
  return NextResponse.json(ans);
}
