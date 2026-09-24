// Bakes real listing HTML into listings.html at build time.
//
// listings.html served zero property content in its raw source — everything was
// fetched and rendered client-side — so a crawler that does not run JavaScript
// saw an empty grid. This writes the cards into the file itself.
//
// Runs as part of `npm run build`, before Tailwind, so the generated markup is
// present when Tailwind scans for class names.
//
// Reads with the public anon key: `properties` is public-read, so no
// server-side secret is involved.
//
// NOTE ON DRIFT: the card template below mirrors buildCard() in listings.html.
// They must stay visually equivalent. They do not have to be byte-identical —
// the client skips re-rendering while data-bake-sig matches, and produces its
// own markup when it does not — but a change to one should be mirrored in the
// other. Both use the #ee-i-* sprite rather than inlining SVGs.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Node 18+ ships a global fetch. Vercel's build image has it; older local
// toolchains (Node 16) do not, so fall back to node:https rather than making
// the build depend on which machine runs it.
const httpGet = (url, headers) => new Promise((resolve, reject) => {
  import('node:https').then(({ default: https }) => {
    https.get(url, { headers }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', c => { body += c; });
      res.on('end', () => resolve({
        ok: res.statusCode >= 200 && res.statusCode < 300,
        status: res.statusCode,
        text: async () => body,
        json: async () => JSON.parse(body),
      }));
    }).on('error', reject);
  }, reject);
});

const fetchJson = typeof fetch === 'function'
  ? (url, opts) => fetch(url, opts)
  : (url, opts) => httpGet(url, (opts && opts.headers) || {});

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = path.join(ROOT, 'listings.html');

const SUPABASE_URL = 'https://ikbwslamhyimdcduojuv.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYndzbGFtaHlpbWRjZHVvanV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODk5NTUsImV4cCI6MjA5MjI2NTk1NX0.KjzD0FJw0rjkAtU7uGmNcFdQv0Fz4S8MbqMOb3vN8r0';
const WA_CENTER = '96171991088';
const SITE = 'https://www.elevateestateslb.com';

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Mirrors the mapping in data.js syncFromSupabase().
const isClosed = r => {
  if (r.sold === true) return true;
  if (r.rented === true) return true;
  const words = [r.deal_status, r.sale_status, r.property_status, r.listing_status, r.availability, r.status]
    .concat(Array.isArray(r.tags) ? r.tags : [])
    .filter(v => typeof v === 'string').map(v => v.trim().toLowerCase());
  return words.some(w => /^sold/.test(w) || /^(rented|leased|let\b)/.test(w));
};

const formatPrice = (price, purpose) => {
  if (!price) return 'Price on request';
  const fmt = new Intl.NumberFormat('en-US').format(price);
  return purpose === 'rent' ? `$${fmt}/mo` : `$${fmt}`;
};

const typeOf = r => ['office', 'warehouse'].includes((r.type || '').toLowerCase())
  ? 'commercial' : (r.type || 'apartment').toLowerCase();

function card(l) {
  const purpose = (l.purpose || 'sale').toLowerCase();
  const tags = Array.isArray(l.tags) ? l.tags.map(t => String(t).toLowerCase()) : [];
  const type = typeOf(l);
  const img = (l.images && l.images[0]) || 'brand_Assets/placeholder.svg';
  const badge = tags.includes('luxury')
    ? '<span class="badge badge-luxury">Luxury</span>'
    : purpose === 'rent'
      ? '<span class="badge badge-rent">For Rent</span>'
      : '<span class="badge badge-sale">For Sale</span>';
  const featured = l.featured
    ? '<span class="badge" style="background:#7A5A0B;color:#FAF0DC;display:flex;align-items:center;gap:4px"><svg width="10" height="10" aria-hidden="true"><use href="#ee-i-star"/></svg>Prime Pick</span>'
    : '';
  const waMsg = `Hi, I'm interested in property ${l.id} — ${l.title}.\n\nListing: ${SITE}/property.html?id=${l.id}`;
  const wa = `https://wa.me/${WA_CENTER}?text=${encodeURIComponent(waMsg)}`;

  return `<article class="listing-card"${l.featured ? ' style="box-shadow:0 0 0 2px #7A5A0B,0 8px 32px rgba(122,90,11,0.18)"' : ''}>`
    + `<a href="property.html?id=${esc(l.id)}" style="text-decoration:none">`
    + `<div class="card-img">`
    + `<img src="${esc(img)}" alt="${esc(l.title)}" loading="lazy" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded');this.style.display='none'">`
    + `<div class="card-overlay"></div>`
    + `<div style="position:absolute;top:10px;left:10px;display:flex;gap:6px;flex-wrap:wrap">${featured}${badge}`
    + `<span class="badge" style="background:#FAF7F3;color:#4E3219;border:1px solid rgba(122,82,48,0.18)">${esc(type.charAt(0).toUpperCase() + type.slice(1))}</span>`
    + `</div></div>`
    + `<div style="padding:1.1rem">`
    + `<div class="card-price">${esc(formatPrice(l.price, purpose))}</div>`
    + `<h3 class="card-title">${esc(l.title)}</h3>`
    + `<p class="card-loc"><svg width="11" height="11" aria-hidden="true"><use href="#ee-i-pin"/></svg>${esc(l.location)}</p>`
    + `<div class="card-meta">`
    + (l.beds > 0 ? `<span>${l.beds} bed</span>` : '')
    + (l.baths > 0 ? `<span>${l.baths} bath</span>` : '')
    + (l.sqm > 0 ? `<span>${l.sqm} m²</span>` : '')
    + `</div>`
    + `<div style="display:flex;align-items:center;justify-content:space-between">`
    + `<div class="ref-block"><span class="ref-label">Ref</span><span class="ref-num">${esc(l.id)}</span></div>`
    + `<a href="${esc(wa)}" class="btn-wa" onclick="event.stopPropagation();trackEvent('whatsapp_click','${esc(l.id)}')">`
    + `<svg width="12" height="12" style="color:#fff" aria-hidden="true"><use href="#ee-i-wa"/></svg>WhatsApp</a>`
    + `</div></div></a></article>`;
}

const res = await fetchJson(
  `${SUPABASE_URL}/rest/v1/properties?listed=eq.true&select=*&order=created_at.desc`,
  { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } },
);
if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
const rows = await res.json();
if (!Array.isArray(rows) || !rows.length) throw new Error('Supabase returned no listings — refusing to bake an empty page');

// Signature describes the SOURCE data (all listed rows), not the baked subset,
// so it is directly comparable with probeSignature() in data.js.
let max = '';
for (const r of rows) if (r.updated_at && r.updated_at > max) max = r.updated_at;
const sig = `${max}|${rows.length}`;

// Closed deals are excluded: sold.html is their home, and llms.txt tells
// crawlers they are not on the browse pages.
const open = rows.filter(r => !isClosed(r));
const closedCount = rows.length - open.length;

const html = fs.readFileSync(TARGET, 'utf8');
for (const marker of ['<!--BAKE:CARDS_START-->', '<!--BAKE:CARDS_END-->', '<!--BAKE:COUNT-->', 'data-bake-sig="']) {
  if (!html.includes(marker)) throw new Error(`listings.html is missing the marker ${marker}`);
}

const cards = open.map(card).join('');
const countText = `${open.length} propert${open.length === 1 ? 'y' : 'ies'} found`;

const out = html
  .replace(/<!--BAKE:CARDS_START-->[\s\S]*?<!--BAKE:CARDS_END-->/,
           `<!--BAKE:CARDS_START-->${cards}<!--BAKE:CARDS_END-->`)
  .replace(/(<span id="result-count"[^>]*>)[\s\S]*?(<\/span>)/,
           `$1<!--BAKE:COUNT-->${countText}$2`)
  .replace(/data-bake-sig="[^"]*"/, `data-bake-sig="${sig}"`);

fs.writeFileSync(TARGET, out);

const kb = n => (n / 1024).toFixed(0);
console.log(`  baked ${open.length} cards into listings.html (${closedCount} closed deal(s) excluded)`);
console.log(`  signature ${sig}`);
console.log(`  listings.html ${kb(html.length)} KB -> ${kb(out.length)} KB`);
