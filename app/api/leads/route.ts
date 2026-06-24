import { NextResponse } from "next/server";
import { createLead, LeadInputSchema } from "@/lib/leads";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = LeadInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 422 });
  }
  const result = await createLead(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
