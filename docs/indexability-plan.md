# Indexability plan — baking listing content into static HTML

**Problem.** `listings.html` and `property.html` serve zero listing content in raw
HTML. Everything is fetched from Supabase and rendered client-side after load, so
a crawler that does not execute JavaScript sees an empty grid and one generic
property page. This was the top finding of the SEO audit: **0 of 108 properties
are indexable**, and the highest-intent queries ("4 bedroom apartment Hazmieh")
have nothing to match.

**Constraint.** Stay on plain HTML/JS. No framework. Property data changes a few
times a week, so near-real-time is not required.

**Approach.** Extend the existing build step (which already precompiles Tailwind)
to fetch listings and bake real HTML into the page at build time, keeping the
current client-side JS on top for interactivity. Rebuild on a schedule.

---

## v1 / v2 split

### v1 — bake all 108 cards into `listings.html` (~half a day)

- All 108 properties' text becomes crawlable.
- 108 internal links so crawlers can **discover** property pages.
- No URL changes, no redirects, no routing, no new files.

This solves discovery. It does **not** win long-tail queries, because all 108
property pages still share one generic title and description.

### v2 — 108 static property pages (~1.5–2 days) — NOT STARTED

Where the actual traffic is. Most of the effort is routing, redirects and
sitemap rather than generation.

```
/property/ELV-SM-8551.html        108 generated files
vercel.json rewrite:  /property/:id  →  /property/:id.html
vercel.json redirect: /property.html?id=:id  →  /property/:id
```

**The redirect is not optional.** `waLink()` puts `property.html?id=…` into every
WhatsApp message the business has ever sent. Those links must keep resolving.

Also needs updating: `waLink()`, card hrefs in three files, `sitemap.xml` (108
new URLs), canonicals, and JSON-LD `@id`.

---

## No server-side key is needed

`properties` is public-read with the anon key already shipped in the client. The
build can use it directly, which removes secret management from the build
entirely. A service key would only be needed if RLS on that table tightened.

---

## Three problems this creates

### 1. The SWR cache will overwrite the baked HTML

**These are not orthogonal.** `initStore()` renders from `localStorage`
immediately on load, so the client replaces baked content within milliseconds.
Crawlers would see the baked HTML; returning visitors would see it thrown away.

Worse, "render content, then replace it" is exactly the pattern that caused the
CLS regression recorded in `cwv-baseline-2026-09-22.md` (M5): cards painted with
fallback font metrics, then re-laid-out. Any difference between baked and
rendered markup risks reintroducing it.

**Fix, reusing machinery that already exists.** The build stamps the
`{max updated_at, count}` signature — the same one `probeSignature()` computes —
into the baked HTML. On load, if the signature matches, the client **skips the
re-render entirely**. Baked HTML becomes the fast path; SWR re-renders only when
data has actually moved.

This is required for v1, not an enhancement. Shipping without it means crawlers
index content that is silently discarded client-side, and reopens the CLS risk.

### 2. Page weight from repeated inline SVG

One rendered card is **3404 bytes of HTML but only 137 characters of visible
text**. The bulk is inline SVG icons — location pin, bed, bath, WhatsApp logo —
repeated per card. Baking 108 of them adds ~359 KB raw to a 33 KB file.

Gzip compresses repetition well, but this would still undo the LCP work that
took mobile listings from 10.03s to 2.42s. **The baked markup must not duplicate
the SVGs**: define each once in a hidden `<svg><symbol>` block and reference them
with `<use href="#icon-bed">`, or omit decorative icons from the baked markup and
let the client add them on hydration.

### 3. Staleness vs. the sold/rented banner

Between rebuilds, a property marked sold in the CRM stays "available" in the
baked HTML. The client corrects it on load, but **the baked version is what
Google indexes**. With a 6-hour cron that is a window in which search results can
show sold stock as available.

Mitigations, in order of cost: tighten the interval; add a Supabase webhook
scoped to sold/rented changes only; or exclude closed deals from the bake so a
sold property simply is not in the static HTML.

---

## Rebuild triggering

**Vercel Cron requires a serverless function.** Cron invokes a path, so this
means adding `/api/rebuild.js`. Zero-config functions work without a framework,
so this does not force one, but it moves the project from pure-static to
static+functions. The function cannot redeploy itself — it POSTs to a **Deploy
Hook** URL created in Settings → Git → Deploy Hooks.

**A Supabase webhook is simpler** — it can POST straight to the Deploy Hook with
no function and no code at all. But it fires **per row**, and the CRM writes in
bulk: all 108 rows have `updated_at ≠ created_at`, and one observed batch updated
dozens of rows within three seconds. That would queue ~108 builds.

**Decision: scheduled cron, not a webhook.** Predictable, no thundering herd, and
adequate for data that changes a few times a week. A manual Deploy Hook trigger
covers urgent updates. Plan limits on cron frequency need checking — Hobby is
restricted.

---

## Open decision: do sold/rented properties get baked?

Recorded here because it changes the generation loop and must not be assumed.

Current state, which complicates the question:

- **0 of 108 properties are tagged sold/rented right now**, so `sold.html` is
  empty and this is currently theoretical.
- `listings.html:403` **does not exclude** closed deals — it sorts them last and
  renders them with a SOLD/RENTED sash.
- `llms.txt` states sold properties "are excluded from the browse and search
  pages", which **contradicts** the code above. One of the two should change.

See the decision log at the end of this file once resolved.

---

## Status

- v1: pending the sold/rented decision and cron sign-off.
- v2: not started, deliberately.
