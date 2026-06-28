import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Token names kept stable; values remapped to a neutral grey/white palette modeled on
      // the current isberian.com — restrained, contemporary, photography-forward.
      colors: {
        // `cream` → near-white paper.
        cream: {
          DEFAULT: "#FAFAF8",
          50: "#FFFFFF",
          100: "#FAFAF8",
          200: "#F1F1EE",
        },
        // `oxblood` → deep burgundy. Matches the legacy isberian.com link /
        // label color (#570F12, sampled with getComputedStyle on the live
        // site), so eyebrows, "back" links, field labels, and primary CTAs
        // carry the heritage burgundy register. The previous value (#1F1F1E)
        // was the same as ink, which made every "text-oxblood" usage on the
        // site render as plain black — losing the burgundy accent entirely.
        oxblood: {
          DEFAULT: "#570F12",
          700: "#460C0F",
          800: "#37090B",
          900: "#280608",
        },
        // `saddle` → muted warm grey (small accent / "needs review" chip).
        saddle: {
          DEFAULT: "#7A716A",
          600: "#7A716A",
          700: "#5C544E",
        },
        // `ink` → text scale.
        ink: {
          DEFAULT: "#1F1F1E",
          900: "#0E0E0D",
          700: "#3A3A38",
          500: "#6E6E6C",
          300: "#C9C9C5",
        },
      },
      fontFamily: {
        // Sans-serif is now primary. Serif kept only for the wordmark and rare editorial moments.
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "Cambria", "serif"],
      },
      letterSpacing: {
        "wide-2": "0.06em",
        "wide-3": "0.16em",
      },
      maxWidth: {
        prose: "68ch",
        page: "84rem",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
