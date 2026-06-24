import type { ShowroomMeta } from "@/lib/types/booking";

/**
 * Real-world showroom metadata. Hours are summarized for tap-targets; the booking flow renders
 * actual slots from Cal.com. Never invent hours in the assistant — always read from this file.
 */
export const showrooms: Record<"chicago" | "evanston", ShowroomMeta> = {
  chicago: {
    key: "chicago",
    label: "Chicago showroom",
    street: "120 W Kinzie Street",
    city: "Chicago",
    state: "IL",
    zip: "60654",
    phone: "312-467-1212",
    phoneHref: "tel:+13124671212",
    hours: [
      { day: "Mon", open: "10:00", close: "17:00" },
      { day: "Tue", open: "10:00", close: "17:00" },
      { day: "Wed", open: "10:00", close: "17:00" },
      { day: "Thu", open: "10:00", close: "17:00" },
      { day: "Fri", open: "10:00", close: "17:00" },
      { day: "Sat", open: "11:00", close: "16:00" },
    ],
    hoursLine: "Mon–Fri 10:00–17:00 · Sat 11:00–16:00 · by appointment",
    mapsUrl: "https://maps.google.com/?q=120+W+Kinzie+Street+Chicago+IL+60654",
    calEvent: process.env.CAL_CHICAGO_EVENT ?? "showroom-chicago",
  },
  evanston: {
    key: "evanston",
    label: "Evanston showroom",
    street: "1028 Chicago Avenue",
    city: "Evanston",
    state: "IL",
    zip: "60202",
    phone: "847-475-0000",
    phoneHref: "tel:+18474750000",
    hours: [
      { day: "Tue", open: "10:00", close: "17:00" },
      { day: "Wed", open: "10:00", close: "17:00" },
      { day: "Thu", open: "10:00", close: "17:00" },
      { day: "Fri", open: "10:00", close: "17:00" },
      { day: "Sat", open: "11:00", close: "16:00" },
    ],
    hoursLine: "Tue–Fri 10:00–17:00 · Sat 11:00–16:00 · by appointment",
    mapsUrl: "https://maps.google.com/?q=1028+Chicago+Avenue+Evanston+IL+60202",
    calEvent: process.env.CAL_EVANSTON_EVENT ?? "showroom-evanston",
  },
};
