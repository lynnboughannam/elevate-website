// Bakes the homepage's featured and recent listings into index.html, and strips
// the "Listings Launching Soon" banner when the site has in fact launched.
//
// WHY: index.html fetched its listings client-side, so a crawler that does not
// run JavaScript saw two empty grids. Worse, the coming-soon banner sits in the
// markup with display:none and is only revealed by JS, so a no-JS reader saw
// empty grids plus the words "Coming Soon / Listings Launching Soon" and
// concluded the site had not launched — which is what Claude and Google's
// first-pass crawler both did, while the coming_soon flag in the database was
// false the whole time.
//
// Two fixes, both at build time:
//   1. Bake 6 featured + 3 recent cards into the marked grid regions.
//   2. When coming_soon is false, remove the banner from the HTML entirely.
//      When it is true, leave it and let the client hide the listings as before.
//
// NOTE ON DRIFT: the cards below are a simplified mirror of buildInvestmentCard()
// and buildCard() in index.html. They do not have to be byte-identical — the
// client overwrites both grids on render — but they must stay visually and
// semantically equivalent, and they must link to /property/<id>.html.
//
// Runs from `npm run build`, before Tailwind, so generated markup is present
// when Tailwind scans for class names.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = path.join(ROOT, 'index.html');

const SUPABASE_URL = 'https://ikbwslamhyimdcduojuv.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYndzbGFtaHlpbWRjZHVvanV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODk5NTUsImV4cCI6MjA5MjI2NTk1NX0.KjzD0FJw0rjkAtU7uGmNcFdQv0Fz4S8MbqMOb3vN8r0';
const WA_CENTER = '96171991088';

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

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const isClosed = r => {
  if (r.sold === true || r.rented === true) return true;
  const words = [r.deal_status, r.sale_status, r.property_status, r.listing_status, r.availability, r.status]
    .concat(Array.isArray(r.tags) ? r.tags : [])
    .filter(v => typeof v === 'string').map(v => v.trim().toLowerCase());
  return words.some(w => /^sold/.test(w) || /^(rented|leased|let\b)/.test(w));
};

const typeOf = r => ['office', 'warehouse'].includes((r.type || '').toLowerCase())
  ? 'commercial' : (r.type || 'apartment').toLowerCase();

const formatPrice = (price, purpose) => {
  if (!price) return 'Price on request';
  const fmt = new Intl.NumberFormat('en-US').format(price);
  return purpose === 'rent' ? `$${fmt}/mo` : `$${fmt}`;
};

// The DB titles are bilingual ("English – Area | العربية"); keep the English half.
const englishHalf = t => String(t || '').split('|')[0].replace(/\s+[–—-]\s*$/, '').trim();

const href = l => `/property/${encodeURIComponent(l.id)}.html`;
const wa = l => `https://wa.me/${WA_CENTER}?text=${encodeURIComponent('Hi, I am interested in ' + l.id)}`;

const specs = l => [
  l.beds > 0 ? `${l.beds} bed` : '',
  l.baths > 0 ? `${l.baths} bath` : '',
  l.sqm > 0 ? `${l.sqm} m²` : '',
].filter(Boolean).join(' · ');

// Dark section (Prime Investment Picks).
function investmentCard(l) {
  const img = (l.images && l.images[0]) || '/brand_Assets/placeholder.svg';
  const title = englishHalf(l.title);
  return `<article style="background:rgba(255,255,255,0.03);border:1px solid rgba(201,168,76,0.15);border-radius:14px;overflow:hidden">
<a href="${esc(href(l))}" style="text-decoration:none;color:inherit;display:block">
<img src="${esc(img)}" alt="${esc(title)} — ${esc(typeOf(l))} for ${l.purpose === 'rent' ? 'rent' : 'sale'} in ${esc(l.location || 'Mount Lebanon')}" width="600" height="400" loading="lazy" style="width:100%;height:210px;object-fit:cover;display:block">
<div style="padding:20px">
<h3 style="font-size:16px;font-weight:700;color:#FAF7F3;margin:0 0 6px;line-height:1.35">${esc(title)}</h3>
<p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 10px">${esc(l.location || 'Mount Lebanon')}, Mount Lebanon</p>
<p style="font-size:19px;font-weight:700;color:#C9A84C;margin:0 0 10px">${esc(formatPrice(l.price, l.purpose))}</p>
${specs(l) ? `<p style="font-size:12px;color:rgba(255,255,255,0.45);margin:0 0 10px">${esc(specs(l))}</p>` : ''}
<p style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin:0">Ref ${esc(l.id)}</p>
</div></a>
<div style="padding:0 20px 18px"><a href="${esc(wa(l))}" style="font-size:12px;font-weight:700;color:#C9A84C;text-decoration:none">Enquire on WhatsApp</a></div>
</article>`;
}

// Light section (Latest Listings).
function recentCard(l) {
  const img = (l.images && l.images[0]) || '/brand_Assets/placeholder.svg';
  const title = englishHalf(l.title);
  return `<article style="background:#FAF7F3;border:1px solid rgba(122,82,48,0.12);border-radius:14px;overflow:hidden">
<a href="${esc(href(l))}" style="text-decoration:none;color:inherit;display:block">
<img src="${esc(img)}" alt="${esc(title)} — ${esc(typeOf(l))} for ${l.purpose === 'rent' ? 'rent' : 'sale'} in ${esc(l.location || 'Mount Lebanon')}" width="600" height="400" loading="lazy" style="width:100%;height:200px;object-fit:cover;display:block">
<div style="padding:18px">
<h3 style="font-size:16px;font-weight:700;color:#2E1F0E;margin:0 0 6px;line-height:1.35">${esc(title)}</h3>
<p style="font-size:13px;color:#7A5230;margin:0 0 10px">${esc(l.location || 'Mount Lebanon')}, Mount Lebanon</p>
<p style="font-size:19px;font-weight:700;color:#4E3219;margin:0 0 10px">${esc(formatPrice(l.price, l.purpose))}</p>
${specs(l) ? `<p style="font-size:12px;color:#7A5230;margin:0 0 10px">${esc(specs(l))}</p>` : ''}
<p style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#A87850;margin:0">Ref ${esc(l.id)}</p>
</div></a>
<div style="padding:0 18px 16px"><a href="${esc(wa(l))}" style="font-size:12px;font-weight:700;color:#7A5230;text-decoration:none">Enquire on WhatsApp</a></div>
</article>`;
}

const headers = { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` };

const res = await fetchJson(
  `${SUPABASE_URL}/rest/v1/properties?listed=eq.true&select=*&order=created_at.desc`, { headers });
if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
const rows = await res.json();
if (!Array.isArray(rows) || !rows.length) {
  throw new Error('Supabase returned no listings — refusing to bake an empty homepage');
}

// The banner is only correct when the site really has not launched.
const sres = await fetchJson(
  `${SUPABASE_URL}/rest/v1/site_settings?key=eq.coming_soon&select=value`, { headers });
if (!sres.ok) throw new Error(`site_settings fetch failed: ${sres.status}`);
const srows = await sres.json();
const comingSoon = Array.isArray(srows) && srows[0] && String(srows[0].value) === 'true';

const open = rows.filter(r => !isClosed(r));
// Mirrors renderHome(): 6 featured, then 3 most recent non-featured.
const featured = open.filter(l => l.featured).slice(0, 6);
const recent = open.filter(l => !l.featured).slice(0, 3);

let html = fs.readFileSync(TARGET, 'utf8');
for (const m of ['<!--BAKE:FEATURED_START-->', '<!--BAKE:FEATURED_END-->',
                 '<!--BAKE:RECENT_START-->', '<!--BAKE:RECENT_END-->',
                 '<!--BAKE:COMINGSOON_START-->', '<!--BAKE:COMINGSOON_END-->']) {
  if (!html.includes(m)) throw new Error(`index.html is missing the marker ${m}`);
}

html = html
  .replace(/<!--BAKE:FEATURED_START-->[\s\S]*?<!--BAKE:FEATURED_END-->/,
           `<!--BAKE:FEATURED_START-->${featured.map(investmentCard).join('')}<!--BAKE:FEATURED_END-->`)
  .replace(/<!--BAKE:RECENT_START-->[\s\S]*?<!--BAKE:RECENT_END-->/,
           `<!--BAKE:RECENT_START-->${recent.map(recentCard).join('')}<!--BAKE:RECENT_END-->`);

if (comingSoon) {
  console.log('  coming_soon is TRUE — banner left in place');
} else {
  html = html.replace(/<!--BAKE:COMINGSOON_START-->[\s\S]*?<!--BAKE:COMINGSOON_END-->/,
    '<!--BAKE:COMINGSOON_START--><!-- banner removed at build time: coming_soon is false --><!--BAKE:COMINGSOON_END-->');
  console.log('  coming_soon is FALSE — banner stripped from the HTML');
}

fs.writeFileSync(TARGET, html);

// Match the rendered heading, not the phrase, so the explanatory comment in
// index.html does not trip this.
if (/>\s*Listings Launching Soon\s*</.test(html) && !comingSoon) {
  throw new Error('"Listings Launching Soon" is still in index.html after the strip');
}
console.log(`  baked ${featured.length} featured + ${recent.length} recent cards into index.html`);
