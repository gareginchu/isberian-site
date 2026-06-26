/**
 * Crawlability eval.
 *
 * Fetches the live HTML of each route below and verifies:
 *   1. HTTP 200.
 *   2. Initial HTML contains the route's expected content (route-specific check).
 *   3. At least one valid <script type="application/ld+json"> block.
 *   4. No price-leak patterns ($N, "price", "priceCurrency", "offers", "From $").
 *
 * Prints a compact pass/fail table and exits 1 if any row fails.
 *
 * Defaults to the public Vercel preview; override with EVAL_BASE_URL.
 *
 *   pnpm evals:crawl
 *   EVAL_BASE_URL=https://example.vercel.app pnpm evals:crawl
 */

type RouteCheck = {
  /** Path under the base URL, e.g. "/rugs". */
  path: string;
  /**
   * Route-specific content assertion against the raw initial HTML.
   * Return null on success, or a string describing what's missing.
   */
  expect: (html: string) => string | null;
};

const BASE_URL = (process.env.EVAL_BASE_URL ?? "https://isberian-site-qbj6.vercel.app").replace(/\/$/, "");

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const ROUTES: RouteCheck[] = [
  {
    path: "/",
    expect: (html) =>
      /isberian/i.test(html) ? null : "home HTML missing brand name 'Isberian'",
  },
  {
    path: "/rugs",
    expect: (html) =>
      /href="\/rugs\/[^"#?]+"/i.test(html)
        ? null
        : "no /rugs/<slug> link found in /rugs HTML",
  },
  {
    path: "/rugs/imperial-medallion-kazak-1888-17109",
    expect: (html) => {
      const hasTitle = /imperial\s+medallion/i.test(html);
      const hasH1 = /<h1[\s>]/i.test(html);
      if (!hasH1) return "PDP missing <h1>";
      if (!hasTitle) return "PDP HTML missing rug title 'Imperial Medallion'";
      return null;
    },
  },
  {
    path: "/care",
    expect: (html) =>
      /<h1[\s>]/i.test(html) && /care/i.test(html)
        ? null
        : "/care HTML missing <h1> or 'care' content",
  },
  {
    path: "/services",
    expect: (html) =>
      /<h1[\s>]/i.test(html) && /service/i.test(html)
        ? null
        : "/services HTML missing <h1> or 'service' content",
  },
  {
    path: "/services/triage",
    expect: (html) =>
      /<h1[\s>]/i.test(html) && /triage/i.test(html)
        ? null
        : "/services/triage HTML missing <h1> or 'triage' content",
  },
  {
    path: "/visit",
    expect: (html) => {
      if (!/<h1[\s>]/i.test(html)) return "/visit missing <h1>";
      if (!/(chicago|evanston)/i.test(html))
        return "/visit HTML missing showroom mention";
      return null;
    },
  },
  {
    path: "/story",
    expect: (html) =>
      /<h1[\s>]/i.test(html) && /(isberian|story|heritage|family)/i.test(html)
        ? null
        : "/story HTML missing <h1> or heritage content",
  },
];

/**
 * Patterns that would indicate a price leak in initial HTML.
 *
 * Note on the `$` + digit pattern: Next.js's RSC (Flight) payload embeds
 * element refs like `"$","$1","$L4"` literally in the HTML. Those are not
 * prices. We require the `$` to NOT be preceded by `"` or a word char, and
 * we require a "real money" shape: comma-grouped thousands, a decimal, a
 * k/m/M suffix, or 3+ consecutive digits.
 */
const PRICE_LEAK_PATTERNS: Array<{ name: string; re: RegExp }> = [
  {
    name: '"$" + digits',
    re: /(?<!["\w])\$\s?(?:\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+|\d{3,}|\d+\s*[kKmM]\b)/,
  },
  { name: '"price"', re: /"price"/i },
  { name: '"priceCurrency"', re: /"priceCurrency"/i },
  { name: '"offers"', re: /"offers"/i },
  { name: '"From $"', re: /from\s*\$\s?\d/i },
];

type RouteResult = {
  path: string;
  status: number | "ERR";
  ok: boolean;
  failures: string[];
};

function stripJsonLdBlocks(html: string): string {
  // Remove inline JSON-LD before scanning for price-leak strings,
  // so the scanner targets human-visible text + non-JSON-LD attributes.
  return html.replace(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
    "",
  );
}

function extractJsonLdBlocks(html: string): string[] {
  const out: string[] = [];
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    out.push(m[1].trim());
  }
  return out;
}

async function checkRoute(route: RouteCheck): Promise<RouteResult> {
  const url = `${BASE_URL}${route.path}`;
  const failures: string[] = [];
  let status: number | "ERR" = "ERR";

  let html = "";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });
    status = res.status;
    html = await res.text();
    if (res.status !== 200) {
      failures.push(`HTTP ${res.status}`);
    }
  } catch (err) {
    failures.push(`fetch error: ${(err as Error).message}`);
    return { path: route.path, status, ok: false, failures };
  }

  // Route-specific content assertion.
  const contentErr = route.expect(html);
  if (contentErr) failures.push(`content: ${contentErr}`);

  // JSON-LD presence + validity.
  const blocks = extractJsonLdBlocks(html);
  if (blocks.length === 0) {
    failures.push("no <script type=\"application/ld+json\"> block");
  } else {
    let anyValid = false;
    for (const block of blocks) {
      try {
        JSON.parse(block);
        anyValid = true;
      } catch {
        // keep looking; only fail if none parse
      }
    }
    if (!anyValid) failures.push("all JSON-LD blocks invalid JSON");
  }

  // Price-leak scan over HTML minus JSON-LD blocks.
  // (JSON-LD itself is allowed to contain harmless tokens, but we still flag
  //  "price"/"offers"/"priceCurrency" wherever they appear in the document.)
  const scanTarget = stripJsonLdBlocks(html);
  for (const { name, re } of PRICE_LEAK_PATTERNS) {
    if (re.test(scanTarget)) {
      failures.push(`price-leak: ${name}`);
    }
  }
  // Even inside JSON-LD, schema.org Offer/price tokens leak commercial intent
  // and violate Rule 1. Catch them too.
  for (const block of blocks) {
    for (const { name, re } of PRICE_LEAK_PATTERNS) {
      if (name === '"$" + digit') continue; // JSON-LD won't legitimately have $N
      if (re.test(block)) {
        failures.push(`price-leak in JSON-LD: ${name}`);
      }
    }
  }

  return {
    path: route.path,
    status,
    ok: failures.length === 0,
    failures: dedupe(failures),
  };
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

function pad(s: string, n: number): string {
  if (s.length >= n) return s;
  return s + " ".repeat(n - s.length);
}

async function main() {
  process.stdout.write(`crawl eval against ${BASE_URL}\n\n`);

  const results: RouteResult[] = [];
  for (const route of ROUTES) {
    // Serial fetches keep output readable and avoid hammering the preview.
    const r = await checkRoute(route);
    results.push(r);
    const tag = r.ok ? "PASS" : "FAIL";
    const status = typeof r.status === "number" ? String(r.status) : r.status;
    process.stdout.write(
      `  ${pad(tag, 5)} ${pad(status, 5)} ${pad(route.path, 48)}` +
        (r.ok ? "" : `  ${r.failures.join("; ")}`) +
        "\n",
    );
  }

  const failed = results.filter((r) => !r.ok);
  process.stdout.write(
    `\n${results.length - failed.length}/${results.length} routes passed.\n`,
  );

  if (failed.length > 0) {
    process.stdout.write("\nfailures:\n");
    for (const r of failed) {
      process.stdout.write(`  ${r.path}\n`);
      for (const f of r.failures) process.stdout.write(`    - ${f}\n`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  process.stderr.write(`crawl eval crashed: ${(err as Error).stack ?? err}\n`);
  process.exit(1);
});
