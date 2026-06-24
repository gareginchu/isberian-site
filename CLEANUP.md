# Tidy-up: delete the failed Vercel project

You have two Vercel projects right now — `isberian-site` (the failed one) and `isberian-site-qbj6` (the live one). To remove the dead one:

1. Open https://vercel.com/dashboard
2. Find the **`isberian-site`** project (not `isberian-site-qbj6`).
3. Click into it.
4. Click **Settings** (top tab).
5. Scroll to the **very bottom**.
6. Click **Delete Project**.
7. Type the project name to confirm.

That's it. The live one (`isberian-site-qbj6`) is unaffected.

## (Optional) Rename the live one

If `isberian-site-qbj6.vercel.app` bothers you and you want plain `isberian-site.vercel.app`:

1. Do the deletion above first.
2. Then in the **live** project: **Settings → General → Project Name** → change to `isberian-site` → **Save**.
3. The Vercel URL becomes `isberian-site.vercel.app`. Existing `isberian-site-qbj6.vercel.app` keeps working as an alias.

This rename takes effect immediately; no redeploy needed.
