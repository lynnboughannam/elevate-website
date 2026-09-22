# Core Web Vitals baseline — 22 September 2026

Lab baseline captured **before** any work on the listings rendering architecture.
The point of this file is to make the after-comparison exact, so the conditions
below matter as much as the numbers.

| | |
|---|---|
| Date | 2026-09-22 |
| Site | `https://www.elevateestateslb.com` |
| Commit measured | `9a7dcf2` |
| Properties live at capture | 108 |
| Browser | Chromium 147.0.7727.57 (headless), driven via puppeteer-core |
| Runs per figure | 3, median reported |

## Results

### Mobile — 4× CPU throttle, Slow 4G, 390×844 @ DPR 2

| Metric | Home | Listings | Threshold (good / needs work) |
|---|---|---|---|
| **LCP** | **11.82s** POOR | **10.03s** POOR | ≤2.5s / ≤4.0s |
| **INP** | **2416ms** POOR | — | ≤200ms / ≤500ms |
| **CLS** | 0.000 good | 0.084 good | ≤0.1 / ≤0.25 |
| FCP | 8.78s POOR | 5.67s POOR | ≤1.8s / ≤3.0s |
| TTFB | 207ms good | 497ms good | ≤800ms / ≤1800ms |
| Page weight | 1361 KB / 38 requests | 1555 KB / 37 requests | — |
| LCP element | `DIV.hero-bg` | `H3` | — |

### Desktop — unthrottled, 1440×900 @ DPR 1

| Metric | Home | Listings | Threshold (good / needs work) |
|---|---|---|---|
| LCP | 1.77s good | 3.83s needs work | ≤2.5s / ≤4.0s |
| INP | 136ms good | — | ≤200ms / ≤500ms |
| CLS | 0.011 good | 0.016 good | ≤0.1 / ≤0.25 |
| FCP | 1.05s good | 0.93s good | ≤1.8s / ≤3.0s |
| TTFB | 194ms good | 214ms good | ≤800ms / ≤1800ms |
| Page weight | 3122 KB / 42 requests | 2045 KB / 36 requests | — |
| LCP element | `DIV.hero-bg` | `IMG.loaded` | — |

INP was measured on `listings.html` for both profiles (it needs interactive
controls; the filter chips are the realistic interaction).

## Reading of the baseline

TTFB is strong everywhere — 194–497ms — so the hosting and edge are not the
problem. Everything expensive happens after the HTML arrives:

1. `cdn.tailwindcss.com` compiles CSS in the browser on every page load.
2. `data.js` then fetches all listings from Supabase.
3. `renderListings()` builds every card synchronously and writes the DOM.

That sequence is what pushes mobile LCP past 10 seconds while TTFB stays under
half a second.

**Mobile INP of 2416ms is the worst single number here** — 12× the "good"
threshold. Tapping a filter chip blocks the main thread for over two seconds
because `renderListings()` re-renders the full card set synchronously on every
filter change, under mid-range-phone CPU.

CLS is genuinely fine and should be protected by whatever replaces the current
rendering: 0.084 on mobile listings is inside budget but not by a wide margin,
and listing images carry no intrinsic `width`/`height`.

## Methodology, and three ways the first attempts were wrong

Recorded because the first two harness runs produced confidently wrong numbers,
and a later comparison run the same wrong way would appear to show a huge win.

**1. Warm cache made everything look instant.** The first run reused one browser
across all runs, reporting *LCP 0.69s, 1 KB transferred over 7 requests* — for a
77 KB page that loads Tailwind, Google Fonts and remote images. Fix: a fresh
incognito browser context per run plus CDP `Network.setCacheDisabled`. Page
weight went from a nonsensical 1 KB to a real 1.3–3.1 MB.

**2. LCP must be read before any interaction.** A click finalises the LCP entry,
so interacting first and reading after yields a truncated value. The harness now
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
  elements. Only after tapping the toggle open did the real figure appear: 21
  interactions, **2416ms**.

Page weight is taken from CDP `Network.loadingFinished` (`encodedDataLength`),
not `PerformanceResourceTiming.transferSize`, which reports 0 for cached and
opaque cross-origin responses.

### Exact conditions to reproduce

```
Mobile   viewport 390×844, DPR 2, isMobile + hasTouch
         Emulation.setCPUThrottlingRate    rate: 4
         Network.emulateNetworkConditions  down 1.6 Mbps, up 750 Kbps, latency 150ms
Desktop  viewport 1440×900, DPR 1, no CPU or network throttling

Both     Network.setCacheDisabled: true
         fresh incognito browser context per run
         wait: load event + 9s settle (covers the Supabase fetch and render)
         3 runs, median
INP      listings.html only; mobile taps .mobile-filter-btn first, then 6
         .filter-chip taps; desktop clicks 6 chips plus #sort-select
```

## Caveats

These are **lab** figures from one machine and one network profile. Google ranks
on **field** data (CrUX), gathered from real visitors on real devices, which will
differ — usually worse on mobile, since real phones are more varied than a 4×
throttle. Once the site has enough traffic to appear in CrUX, prefer that over
this file for anything ranking-related.

This baseline is for measuring the *delta* from the rendering work under
identical conditions, which is what it is good for.
