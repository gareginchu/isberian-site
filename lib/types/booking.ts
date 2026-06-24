export type Showroom = "chicago" | "evanston";

export type ShowroomMeta = {
  key: Showroom;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  phoneHref: string;
  hours: { day: string; open: string; close: string }[];
  hoursLine: string; // human-readable summary
  mapsUrl: string;
  calEvent: string; // env-driven Cal.com event slug
};

export type AppointmentRequest = {
  showroom: Showroom;
  preferredAt: string; // ISO
  reason?: string;
  contact: {
    name: string;
    email: string;
    phone?: string;
  };
};
