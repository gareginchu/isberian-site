# scripts/

## Vision-classify the catalog

The catalog's origin/region/age were inferred from rug titles (e.g. "Sivas" → Turkish) when the
images were imported. That heuristic gets some wrong (a Lori can be Armenian or Persian; only the
photograph tells you which). The vision-classify pair fixes this by running every rug image
through the same Claude vision system prompt used by the live `/identify` route.

### Run it

1. Make sure `ANTHROPIC_API_KEY` is set:

   ```
   # PowerShell
   $env:ANTHROPIC_API_KEY="sk-ant-..."
   # …or paste it into .env.local at the repo root (preferred — git-ignored).
   ```

2. Classify all rugs (~3 minutes, ~$1.50 in Anthropic credits at current catalog size):

   ```
   pnpm vision:classify
   ```

   Writes `scripts/vision-results.json`. Idempotent — re-running picks up where it left off and
   skips rugs already classified. Delete the file to redo everything.

3. Generate the editor-queue review document:

   ```
   pnpm vision:apply
   ```

   Writes `scripts/vision-patches.md` — a per-rug table showing **catalog vs. AI** for origin,
   region, age, and materials, plus the visual tells the AI cited. Rugs are flagged ✔ (agree) or
   ⚠ (disagree).

4. Hand-edit `lib/catalog/fixtures.ts` to apply the changes you trust. The script never writes
   to fixtures directly — editor approval is required by CLAUDE.md.

### Why this isn't fully automated

Per the editorial principle in CLAUDE.md, AI-drafted catalog claims stay in `verified: false`
until an editor confirms. A wrong origin published with confidence is worse than a slow review
queue. The patches markdown is that queue.
