import { NextResponse } from "next/server";
import { runConcierge, type ConciergeMessage } from "@/lib/ai/orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { history?: ConciergeMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
  if (history.length === 0) {
    return NextResponse.json({ error: "empty_history" }, { status: 400 });
  }
  try {
    const result = await runConcierge(history);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[concierge] orchestrator threw", err);
    return NextResponse.json(
      {
        reply:
          "I'm not finding a clean answer right now — the team at the showroom would be much faster. Chicago: 312-467-1212. Evanston: 847-475-0000.",
        citedRugIds: [],
        toolCalls: [],
        guardrailFindings: [],
        handedOffToHuman: true,
      },
      { status: 200 },
    );
  }
}
