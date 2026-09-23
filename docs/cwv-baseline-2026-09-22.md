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

## Measurement 6 — the DevTools trace, and a null result on INP

Commit `f1f305a`, 2026-09-23. A full trace was taken across one filter tap on
mobile listings at 4× CPU, since the CPU profile had already ruled out
JavaScript at ~0.5% of time.

**Paint dominates, and it is not reflow.** Over the interaction:

| Event | Count | Total ms |
|---|---|---|
| **Paint** | **1305** | **1275.0** |
| UpdateLayoutTree (style recalc) | 280 | 294.7 |
| Layerize | 277 | 152.5 |
| PrePaint | 288 | 133.1 |
| Commit | 276 | 105.1 |
| FunctionCall (site JS) | 4 | 51.1 |
| **Layout** | **5** | **21.6** |

`invalidationTracking` attributed it outright:

```
1044x  StyleRecalcInvalidationTracking | Animation | DIV class='card-img'
 278x  StyleRecalcInvalidationTracking | Animation | ::before
  50x  StyleRecalcInvalidationTracking | Animation | IMG class='loaded'
```

Isolating each animation:

| Arm | Paint ms | Paint events |
|---|---|---|
| as deployed | 1665 | 1847 |
| **card animation off** | **261** | **86** |
| WhatsApp pulse off | 2577 | 1743 |
| both off | 409 | 87 |

The card skeleton was ~84% of paint time and ~95% of paint events. The
`::before` entries are the WhatsApp button's infinite pulse: 278 invalidations
but measurably irrelevant, because it is a 56px element.

**Why the earlier iteration cap had not solved it.** The cap applies per
*element*, and `renderListings()` replaces `grid.innerHTML` on every filter
change, so each tap built fresh nodes that started the animation again from
zero. Confirmed directly:

```
16s after load (cap is 12s) : {cards:6, animRunning:0, imgLoaded:4}
600ms after a filter tap    : {cards:6, animRunning:2, imgLoaded:4}
5.1s after that tap         : {cards:6, animRunning:2, imgLoaded:4}
```

The two that keep running are the cards whose lazy below-fold images never
load, so `:has(img.loaded)` never fires and they run the full 12s.

Replaced with a static gradient placeholder. Verified: 0 cards animating after
taps, against 4–5 before.

### The INP result: unchanged

Measured by the documented methodology, both arms in one session:

```
  animated (previous)  INP runs [1128, 112, 1096]  median 1096ms
  static (deployed)    INP runs [1096, 1144, 128]  median 1096ms
```

**No change.** The paint work was real and is genuinely gone, but it was not
what INP was measuring.

This is the second attempt on this animation to produce no INP movement. The
first (M2) was justified by a single-run A/B and retracted as noise. This one
rests on a trace and holds up *as a paint claim* — Paint 1665ms → 261ms is
solid — but the INP outcome is the same null, and the better evidence does not
change that. The fix is still worth keeping: a permanently animating skeleton
that restarts on every interaction is a defect regardless of which metric names
it.

### The new lead: INP is bimodal

Interactions are either ~110ms or ~1100–1600ms, never in between. Logging every
tap shows the slow one is reproducibly the *first* tap that actually changes the
result set:

```
  tap 1 "All"          worst     0ms   -> 108 properties found
  tap 2 "For Sale"     worst  1608ms   -> 90 properties found
  tap 3 "For Rent"     worst   112ms   -> 18 properties found
  tap 4 "All"          worst     0ms   -> 18 properties found
  tap 5 "Apartment"    worst     0ms   -> 9 properties found
  tap 6 "Commercial"   worst  3192ms   -> 8 properties found
```

Later taps change the result set just as much and stay fast, so this is a
one-time cost on first re-render, not proportional to the work done. New image
requests were 2 on fast and slow taps alike, so it is not image fetching.
`:has()` was tested as a suspect and ruled out (1184ms vs 1216ms).

## M7 — scoped traces, and the diff/patch confirmation test

2026-09-23. Two follow-ups to M6: traces scoped to a single interaction, and a
throwaway build to test the fix before committing to it.

### The "first tap is slow" pattern was not real

M6 suggested the slow interaction was reproducibly the first tap that changed
the result set. Testing it by swapping which chip goes first refutes that:

| | A tap1 (first) | A tap2 (later) | B tap1 (first) | B tap2 (later) |
|---|---|---|---|---|
| Layout | 139.4 | **302.4** | 94.3 | 47.3 |
| UpdateLayoutTree | 306.6 | 257.6 | 219.0 | 295.2 |
| Paint | 593.5 | 231.9 | 337.0 | 158.9 |

No first-versus-later pattern — the largest Layout is on a *later* tap, and in
session B neither tap was slow. The M6 reading came from two runs of a six-tap
sequence; it was a pattern read into noise. No first-call overhead, no cold
library, no one-time layer promotion.

### What is consistent: one long task per tap

Every interaction is a single main-thread task of 246–553ms with the same shape.
The slow one, broken down:

```
longest RunTask: 445.3ms
  EventDispatch       15x  114.1ms   (max 112.8 — the handler)
   └ v8.callFunction   1x  111.0ms
      └ FunctionCall   1x   98.9ms   ← renderListings
  ParseHTML            6x   38.9ms   ← innerHTML being parsed
  UpdateLayoutTree     4x   65.9ms
  Layout               1x  113.8ms   ← dirtyObjects=369 totalObjects=598
  Paint                4x   88.5ms
```

`dirtyObjects=369 / totalObjects=598`, `partialLayout=false`, on every tap:
`grid.innerHTML = page.map(buildCard).join('')` destroys and recreates the whole
subtree, so the browser re-lays-out essentially the whole page to change six
cards.

### The confirmation test

A throwaway branch (`perf/diff-render-test`, commit `f22c881`, not for merge)
replaced the innerHTML rebuild with rough keyed reconciliation: reuse the
existing `<article>` for any listing already on screen, build nodes only for
genuinely new ones. Both versions served from the same local server, one tap
traced at a time:

| version | tap | cards changed | rebuilt | dirtyObjects/total | Layout ms | ParseHTML | Paint ms |
|---|---|---|---|---|---|---|---|
| full | For Sale | 2/6 | all 6 | **369**/598 | 64.9 | 28.7 | 209.2 |
| diff | For Sale | 2/6 | **2** | **168**/609 | **26.1** | **5.9** | 198.4 |
| full | For Rent | 6/6 | all 6 | 321/550 | 100.5 | 25.9 | 151.3 |
| diff | For Rent | 6/6 | 6 | 321/561 | 88.0 | 13.4 | 126.6 |

**Diagnosis confirmed.** When only 2 of 6 cards genuinely change, dirtyObjects
falls 369 → 168 (−54%), Layout 64.9 → 26.1ms (−60%), ParseHTML 28.7 → 5.9ms
(−79%). When all 6 change, dirtyObjects is identical at 321 — exactly as it
should be, since everything really did change.

**But it also bounds the win.** Paint barely moves (209 → 198ms, 151 → 127ms):
it is driven by the visible area, not by how many nodes were touched. And
filters that swap the entire visible page — which purpose filters do — get
nothing from diffing. The benefit is real but proportional to result-set
overlap, so a production diff/patch is worth building and will not be a silver
bullet.

The INP figures from this test (176–328ms) are **not** comparable to the ~1100ms
baseline: localhost, no network emulation, tracing active. The dirtyObjects,
Layout and ParseHTML comparisons are the valid result.

### Reversing the earlier recommendation against diff/patch

An earlier note here argued against diff/patch because the CPU profile put site
JavaScript at ~0.5% of time. That was wrong, and the reason is instructive:
**the profile aggregated across ~14 seconds that were mostly idle.** Averaged
over that window the JS looks negligible, and it genuinely is as *execution*.
What the wide scope hid is that the JS is the **cause** of the Layout,
ParseHTML and Paint that follow it inside the same task. Scoping the trace to
one interaction makes the chain visible.

The lesson for later profiling here: **scope a profile to the interaction being
diagnosed.** A whole-session profile answers "what is the CPU doing?", not "what
is this interaction doing?", and for INP only the second question matters.

## M8 — decision on diff/patch: deferred, with the reasoning

2026-09-23. The M7 test confirmed diff/patch works; the question was whether
real filter behaviour makes it worth building. It is not, yet.

### There is no usage data, and the tracking is broken

`click_events` returns **404 on read and on write** — the table does not exist.
`trackEvent()` swallows the failure with `.catch(() => {})`, so every WhatsApp
and phone click has been silently discarded since launch, and the admin panel's
"Click analytics" section reads the same missing table. No GA, GTM, Plausible or
Meta Pixel either. Separately, all nine `trackEvent` call sites are WhatsApp or
phone clicks — **filters were never instrumented**, so even a working table
would not answer this.

### Estimate from stock composition

Simulating the real `getFiltered()` against all 108 listings. Stock is heavily
concentrated: apartments 92/108 (85%), sale 90/108 (83%), and **18 of 24 areas
hold ≤6 listings**, so an area filter usually lands on one page of entirely
different properties.

| Transition | Results | Page-1 cards kept |
|---|---|---|
| All → type=apartment | 92 | 5/6 |
| All → beds≥3 | 82 | 5/6 |
| All → purpose=sale | 90 | 4/6 |
| All → purpose=rent | 18 | 2/6 |
| All → area=Hazmieh | 21 | 3/6 |
| All → area=Jamhour | 14 | 0/6 |
| All → area=Yarzeh | 10 | 0/6 |
| All → type=land / duplex / villa / shop | 1–4 | 0/6 |

**Mean 1.8 of 6 preserved across 20 sampled transitions; half preserve zero.**

### Why that is not good enough

The high-overlap transitions are the ones that do the least work for the user.
Filtering to "apartment" keeps 5/6 cards *because 85% of stock is already
apartments* — barely a narrowing. The filters that genuinely narrow, above all
area, return 0/6. **Diff/patch helps most exactly where the filter matters
least.**

Combined with the M7 ceiling — even at 4/6 kept, Layout fell 60% and ParseHTML
79% but Paint only 5%, and Paint is the largest single component — the expected
value does not justify a multi-day rewrite.

### Decision

Deferred. Logged as a known, bounded improvement with a working reference
implementation on branch `perf/diff-render-test` (`f22c881`, local only, not
merged).

**Revisit when any of these change:**

- Filter usage is instrumented and shows users narrowing within a category
  (type → area → beds) rather than toggling purpose.
- Stock diversifies. The 85% apartment / 83% sale concentration is what makes
  the useful filters zero-overlap; a broader mix raises reuse.
- `ITEMS_PER_PAGE` rises above 6. More cards per page means more absolute
  savings per reused card.

**The cheaper next step** is to create `click_events` and instrument
`applyChip()` — roughly an hour, restores conversion tracking that is currently
zero, and converts this decision from inference to measurement within weeks.

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

`renderListings()` itself costs ~100ms per call.

Ruled out by direct measurement so far:

| Suspect | How it was ruled out |
|---|---|
| ~~Site JavaScript~~ | ~~0.5% of CPU profile~~ — **reversed in M7**: the profile was scoped too wide. The JS is the cause of the Layout/Paint that follow it in the same task. |
| Images | Blocked all image requests — INP 2544ms, no change |
| Tap congestion | Spacing taps 4s apart made it *worse* (5880ms) |
| Tailwind MutationObserver | Blocked the CDN — INP 2408ms, no change |
| The card skeleton animation | Removed it — Paint −84%, INP unchanged (M6) |
| `:has(img.loaded)` | 1184ms vs 1216ms with it overridden |

**M7 resolved this.** The cause is the wholesale `innerHTML` rebuild on every
filter change: one main-thread task containing the handler, HTML parsing, style
recalc, a full-page Layout over ~600 objects, and Paint. The M6 "first tap"
lead was a false pattern and is withdrawn.

Remaining unknown is not the mechanism but the ceiling: diffing cuts
dirtyObjects proportionally to result-set overlap, and does nothing when a
filter swaps the whole visible page. How much that helps in practice depends on
how users actually filter, which is not known from lab runs.

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

- **Mobile INP, ~1100ms against a 200ms threshold** — the only metric still
  failing. Cause identified in M7 (wholesale `innerHTML` rebuild per filter
  change); fix confirmed but **deferred in M8** because real filter behaviour
  does not support it yet. See M8 for the revisit conditions. Everything else is
  "good" or within a rounding error.
- **Click tracking is broken and has always been.** `click_events` does not
  exist, so `trackEvent()` has silently discarded every WhatsApp and phone click
  since launch, and the admin analytics panel reads nothing. This is a data
  loss, not a performance issue, and is the cheapest high-value fix outstanding.
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
