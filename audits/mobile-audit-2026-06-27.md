# Mobile responsiveness audit — 2026-06-27

Captured at iPhone 13/14 viewport (390×844, devicePixelRatio 3) against
`https://isberian-site-qbj6.vercel.app`. Four routes audited.

| Route | Verdict | Notes |
|---|---|---|
| `/` | Partial | Layout flows; floating concierge bubble overlaps grid card content. Carousel arrows are inset on the slide — confirm tap target is ≥44px. |
| `/rugs` | Pass | Header collapses cleanly; filter pills wrap nicely; concierge bubble doesn't intersect interactive content above the fold. |
| `/rugs/[slug]` | **Fail** | Concierge bubble sits directly on top of the rug title (`Imperial Medallion Kazak (1888)`). Title is the primary call-to-attention on the PDP — being obscured is a real issue. |
| `/services/triage` | Partial | Form is well-laid-out; concierge bubble overlaps the lower edge of the phone-number input ("PHONE (OPTIONAL)"). |

## Top 3 fixes

1. **`components/FloatingConcierge.tsx`** — the round launcher bubble at
   `bottom-5 right-5 / lg:bottom-6 lg:right-6` overlaps content on viewports
   narrower than ~420px. Fixes: (a) raise the mobile bottom offset to clear
   above-the-fold content, or (b) auto-hide the launcher and bump it back
   when the user scrolls, or (c) reduce the bubble size on mobile from 60px
   to 48px and tuck it tighter to the corner. Option (c) is the lowest-risk.

2. **`components/HeroCarousel.tsx`** — verify the prev/next chevron buttons
   are 44×44 minimum on mobile. In the screenshot they appear inset within
   the carousel edge. Add explicit `min-w-[44px] min-h-[44px]` to the
   button class string. WCAG 2.5.5 (Target Size) requires this.

3. **`app/rugs/page.tsx`** filter pills — the "dark" color pill wrapping
   alone on a row is cosmetic; consider using `flex-wrap` with a tighter
   column gap or grouping color pills into a 4-column grid on mobile. Not
   a blocker, just polish.

## Routes that look good on mobile

- `/rugs` — catalog grid is the strongest mobile surface.
- `/services/triage` form-heavy layout is correctly stacked.
- Header behavior on all four routes — top black strip hidden, logo + hamburger visible, no horizontal scroll.

## Notes

- No horizontal scroll on any of the four routes.
- Top utility strip (Concierge / Identify / Journal / Story · phones)
  is correctly hidden below the `lg` breakpoint — confirm a comparable
  reach to those routes exists in the mobile hamburger menu (not verified
  in this audit since menu wasn't opened).
- Carousel dots indicator is visible at the bottom of the hero on `/`
  but partially overlaps the next section's top edge. Minor.
