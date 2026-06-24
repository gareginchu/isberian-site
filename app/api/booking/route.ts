import { NextResponse } from "next/server";
import { bookAppointment } from "@/lib/booking";
import type { AppointmentRequest } from "@/lib/types/booking";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: AppointmentRequest;
  try {
    body = (await req.json()) as AppointmentRequest;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body?.contact?.email || !body?.preferredAt || !body?.showroom) {
    return NextResponse.json({ error: "invalid_input" }, { status: 422 });
  }
  const result = await bookAppointment(body);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
