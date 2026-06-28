// Rule 5: Always a visible human exit — phone + book-a-visit.
//
// Components import these constants so the exit copy is identical everywhere and never drifts.

export const HUMAN_EXIT_REQUIRED_ON = [
  "/",
  "/rugs",
  "/services",
  "/services/triage",
  "/identify",
  "/trade",
  "/care",
] as const;

export const humanExitContent = {
  chicago: {
    label: "Chicago showroom",
    phone: "312-467-1212",
    phoneHref: "tel:+13124671212",
  },
  evanston: {
    label: "Evanston showroom",
    phone: "847-475-0000",
    phoneHref: "tel:+18474750000",
  },
  bookHref: "/visit",
  bookLabel: "Book a visit",
} as const;
