// Pre-renders one static HTML file per listing into /property/.
//
// WHY: property.html is a single shell that reads ?id= and builds the whole page
// client-side. A crawler that does not run JavaScript sees the same
// "Property Details — Elevate Estates" title and the same empty body for all 105
// listings, so Google treats them as one duplicated page and indexes none of
// them. The listings are the only unique, local, long-form content on the site —
// they are the reason the site could rank at all.
//
// This writes /property/<ID>.html with the title, description, canonical, OG
// tags, JSON-LD and body copy already in the markup. The existing client script
// still hydrates the interactive page on top; the baked copy is what crawlers
// and social unfurlers read.
//
// The generated files live one directory down, so root-relative rewriting of
// asset paths is part of the transform (see toRootRelative).
//
// Runs from `npm run build`, before Tailwind, so generated markup is present
// when Tailwind scans for class names.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE = path.join(ROOT, 'property.html');
const OUT_DIR = path.join(ROOT, 'property');

const SUPABASE_URL = 'https://ikbwslamhyimdcduojuv.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYndzbGFtaHlpbWRjZHVvanV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODk5NTUsImV4cCI6MjA5MjI2NTk1NX0.KjzD0FJw0rjkAtU7uGmNcFdQv0Fz4S8MbqMOb3vN8r0';
const SITE = 'https://www.elevateestateslb.com';

// Node 18+ has global fetch; Node 16 does not. Mirrors bake-listings.mjs.
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

// Mirrors isClosed() in bake-listings.mjs.
const isClosed = r => {
  if (r.sold === true || r.rented === true) return true;
  const words = [r.deal_status, r.sale_status, r.property_status, r.listing_status, r.availability, r.status]
    .concat(Array.isArray(r.tags) ? r.tags : [])
    .filter(v => typeof v === 'string').map(v => v.trim().toLowerCase());
  return words.some(w => /^sold/.test(w) || /^(rented|leased|let\b)/.test(w));
};

const typeOf = r => ['office', 'warehouse'].includes((r.type || '').toLowerCase())
  ? 'commercial' : (r.type || 'apartment').toLowerCase();

const money = n => new Intl.NumberFormat('en-US').format(n);

// The DB titles are bilingual: "English name – Area | العربية". Google shows
// roughly 60 characters, so lead with the English half plus the facts a searcher
// actually types, and keep the Arabic out of the <title>.
function englishHalf(title) {
  return String(title || '').split('|')[0].replace(/\s+[–—-]\s*$/, '').trim();
}

function metaTitle(l) {
  const purpose = l.purpose === 'rent' ? 'for Rent' : 'for Sale';
  const type = typeOf(l).charAt(0).toUpperCase() + typeOf(l).slice(1);
  const bed = l.beds > 0 ? `${l.beds}-Bedroom ` : '';
  const loc = l.location ? ` in ${l.location}` : '';
  const base = `${bed}${type} ${purpose}${loc}`;
  // Reference number helps people who search the ref directly.
  return `${base} | ${l.id} — Elevate Estates`;
}

function metaDescription(l) {
  const bits = [];
  if (l.sqm > 0) bits.push(`${l.sqm} m²`);
  if (l.beds > 0) bits.push(`${l.beds} bed`);
  if (l.baths > 0) bits.push(`${l.baths} bath`);
  const specs = bits.join(', ');
  const price = l.price
    ? (l.purpose === 'rent' ? `$${money(l.price)}/month` : `$${money(l.price)}`)
    : 'Price on request';
  const where = l.location ? `${l.location}, Mount Lebanon` : 'Mount Lebanon';
  const lead = `${typeOf(l)} ${l.purpose === 'rent' ? 'for rent' : 'for sale'} in ${where}`;
  const head = lead.charAt(0).toUpperCase() + lead.slice(1);
  // Trim the DB description to fill out the snippet without running long.
  const extra = String(l.description || '')
    .replace(/\s+/g, ' ')
    .replace(/[✨\u{1F4CD}\u{1F4CF}\u{1F6CF}\u{1F6C1}\u{1F697}\u{1F31F}]/gu, '')
    .trim();
  let out = `${head}. ${specs ? specs + '. ' : ''}${price}. Ref ${l.id}. `;
  const room = 158 - out.length;
  if (room > 40 && extra) out += extra.slice(0, room - 1).trim() + '…';
  else out += 'WhatsApp Elevate Estates to arrange a viewing.';
  return out.slice(0, 160);
}

function jsonLd(l) {
  const avail = isClosed(l)
    ? 'https://schema.org/SoldOut'
    : 'https://schema.org/InStock';
  const obj = {
    '@context': 'https://schema.org',
    '@type': ['RealEstateListing', 'Product'],
    '@id': `${SITE}/property/${l.id}.html#listing`,
    name: englishHalf(l.title) || metaTitle(l),
    description: String(l.description || '').replace(/\s+/g, ' ').trim().slice(0, 600),
    url: `${SITE}/property/${l.id}.html`,
    sku: l.id,
    identifier: l.id,
    image: (l.images || []).slice(0, 8),
    datePosted: l.created_at,
    provider: { '@id': `${SITE}/#organization` },
  };
  if (l.price) {
    obj.offers = {
      '@type': 'Offer',
      price: l.price,
      priceCurrency: 'USD',
      availability: avail,
      url: `${SITE}/property/${l.id}.html`,
      seller: { '@id': `${SITE}/#organization` },
    };
    if (l.purpose === 'rent') {
      obj.offers.priceSpecification = {
        '@type': 'UnitPriceSpecification',
        price: l.price,
        priceCurrency: 'USD',
        unitCode: 'MON',
      };
    }
  }
  if (l.location) {
    obj.address = {
      '@type': 'PostalAddress',
      addressLocality: l.location,
      addressRegion: 'Mount Lebanon',
      addressCountry: 'LB',
    };
  }
  if (l.sqm > 0) {
    obj.floorSize = { '@type': 'QuantitativeValue', value: l.sqm, unitCode: 'MTK' };
  }
  if (l.beds > 0) obj.numberOfBedrooms = l.beds;
  if (l.baths > 0) obj.numberOfBathroomsTotal = l.baths;
  return JSON.stringify(obj, null, 2);
}

function breadcrumbLd(l) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Properties', item: `${SITE}/listings.html` },
      { '@type': 'ListItem', position: 3, name: englishHalf(l.title) || l.id },
    ],
  }, null, 2);
}

// Crawler-visible copy. The client script replaces #page-content on hydrate, so
// this is what a no-JS fetch reads and nothing more.
function bakedBody(l) {
  const purpose = l.purpose === 'rent' ? 'For Rent' : 'For Sale';
  const type = typeOf(l).charAt(0).toUpperCase() + typeOf(l).slice(1);
  const price = l.price
    ? (l.purpose === 'rent' ? `$${money(l.price)}/month` : `$${money(l.price)}`)
    : 'Price on request';
  const specs = [
    l.beds > 0 ? `${l.beds} bedrooms` : '',
    l.baths > 0 ? `${l.baths} bathrooms` : '',
    l.sqm > 0 ? `${l.sqm} m²` : '',
    l.parking > 0 ? `${l.parking} parking` : '',
  ].filter(Boolean);
  const amen = (l.amenities || []).filter(Boolean);
  const desc = String(l.description || '').replace(/\s+/g, ' ').trim();
  const img = (l.images || [])[0];

  return `<div id="baked-content" style="max-width:1100px;margin:0 auto;padding:2.5rem 1.5rem">
  <nav aria-label="Breadcrumb" style="font-size:13px;color:#7A5230;margin-bottom:1rem">
    <a href="/" style="color:#7A5230">Home</a> ›
    <a href="/listings.html" style="color:#7A5230">Properties</a> ›
    <span>${esc(l.location || 'Lebanon')}</span>
  </nav>
  <h1 class="font-display" style="font-size:clamp(28px,4vw,44px);line-height:1.15;letter-spacing:-0.02em;margin:0 0 .75rem">${esc(englishHalf(l.title))}</h1>
  <p style="font-size:15px;color:#7A5230;margin:0 0 1rem">${esc(type)} ${esc(purpose)} in ${esc(l.location || 'Mount Lebanon')}, Mount Lebanon, Lebanon · Reference ${esc(l.id)}</p>
  <p style="font-size:26px;font-weight:700;margin:0 0 1.25rem">${esc(price)}</p>
  ${img ? `<img src="${esc(img)}" alt="${esc(englishHalf(l.title))} — ${esc(type)} ${esc(purpose)} in ${esc(l.location || 'Mount Lebanon')}" width="1200" height="800" style="width:100%;max-width:900px;height:auto;border-radius:14px;margin-bottom:1.5rem" loading="eager">` : ''}
  ${specs.length ? `<h2 style="font-size:19px;margin:1.5rem 0 .5rem">Property details</h2><ul style="line-height:1.7;color:#4E3219">${specs.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
  ${desc ? `<h2 style="font-size:19px;margin:1.5rem 0 .5rem">About this property</h2><div style="line-height:1.7;color:#4E3219;white-space:pre-line;max-width:70ch">${esc(desc)}</div>` : ''}
  ${amen.length ? `<h2 style="font-size:19px;margin:1.5rem 0 .5rem">Amenities</h2><ul style="line-height:1.7;color:#4E3219">${amen.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
  <h2 style="font-size:19px;margin:1.5rem 0 .5rem">Arrange a viewing</h2>
  <p style="line-height:1.7;color:#4E3219;max-width:70ch">Quote reference <strong>${esc(l.id)}</strong> when you get in touch. Elevate Estates handles viewings and negotiation for properties across Baabda, Hazmieh, Biyada and the wider Mount Lebanon area.</p>
  <p><a href="https://wa.me/96171991088?text=${encodeURIComponent('Hi, I am interested in ' + l.id)}" style="color:#7A5230;font-weight:700">WhatsApp +961 71 991 088</a></p>
</div>`;
}

// Generated pages sit in /property/, so same-directory relative asset paths in
// the template would resolve to /property/<asset> and 404. Rewrite them to
// root-absolute. Leaves absolute URLs, anchors, and protocol links alone.
function toRootRelative(html) {
  return html.replace(/\b(href|src)="(?!https?:|\/\/|\/|#|mailto:|tel:|data:|javascript:)([^"]+)"/g,
    (_m, attr, url) => `${attr}="/${url}"`);
}

const res = await fetchJson(
  `${SUPABASE_URL}/rest/v1/properties?listed=eq.true&select=*&order=created_at.desc`,
  { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } },
);
if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
const rows = await res.json();
if (!Array.isArray(rows) || !rows.length) {
  throw new Error('Supabase returned no listings — refusing to bake empty property pages');
}

let template = fs.readFileSync(TEMPLATE, 'utf8');
if (!template.includes('id="page-content"')) {
  throw new Error('property.html is missing #page-content — cannot bake');
}
template = toRootRelative(template);

fs.mkdirSync(OUT_DIR, { recursive: true });
// Clear stale pages so a delisted property stops being served.
for (const f of fs.readdirSync(OUT_DIR)) {
  if (f.endsWith('.html')) fs.unlinkSync(path.join(OUT_DIR, f));
}

const written = [];
for (const l of rows) {
  const title = metaTitle(l);
  const desc = metaDescription(l);
  const canonical = `${SITE}/property/${l.id}.html`;
  const ogImage = (l.images || [])[0] || `${SITE}/brand_Assets/og/og-apartment.jpg`;

  let out = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`)
    .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${esc(ogImage)}">`)
    .replace(/<meta property="og:type" content="[^"]*">/, `<meta property="og:type" content="product">`);

  // Canonical + structured data + the id the client script reads.
  const head = `  <link rel="canonical" href="${esc(canonical)}">
  <meta property="og:url" content="${esc(canonical)}">
  <script>window.__LISTING_ID__ = ${JSON.stringify(l.id)};</script>
  <script type="application/ld+json">
${jsonLd(l)}
  </script>
  <script type="application/ld+json">
${breadcrumbLd(l)}
  </script>
</head>`;
  out = out.replace('</head>', head);

  // Seed #page-content with the crawler copy.
  out = out.replace(/(<div id="page-content"[^>]*>)/, `$1\n${bakedBody(l)}\n`);
  if (!out.includes('id="baked-content"')) {
    throw new Error(`failed to inject baked body for ${l.id}`);
  }

  fs.writeFileSync(path.join(OUT_DIR, `${l.id}.html`), out);
  written.push(l);
}

const kb = n => (n / 1024).toFixed(0);
const bytes = written.reduce((a, l) => a + fs.statSync(path.join(OUT_DIR, `${l.id}.html`)).size, 0);
console.log(`  baked ${written.length} property pages into /property/ (${kb(bytes)} KB total)`);

// Hand the id list to the sitemap generator.
fs.writeFileSync(
  path.join(ROOT, 'scripts', '.baked-properties.json'),
  JSON.stringify(written.map(l => ({
    id: l.id,
    updated_at: l.updated_at || l.created_at,
    closed: isClosed(l),
  })), null, 2),
);
