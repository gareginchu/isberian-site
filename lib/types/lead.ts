export type LeadType =
  | "quote"
  | "visit"
  | "wishlist"
  | "service"
  | "identify"
  | "trade"
  | "concierge";

export type ConsentRecord = {
  /** Did the user explicitly tick the consent line before submitting? */
  given: boolean;
  /** ISO timestamp of consent capture. */
  at: string;
  /** Exact consent copy shown — for audit. */
  text: string;
};

export type LeadAttachment = {
  kind: "photo" | "transcript";
  url?: string; // for hosted images
  inline?: string; // for short transcripts
  note?: string;
};

export type Lead = {
  id: string;
  type: LeadType;
  createdAt: string; // ISO
  contact: {
    name?: string;
    email: string;
    phone?: string;
    preferredContact?: "email" | "phone";
  };
  rugId?: string; // when the lead points at a specific record
  transcript?: string;
  attachments?: LeadAttachment[];
  consent: ConsentRecord;
  source: "site" | "concierge" | "triage" | "identify";
};
