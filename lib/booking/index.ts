import type { AppointmentRequest } from "@/lib/types/booking";
import { showrooms } from "./showrooms";

export { showrooms } from "./showrooms";

/**
 * Booking adapter. With `SCHEDULER_API_KEY` set, posts to Cal.com's bookings endpoint. Without it,
 * returns a placeholder confirmation so the surface is exercisable in dev without scheduler creds.
 *
 * The concierge tool surface treats the return as opaque structured data — it does not assume
 * a particular shape beyond `{ ok, when?, alternatives?, holdUrl? }`.
 */
export async function bookAppointment(req: AppointmentRequest): Promise<{
  ok: boolean;
  when?: string;
  alternatives?: string[];
  holdUrl?: string;
  message: string;
}> {
  const showroom = showrooms[req.showroom];
  if (!showroom) {
    return { ok: false, message: `Unknown showroom: ${req.showroom}` };
  }
  const apiKey = process.env.SCHEDULER_API_KEY;
  if (!apiKey) {
    return {
      ok: true,
      when: req.preferredAt,
      holdUrl: `/visit?showroom=${showroom.key}`,
      message: `Hold placed for ${showroom.label} (Cal.com not wired; preferred ${req.preferredAt}).`,
    };
  }
  try {
    const res = await fetch("https://api.cal.com/v2/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        eventTypeSlug: showroom.calEvent,
        start: req.preferredAt,
        attendee: req.contact,
        metadata: { reason: req.reason ?? "" },
      }),
    });
    if (!res.ok) {
      return { ok: false, message: `Scheduler returned ${res.status}.` };
    }
    const json = (await res.json()) as { start?: string; rescheduleLink?: string };
    return {
      ok: true,
      when: json.start ?? req.preferredAt,
      holdUrl: json.rescheduleLink,
      message: `Booked at ${showroom.label}.`,
    };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "scheduler_error" };
  }
}
