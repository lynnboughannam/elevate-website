# Core Web Vitals — baseline and measurements

Lab measurements of `https://www.elevateestateslb.com`. The baseline was captured
**before** any performance work; each later measurement is appended under
identical conditions so the deltas mean something. The conditions below matter as
much as the numbers.

| | Baseline | M2 | M3 | M4 | M5 |
|---|---|---|---|---|---|
| Date | 2026-09-22 | 2026-09-22 | 2026-09-22 | 2026-09-22 | 2026-09-22 |
| Commit | `9a7dcf2` | `1f4cd73` | `497f6fa` | `6cea505` | `0711518` |
| What changed | — | Tailwind precompiled; shimmer capped | Supabase calls parallelised | Hero image local, WebP, `<img>` | Stale-while-revalidate cache |
| Properties live | 108 | 108 | 108 | 108 | 108 |
| Browser | Chromium 147.0.7727.57 headless, puppeteer-core | same | same | same | same |
| Runs per figure | 3, median | 3, median | 3, median | 3, median | 3, median |

> **Do not compare absolute LCP across measurements.** They were taken in
> different sessions and the network to Supabase and Vercel varies enough to
> swamp the changes being measured — see mistake 5. Compare within a
> measurement (cold vs warm), or re-run both arms together.

## Results

### Mobile — 4× CPU throttle, Slow 4G, 390×844 @ DPR 2

| Metric | Home base | M2 | M3 | **M4** | Listings base | M2 | M3 | **M4** | Threshold |
|---|---|---|---|---|---|---|---|---|---|
| **LCP** | 11.82s POOR | 5.43s | 4.95s POOR | **2.39s good** | 10.03s POOR | 6.64s | 2.42s | **2.56s** needs work | ≤2.5s / ≤4.0s |
| **INP** | — | — | — | — | 2416ms POOR | 2560ms | 1272ms | **1216ms** POOR | ≤200ms / ≤500ms |
| **CLS** | 0.000 good | 0.000 | 0.000 | **0.000** good | 0.084 good | 0.084 | 0.001 | **0.001** good | ≤0.1 / ≤0.25 |
| FCP | 8.78s POOR | 3.31s | 2.07s | **1.34s good** | 5.67s POOR | 1.14s | 0.87s | **0.92s good** | ≤1.8s / ≤3.0s |
| TTFB | 207ms good | 191ms | 508ms | **201ms** good | 497ms good | 198ms | 203ms | **212ms** good | ≤800ms / ≤1800ms |
| LCP element | `DIV.hero-bg` | same | same | **`IMG.hero-img`** | `H3` | `H3` | `H3` | `H3` | — |

### Desktop — unthrottled, 1440×900 @ DPR 1

| Metric | Home base | M2 | M3 | **M4** | Listings base | M2 | M3 | **M4** | Threshold |
|---|---|---|---|---|---|---|---|---|---|
| LCP | 1.77s good | 1.38s | 1.24s | **0.62s good** | 3.83s needs work | 4.26s | 2.64s | **2.34s good** | ≤2.5s / ≤4.0s |
| INP | — | — | — | — | 136ms good | 144ms | 128ms | **112ms good** | ≤200ms / ≤500ms |
| CLS | 0.011 good | 0.008 | 0.008 | **0.011** good | 0.016 good | 0.016 | 0.016 | **0.016** good | ≤0.1 / ≤0.25 |
| FCP | 1.05s good | 0.86s | 0.70s | **0.60s good** | 0.93s good | 0.74s | 0.53s | **0.55s good** | ≤1.8s / ≤3.0s |
| TTFB | 194ms good | 202ms | 244ms | **203ms** good | 214ms good | 205ms | 203ms | **187ms** good | ≤800ms / ≤1800ms |
| LCP element | `DIV.hero-bg` | same | same | **`IMG.hero-img`** | `IMG.loaded` | same | `H1.font-display` | `IMG.loaded` | — |

INP is measured on `listings.html` only — it needs interactive controls, and the
filter chips are the realistic interaction.

**Page weight is deliberately omitted from measurement 2.** The figures are not
comparable: the fixed 9s settle window means a *faster* page finishes more lazy
image downloads inside the window, so weight rises as performance improves.
Baseline weights, for the record: mobile 1361 KB / 1555 KB, desktop 3122 KB /
2045 KB.

## What measurement 2 showed

**The Tailwind precompile worked, and was the dominant win.** Replacing
`cdn.tailwindcss.com` (a JIT compiler that generated CSS in the browser on every
load) with a 7.5 KB prebuilt stylesheet cut mobile FCP on listings from 5.67s to
1.14s — into "good" — and roughly halved mobile LCP on both pages.

**The shimmer fix did not improve INP.** 2416ms → 2560ms, i.e. no change within
noise. It remains a correct bug fix — an infinite loading skeleton is wrong, and
the follow-up commit closed a real hole where lazy off-screen images left cards
shimmering permanently — but it should not be credited with a performance win.
See mistake 4 below.

**Mobile LCP is much better but still POOR** (5.43s / 6.64s against 2.5s).

## What measurement 3 showed

`initStore()` sat inside `checkComingSoon().then()`, so the properties fetch could
not begin until an unrelated settings lookup had returned. A waterfall of mobile
`listings.html` at M2 showed the two Supabase calls running back to back:

```
    2.40s -> 3.98s  site_settings?key=eq.coming_soon   (1579ms)
    4.06s -> 5.49s  properties?listed=eq.true          (1430ms)
    7.14s           LCP
```

They are independent — the flag decides which view is visible, not whether the
data is wanted. Starting both together moved DOMContentLoaded from 2.44s to
1.21s and **mobile listings LCP from 6.64s to 2.42s, under the 2.5s threshold
and into "good" for the first time.** Mobile listings CLS also dropped from
0.084 to 0.001, since the grid now fills before the rest of the page settles.

**Mobile INP roughly halved, 2560ms → 1272ms** — below the entire 1840–5880ms
range observed across the session, so probably a real effect from a less
congested main thread rather than noise. It is still 6× the threshold, and per
mistake 4 it deserves confirmation across more runs before being relied on.

Mobile home LCP remains POOR at 4.95s: the homepage LCP element is
`DIV.hero-bg`, a background image, so it is bound by image delivery rather than
by the data fetch.

## What measurement 4 showed

The homepage LCP element was a CSS `background-image` pointing at
`picsum.photos` — a random-image placeholder service that had never been
replaced with a real asset. It served **150 KB of JPEG at 1920×1080 to a 390px
viewport**, via a redirect to `fastly.picsum.photos`, and the DNS/TCP/TLS
handshake to that third origin cost **0.86s before the first image byte**.

Three separate problems, fixed together:

| | Before | After |
|---|---|---|
| Origin | `picsum.photos` → redirect → `fastly.picsum.photos` | same-origin |
| Format | JPEG | WebP |
| Mobile bytes | 150 KB | 49 KB (−67%) |
| Mobile dimensions | 1920×1080 landscape, upscaled to cover a tall viewport | 760×1350 portrait crop |
| Discovery | CSS `background-image` — invisible to the preload scanner | `<img>` in markup, `fetchpriority="high"` |

**Mobile home LCP 4.95s → 2.39s, into "good"** — an 80% cut from the 11.82s
baseline. Desktop home LCP 1.24s → 0.62s.

The discovery change is the part that generalises: a `background-image` is only
found once the stylesheet is parsed *and* the element is matched, so it can
never start early. An `<img>` high in the markup is found while the HTML is
still being parsed.

No `<link rel="preload">` was added. With `<picture>`/`srcset` a preload has to
match `imagesrcset`, `imagesizes` and `media` exactly or the browser downloads
twice; the element is already preload-scanner visible, and `fetchpriority`
covers the priority half. Verified: exactly one hero image is downloaded per
viewport.

Mobile listings LCP moved 2.42s → 2.56s, i.e. sat still around the 2.5s
threshold — run-to-run variance, not a regression from this change, which did
not touch that page's critical path.

## What measurement 5 showed

`initStore()` cleared localStorage and then fetched, so every visitor waited on
the network before seeing a listing — including returning ones who already had
the data. It now renders the cache immediately and revalidates in the
background, using a 48-byte version probe rather than a TTL.

Both arms measured in one session, mobile, 4× CPU, Slow 4G, HTTP cache disabled
throughout (so "warm" isolates the listings cache, not browser asset caching):

| | Home cold | Home warm | Listings cold | **Listings warm** |
|---|---|---|---|---|
| LCP | 2.40s good | 2.38s good | 2.90s needs work | **0.93s good** |
| FCP | 1.28s good | 0.87s good | 0.79s good | **0.53s good** |
| CLS | 0.000 | 0.000 | 0.001 | 0.004 |
| `properties` full fetches | 1 | **0** | 1 | **0** |
| `properties` probes | 0 | **1** | 0 | **1** |

**Listings LCP for a returning visitor: 2.90s → 0.93s, a 68% cut**, because the
fetch is no longer on the critical path at all. The request counts confirm the
mechanism: a warm load issues the 48-byte probe and skips the 217 KB entirely.

Home is unchanged cold-to-warm (2.40s → 2.38s), as expected — its LCP element is
the hero image, which the listings cache has nothing to do with.

### The cache caused a CLS regression, since fixed

Worth recording because the cause was not obvious. Rendering cards from cache at
`DOMContentLoaded` means they lay out using *fallback* font metrics, then
re-lay-out when Playfair and Nunito swap in. Warm CLS spiked to **0.212–0.271**
against a 0.1 threshold, 6/6 runs; cold was 0.001, 5/5. The shift landed
consistently 90–200ms before `document.fonts.ready`.

Cold never showed it because the grid only filled *after* the fonts had settled.
The cache did not create the reflow — it exposed one that was always there.

The cause was line boxes sizing from glyph metrics rather than from a ratio.
Fixed in two passes: card text first (6/6 spiking → 3/5), then, after proving
with an injected global rule that explicit line-heights give 0.004 in 5/5, the
same treatment scoped to the `h1` and results bar above the grid. Both scoped
rather than global, so badge and chip spacing is untouched.

Now 0.004 warm and 0.001 cold, 5/5 each, with no individual shift above 0.005.

**The general lesson: making content render earlier moves it before other
asynchronous work — fonts here — and can surface layout instability that was
previously hidden by the delay.** Anything that speeds up first render on this
site should be re-checked for CLS, not just LCP.

## What causes the remaining INP is still unknown

The baseline version of this file asserted that INP was caused by
`renderListings()` re-rendering the card set synchronously. **That was wrong.** A
CPU profile across three filter taps put 94.6% of the time in `(program)` —
native style, layout and paint — and only ~0.5% in site JavaScript:

```
  self ms   share   function
    13293    94.6%   (program)  ←  native
      467     3.3%   (idle)
       57     0.4%   renderListings
       34     0.2%   buildCard
       19     0.1%   injectListingSchema
```

`renderListings()` itself costs ~100ms per call. Ruled out by direct measurement
so far: site JavaScript, images (blocked them, no change), tap congestion
(spacing taps 4s apart made it *worse*), Tailwind's MutationObserver, and the
shimmer animation. The cost is native rendering work whose source has not been
isolated — a full Chrome trace is the next step, and no INP fix should be
attempted before that.

CLS is genuinely fine and worth protecting in any rendering rewrite: 0.084 on
mobile listings is inside budget but not by much, and listing images still carry
no intrinsic `width`/`height`.

## Methodology, and five ways measurements went wrong

Recorded because each of these produced a confidently wrong number, and a later
run made the same way would show a fake win.

**1. Warm cache made everything look instant.** The first run reused one browser
across all runs, reporting *LCP 0.69s, 1 KB transferred over 7 requests* — for a
77 KB page that loads Tailwind, Google Fonts and remote images. Fix: a fresh
incognito browser context per run plus CDP `Network.setCacheDisabled`. Page
weight went from a nonsensical 1 KB to a real 1.3–3.1 MB.

**2. LCP must be read before any interaction.** A click finalises the LCP entry,
so interacting first and reading after yields a truncated value. The harness
reads LCP, CLS and FCP after load settles, *then* drives interactions for INP.

**3. INP needs `interactionId`, and a control that is actually reachable.** Two
separate faults:

- Observing `event` entries and taking `duration` counts non-interaction events.
  Only entries carrying an `interactionId` are real interactions. Without that
  filter the reading was meaningless.
- The first mobile attempt reported *INP 0ms from 0 interactions*. The selector
  matched a nav `<a href>`, so the page navigated away. Retargeting to
  `.filter-chip` still gave 0 on mobile — because at 390px the filter sidebar is
  `display: none` behind a `.mobile-filter-btn` toggle, so the taps hit hidden
  elements. Only after tapping the toggle open did the real figure appear.

**4. A single-run A/B on a noisy metric proves nothing.** The shimmer fix was
justified by one run with the animation disabled (1840ms) against one run without
(3088ms), reported as "~40% of mobile INP". Across this session mobile INP on
that page has ranged **1840–5880ms**. That spread is wider than the effect being
claimed, so the comparison was meaningless, and the re-measure showed no
improvement at all. Commit `f2c6676` carries the unreliable 40% figure in its
message; `1f4cd73` corrects it.

The rule this implies: **any A/B on INP needs at least 3 runs per side and a
median**, the same as every other figure in this file. Load metrics (LCP, FCP)
have been far more stable, but get the same treatment for consistency.

**5. LCP is not comparable across sessions.** At M5 every figure initially read
far worse than M4 — including the *cold* path, which the change being tested
barely touches. Rather than assume a regression, the old and new `data.js` were
served against the same live site, interleaved run by run:

```
    old data.js (744127f)   LCP 4.80s
    new data.js (ebbafce)   LCP 4.84s
```

Identical. The old code also measured ~4.8s at that moment against 2.56s at M4,
so the network was simply slower — nothing had regressed. A later session gave
2.90s for the same commit.

The rule: **to attribute an LCP change to a code change, run both arms in the
same session, interleaved.** Comparing a number taken now against one taken
hours ago mostly measures the network. That is why the M5 table above reports
cold against warm rather than M5 against M4.

Page weight is taken from CDP `Network.loadingFinished` (`encodedDataLength`),
not `PerformanceResourceTiming.transferSize`, which reports 0 for cached and
opaque cross-origin responses.

### Exact conditions to reproduce

```
Mobile   viewport 390×844, DPR 2, isMobile + hasTouch
         UA: moto g power / Chrome 147 mobile
         Emulation.setCPUThrottlingRate    rate: 4
         Network.emulateNetworkConditions  down 1.6 Mbps, up 750 Kbps, latency 150ms
Desktop  viewport 1440×900, DPR 1, no CPU or network throttling

Both     Network.setCacheDisabled: true
         fresh incognito browser context per run
         wait: load event + 9s settle (covers the Supabase fetch and render)
         3 runs, median
         LCP/CLS/FCP read before any interaction
INP      listings.html only; mobile taps .mobile-filter-btn first, then 6
         .filter-chip taps; desktop clicks 6 chips plus #sort-select
         only PerformanceEventTiming entries with an interactionId count
```

## Caveats

These are **lab** figures from one machine and one network profile. Google ranks
on **field** data (CrUX), gathered from real visitors on real devices, which will
differ — usually worse on mobile, since real phones are more varied than a 4×
throttle. Once the site has enough traffic to appear in CrUX, prefer that over
this file for anything ranking-related.

This file is for measuring *deltas* under identical conditions, which is what it
is good for.

## Still outstanding

- **Mobile INP, 1216ms against a 200ms threshold** — now the only metric still
  failing, and still unattributed (see above). Wants a full Chrome trace, not a
  guess. Everything else is "good" or within a rounding error of it.
- The three testimonial avatars on the homepage are still `picsum.photos`
  images — random stock faces shown beside customer quotes. They are deferred
  with `loading="lazy"` so they no longer compete during load, but they remain a
  third-party origin and, more importantly, a content-integrity question.
- The Supabase query still fetches all 108 rows with `select=*` on a cold load
  (215 KB raw, 55 KB gzipped, ~145 KB of it fields the cards never use). The
  waterfall showed the cost is round-trip latency rather than payload size — the
  request takes ~1.4s on Slow 4G regardless — so trimming the field list is
  worth less than the raw byte count suggests. It is also entangled with search:
  `description` and `amenities` are unused by the cards but feed the keyword
  filter, so dropping them means moving search server-side. Warm loads already
  skip this request entirely.
- Raw HTML still contains zero listings, which is the indexability problem from
  the SEO audit rather than a CWV one.
