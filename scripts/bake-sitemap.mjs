// Regenerates sitemap.xml from the pages that actually exist on disk.
//
// WHY: the hand-maintained sitemap listed five URLs, one of which (/sold.html)
// returned 404 in production, and it omitted every property page because they
// used to be query-string URLs off a single shell. Now that /property/<id>.html
// files are pre-rendered, the listings are the bulk of the site's indexable
// surface and belong in the sitemap.
//
// Closed deals (sold / rented) are excluded: they are a closed record on
// sold.html, not something to surface in search as available stock.
//
// Runs from `npm run build`, after the property bake writes .baked-properties.json.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.elevateestateslb.com';
const MANIFEST = path.join(ROOT, 'scripts', '.baked-properties.json');

const today = new Date().toISOString().slice(0, 10);

// Static pages, with the lastmod taken from the file so it stays honest.
const staticPages = [
  { file: 'index.html', loc: '/', changefreq: 'weekly', priority: '1.0' },
  { file: 'listings.html', loc: '/listings.html', changefreq: 'daily', priority: '0.9' },
  { file: 'sold.html', loc: '/sold.html', changefreq: 'weekly', priority: '0.5' },
  { file: 'submit.html', loc: '/submit.html', changefreq: 'monthly', priority: '0.7' },
  { file: 'agent-apply.html', loc: '/agent-apply.html', changefreq: 'monthly', priority: '0.6' },
];

const entries = [];
const skipped = [];

for (const p of staticPages) {
  const abs = path.join(ROOT, p.file);
  // A URL in the sitemap that 404s costs trust in the whole file — only list
  // pages that are actually present in the deploy.
  if (!fs.existsSync(abs)) { skipped.push(p.file); continue; }
  entries.push({
    loc: SITE + p.loc,
    lastmod: fs.statSync(abs).mtime.toISOString().slice(0, 10),
    changefreq: p.changefreq,
    priority: p.priority,
  });
}

let props = [];
if (fs.existsSync(MANIFEST)) {
  props = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
} else {
  console.warn('  ! .baked-properties.json missing — sitemap will omit property pages');
}

let closed = 0;
for (const p of props) {
  if (p.closed) { closed++; continue; }
  const abs = path.join(ROOT, 'property', `${p.id}.html`);
  if (!fs.existsSync(abs)) { skipped.push(`property/${p.id}.html`); continue; }
  entries.push({
    loc: `${SITE}/property/${encodeURIComponent(p.id)}.html`,
    lastmod: (p.updated_at || today).slice(0, 10),
    changefreq: 'weekly',
    priority: '0.8',
  });
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log(`  sitemap.xml: ${entries.length} URLs (${entries.length - (props.length - closed)} static, ${props.length - closed} properties, ${closed} closed excluded)`);
if (skipped.length) console.log(`  skipped (not on disk): ${skipped.join(', ')}`);
