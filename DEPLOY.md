# Deploy + connect AI + connect Sanity

Three short walkthroughs. Do them in order; each takes a few minutes.

---

## A — Deploy to Vercel (GitHub: `gareginchu`)

### 1. Create the GitHub repository

Open https://github.com/new and create a repo named `isberian-site` (private is fine). **Don't** add a README, .gitignore, or license — the local repo already has them.

After creating, GitHub shows the remote URL. Copy it. It will look like:
`git@github.com:gareginchu/isberian-site.git` (SSH) or
`https://github.com/gareginchu/isberian-site.git` (HTTPS).

### 2. Push from your machine

```powershell
cd "c:\Users\gareg\OneDrive\Desktop\Isberian new site"
git remote add origin https://github.com/gareginchu/isberian-site.git
git push -u origin main
```

If GitHub asks for credentials, use a personal access token (Settings → Developer settings → Tokens (classic) → Generate new token → check `repo`).

### 3. Import into Vercel

Open https://vercel.com/new. If you don't have a Vercel account, sign up with GitHub — it takes a minute.

- Pick `isberian-site` from the repo list.
- Framework preset will auto-detect as **Next.js**.
- Build/install/output are pre-configured via `vercel.json` — leave defaults.
- **Stop before clicking Deploy.** Add the env vars first (next step).

### 4. Vercel env vars

Under "Environment Variables" on the import screen, add at minimum:

| Key | Value |
|---|---|
| `ANTHROPIC_API_KEY` | (see section C below) |
| `LEAD_EMAIL_TO` | `info@isberian.com` |
| `SESSION_RETENTION_DAYS` | `30` |

Skip the others for now — they have safe defaults that fall back to fixtures.

### 5. Deploy

Click **Deploy**. First build takes ~2 minutes. You'll get a `https://isberian-site-<hash>.vercel.app` URL.

### 6. Custom domain (optional)

Vercel project → Settings → Domains → Add. Point your DNS to Vercel per their instructions.

---

## C — Wire the live concierge (Anthropic API key)

You said you already have a key from another site. Use the same one.

### Locally (for `pnpm dev`)

Create `.env.local` in the project root (it's already gitignored):

```
ANTHROPIC_API_KEY=sk-ant-...
```

Restart `pnpm dev`. The floating concierge button now calls `claude-sonnet-4-6` for real.

Test it:
1. Open http://localhost:3000
2. Click "Ask the concierge"
3. Type "Looking for a long runner for a hallway"
4. You should see specific rugs from the catalog — not the canned hand-off line.

### In Vercel

Project → Settings → Environment Variables → Add:
- **Key**: `ANTHROPIC_API_KEY`
- **Value**: same `sk-ant-...`
- **Environments**: tick **Production** and **Preview** (not **Development** — that one reads `.env.local` if you use Vercel CLI).

Click **Save**. Then **Deployments** → "..." on the latest → **Redeploy**.

---

## E — Real CMS (Sanity)

Until provisioned, the site reads from fixtures in `/lib/*` and looks identical. When you want editors to update content without a deploy:

### 1. Create a Sanity project

```bash
pnpm dlx sanity@latest init --create-project "Isberian" --dataset production
```

When prompted:
- **Output path**: `./content` (where the schemas already live)
- **Project template**: `Clean project with no predefined schemas` (we have our own in `/content/schemas`)

This creates a project in your Sanity account at sanity.io/manage. Note the **project ID** (e.g., `abc123xy`).

### 2. Run the Studio locally

```bash
cd content
pnpm dlx sanity dev
```

Studio opens at http://localhost:3333. Create a few `faqEntry`, `careGuide`, and `journalEntry` documents to test.

### 3. Wire the site to Sanity

Add to `.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xy
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=          # leave empty for read-only public datasets
```

Then update the adapters to prefer Sanity when env is set. The client at `lib/sanity/client.ts` already returns `null` when no project ID is set — so you'd update `lib/faq/index.ts`, `lib/journal/index.ts`, etc., to do:

```ts
const client = sanity();
if (client) {
  return await client.fetch<FaqEntry[]>(`*[_type == "faqEntry"]`);
}
return fixtures; // existing fallback
```

I can do that wiring as a follow-up commit once you've provisioned the project and shared the project ID. It's ~15 minutes of work.

### 4. Add the env to Vercel

Same place as the Anthropic key. Make the dataset public in Sanity for the simplest read setup, or use a read-only token.

---

## Recap

| Step | Where | Why |
|---|---|---|
| A1–6 | Your machine + GitHub + Vercel | Get it online. |
| C | Vercel env + .env.local | Concierge becomes real. |
| E | Sanity + adapter wiring | Editors update content without deploys. |

Yell when you've done A and C, and I'll do the adapter wiring for E.
