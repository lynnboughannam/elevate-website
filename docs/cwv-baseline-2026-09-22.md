# Core Web Vitals — baseline and measurements

Lab measurements of `https://www.elevateestateslb.com`. The baseline was captured
**before** any performance work; each later measurement is appended under
identical conditions so the deltas mean something. The conditions below matter as
much as the numbers.

| | Baseline | Measurement 2 |
|---|---|---|
| Date | 2026-09-22 | 2026-09-22 |
| Commit | `9a7dcf2` | `1f4cd73` |
| What changed | — | Tailwind precompiled; skeleton shimmer capped |
| Properties live | 108 | 108 |
| Browser | Chromium 147.0.7727.57 headless, puppeteer-core | same |
| Runs per figure | 3, median | 3, median |

## Results

### Mobile — 4× CPU throttle, Slow 4G, 390×844 @ DPR 2

| Metric | Home base | Home now | Listings base | Listings now | Threshold |
|---|---|---|---|---|---|
| **LCP** | 11.82s POOR | **5.43s** POOR | 10.03s POOR | **6.64s** POOR | ≤2.5s / ≤4.0s |
| **INP** | — | — | **2416ms** POOR | **2560ms** POOR | ≤200ms / ≤500ms |
| **CLS** | 0.000 good | 0.000 good | 0.084 good | 0.084 good | ≤0.1 / ≤0.25 |
| FCP | 8.78s POOR | **3.31s** POOR | 5.67s POOR | **1.14s** good | ≤1.8s / ≤3.0s |
| TTFB | 207ms good | 191ms good | 497ms good | 198ms good | ≤800ms / ≤1800ms |
| LCP element | `DIV.hero-bg` | `DIV.hero-bg` | `H3` | `H3` | — |

### Desktop — unthrottled, 1440×900 @ DPR 1

| Metric | Home base | Home now | Listings base | Listings now | Threshold |
|---|---|---|---|---|---|
| LCP | 1.77s good | **1.38s** good | 3.83s needs work | 4.26s POOR | ≤2.5s / ≤4.0s |
| INP | — | — | 136ms good | 144ms good | ≤200ms / ≤500ms |
| CLS | 0.011 good | 0.008 good | 0.016 good | 0.016 good | ≤0.1 / ≤0.25 |
| FCP | 1.05s good | 0.86s good | 0.93s good | 0.74s good | ≤1.8s / ≤3.0s |
| TTFB | 194ms good | 202ms good | 214ms good | 205ms good | ≤800ms / ≤1800ms |
| LCP element | `DIV.hero-bg` | `DIV.hero-bg` | `IMG.loaded` | `IMG.loaded` | — |

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

## Methodology, and four ways measurements went wrong

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

- Mobile LCP remains POOR on both pages.
- The Supabase query still fetches all 108 rows with `select=*` (215 KB, of which
  ~145 KB is fields the cards never use) on every load, and `initStore()` clears
  `localStorage` before each fetch so the cache never serves a warm read.
- Raw HTML still contains zero listings, which is the indexability problem from
  the SEO audit rather than a CWV one.
