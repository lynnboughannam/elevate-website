// Elevate Estates — shared data store (Supabase-backed via Lovable CRM)

const SEED_LISTINGS = []; /* removed — all listings come from Supabase */
const _UNUSED = [
  {
    id: 'EE-017331',
    title: 'Luxury Mountain Villa',
    location: 'Broumana, Mount Lebanon',
    area: 'Mount Lebanon',
    type: 'villa',
    purpose: 'sale',
    price: 1250000,
    beds: 5, baths: 4, sqm: 450,
    tag: 'luxury',
    status: 'approved',
    featured: true,
    img: 'https://picsum.photos/seed/broumana/800/540',
    description: 'A magnificent mountain villa with panoramic views over the city and the sea. Features a heated pool, landscaped terraces, stone archways, and premium finishes throughout. Set on a generous plot of 1,200 m² with mature cedar trees.',
    amenities: ['Heated Pool', 'Landscaped Garden', 'Double Garage', 'Generator', 'Security System', 'Sauna', 'Stone Terraces', 'Sea Views'],
    submittedBy: 'Admin',
    createdAt: '2025-01-10',
    phone: '+961 71 000 001',
    whatsapp: '96171000001',
    floor: 'G+2',
    age: 'New',
    parking: 2,
  },
  {
    id: 'EE-017332',
    title: 'Achrafieh Heritage Apartment',
    location: 'Achrafieh, Beirut',
    area: 'Beirut',
    type: 'apartment',
    purpose: 'sale',
    price: 420000,
    beds: 3, baths: 2, sqm: 180,
    tag: 'sale',
    status: 'approved',
    featured: true,
    img: 'https://picsum.photos/seed/achrafieh/800/540',
    description: 'Elegantly redesigned apartment in the heart of Achrafieh. High ceilings with original stone walls seamlessly blended with contemporary design. Features a private balcony overlooking the vibrant street below.',
    amenities: ['Original Stone Walls', 'Balcony', 'Covered Parking', 'Generator', 'Elevator', 'Storage Room'],
    submittedBy: 'Admin',
    createdAt: '2025-01-12',
    phone: '+961 71 000 002',
    whatsapp: '96171000002',
    floor: '4th',
    age: '15 years',
    parking: 1,
  },
  {
    id: 'EE-017333',
    title: 'Jounieh Bay Penthouse',
    location: 'Jounieh, Keserwan',
    area: 'Keserwan',
    type: 'apartment',
    purpose: 'sale',
    price: 890000,
    beds: 4, baths: 3, sqm: 280,
    tag: 'luxury',
    status: 'approved',
    featured: true,
    img: 'https://picsum.photos/seed/jounieh/800/540',
    description: 'Top-floor penthouse with unobstructed sea and mountain views. Wraparound terrace of 120 m², private rooftop access, and a fully-equipped designer kitchen. Smart home automation throughout.',
    amenities: ['Panoramic Sea Views', 'Rooftop Terrace 120m²', 'Communal Pool', 'Smart Home', 'Covered Parking x2', 'Generator', 'Elevator', 'Concierge'],
    submittedBy: 'Admin',
    createdAt: '2025-01-14',
    phone: '+961 71 000 003',
    whatsapp: '96171000003',
    floor: 'Penthouse',
    age: '3 years',
    parking: 2,
  },
  {
    id: 'EE-017334',
    title: 'Dbayeh Family Villa',
    location: 'Dbayeh, Metn',
    area: 'Metn',
    type: 'villa',
    purpose: 'sale',
    price: 750000,
    beds: 4, baths: 3, sqm: 380,
    tag: 'sale',
    status: 'approved',
    featured: false,
    img: 'https://picsum.photos/seed/dbayeh/800/540',
    description: 'Spacious family villa in a secure gated compound in Dbayeh. Access to communal pools, children\'s playground, and 24/7 security. Recently renovated with modern kitchen and bathrooms.',
    amenities: ['Communal Pool', 'Garden', 'Garage', 'Generator', 'Playground', '24/7 Security', 'Compound'],
    submittedBy: 'Admin',
    createdAt: '2025-01-16',
    phone: '+961 71 000 004',
    whatsapp: '96171000004',
    floor: 'G+1',
    age: '8 years',
    parking: 2,
  },
  {
    id: 'EE-017335',
    title: 'Hamra Premium Office',
    location: 'Hamra, Beirut',
    area: 'Beirut',
    type: 'commercial',
    purpose: 'rent',
    price: 4500,
    beds: 0, baths: 2, sqm: 220,
    tag: 'rent',
    status: 'approved',
    featured: false,
    img: 'https://picsum.photos/seed/hamra/800/540',
    description: 'Premium office space in a prime Hamra high-rise. Open-plan with dedicated meeting rooms, reception, and kitchenette. Ideal for a professional team of 15–25 people. Raised flooring and structured cabling throughout.',
    amenities: ['Meeting Rooms x3', 'Reception Area', 'Kitchenette', 'Covered Parking', 'Generator', 'Elevator', 'Fiber Internet'],
    submittedBy: 'Admin',
    createdAt: '2025-01-18',
    phone: '+961 71 000 005',
    whatsapp: '96171000005',
    floor: '8th',
    age: '5 years',
    parking: 2,
  },
  {
    id: 'EE-017336',
    title: 'Verdun Furnished Apartment',
    location: 'Verdun, Beirut',
    area: 'Beirut',
    type: 'apartment',
    purpose: 'rent',
    price: 2200,
    beds: 2, baths: 1, sqm: 120,
    tag: 'rent',
    status: 'approved',
    featured: false,
    img: 'https://picsum.photos/seed/verdun/800/540',
    description: 'Fully furnished apartment ideal for corporate relocation or long-term stay. Walking distance to Verdun shopping and dining. Features a sunny balcony, updated appliances, and quality furnishings.',
    amenities: ['Fully Furnished', 'Balcony', 'Covered Parking', 'Generator', 'Elevator', 'Laundry Room', 'Storage'],
    submittedBy: 'Admin',
    createdAt: '2025-01-20',
    phone: '+961 71 000 006',
    whatsapp: '96171000006',
    floor: '3rd',
    age: '10 years',
    parking: 1,
  },
  {
    id: 'EE-017337',
    title: 'Byblos Stone Townhouse',
    location: 'Byblos, North Lebanon',
    area: 'North Lebanon',
    type: 'villa',
    purpose: 'sale',
    price: 580000,
    beds: 3, baths: 2, sqm: 210,
    tag: 'sale',
    status: 'approved',
    featured: false,
    img: 'https://picsum.photos/seed/byblos/800/540',
    description: 'Charming stone townhouse in historic Byblos, fully restored with deep respect for original Ottoman-era architecture. Original cedar wood beams, arched doorways, and a private courtyard garden.',
    amenities: ['Original Stone', 'Cedar Beams', 'Private Courtyard', 'Terraced Garden', 'Storage', 'Parking'],
    submittedBy: 'Admin',
    createdAt: '2025-01-22',
    phone: '+961 71 000 007',
    whatsapp: '96171000007',
    floor: 'G+1',
    age: '120 years (restored)',
    parking: 1,
  },
  {
    id: 'EE-017338',
    title: 'Rabieh Land Plot — Views',
    location: 'Rabieh, Metn',
    area: 'Metn',
    type: 'land',
    purpose: 'sale',
    price: 320000,
    beds: 0, baths: 0, sqm: 800,
    tag: 'sale',
    status: 'approved',
    featured: false,
    img: 'https://picsum.photos/seed/rabieh/800/540',
    description: 'Prime residential land plot in the prestigious Rabieh area with sweeping panoramic views. All services connected (water, electricity, sewage). Building permit ready to obtain. Access via main road.',
    amenities: ['All Services Connected', 'Panoramic Views', 'Road Access', 'Permit-Ready', 'Cleared Land'],
    submittedBy: 'Admin',
    createdAt: '2025-01-24',
    phone: '+961 71 000 008',
    whatsapp: '96171000008',
    floor: '-',
    age: '-',
    parking: 0,
  },
  {
    id: 'EE-017339',
    title: 'Downtown Retail Space',
    location: 'Downtown, Beirut',
    area: 'Beirut',
    type: 'commercial',
    purpose: 'rent',
    price: 8000,
    beds: 0, baths: 1, sqm: 180,
    tag: 'rent',
    status: 'pending',
    featured: false,
    img: 'https://picsum.photos/seed/downtown/800/540',
    description: 'Prime retail space in Downtown Beirut on a high-footfall pedestrian street. Shell and core with glass frontage. Ideal for flagship retail, gallery, or F&B concept.',
    amenities: ['High Footfall', 'Glass Frontage', 'Storage', 'Security', 'AC Pre-installed'],
    submittedBy: 'Client',
    createdAt: '2025-01-26',
    phone: '+961 71 000 009',
    whatsapp: '96171000009',
    floor: 'Ground',
    age: '2 years',
    parking: 0,
  },
  {
    id: 'EE-017340',
    title: 'Antelias Sea View Apartment',
    location: 'Antelias, Metn',
    area: 'Metn',
    type: 'apartment',
    purpose: 'sale',
    price: 310000,
    beds: 2, baths: 2, sqm: 145,
    tag: 'sale',
    status: 'approved',
    featured: false,
    img: 'https://picsum.photos/seed/antelias/800/540',
    description: 'Well-maintained apartment with direct sea views from the living room and master bedroom. Newly renovated kitchen and bathrooms. Ready to move in.',
    amenities: ['Direct Sea Views', 'Balcony', 'Covered Parking', 'Generator', 'Storage Room'],
    submittedBy: 'Admin',
    createdAt: '2025-01-28',
    phone: '+961 71 000 010',
    whatsapp: '96171000010',
    floor: '6th',
    age: '12 years',
    parking: 1,
  },
]; /* end _UNUSED */

// ── Supabase config ────────────────────────────────────────────
const SUPABASE_URL  = 'https://ikbwslamhyimdcduojuv.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYndzbGFtaHlpbWRjZHVvanV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODk5NTUsImV4cCI6MjA5MjI2NTk1NX0.KjzD0FJw0rjkAtU7uGmNcFdQv0Fz4S8MbqMOb3vN8r0';

async function syncFromSupabase() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/properties?listed=eq.true&select=*&order=created_at.desc`,
      { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
    );
    if (!res.ok) return;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return;

    const mapped = rows.map(r => {
      const purpose = (r.purpose || 'sale').toLowerCase();
      const tags    = Array.isArray(r.tags) ? r.tags.map(t => t.toLowerCase()) : [];
      return {
        id:          r.id,
        title:       r.title       || '',
        location:    r.location    || '',
        area:        (r.location   || '').split(',').pop().trim(),
        type:        (['office','warehouse'].includes((r.type||'').toLowerCase()) ? 'commercial' : (r.type || 'apartment').toLowerCase()),
        purpose,
        price:       r.price       || 0,
        beds:        r.beds        || 0,
        baths:       r.baths       || 0,
        sqm:         r.sqm         || 0,
        tag:         tags.includes('luxury') ? 'luxury' : (purpose === 'rent' ? 'rent' : 'sale'),
        status:      'approved',
        featured:    r.featured    || false,
        img:         (r.images && r.images[0]) || 'brand_Assets/placeholder.svg',
        images:      (r.images && r.images.length) ? r.images : [],
        description: r.description || '',
        amenities:   r.amenities   || [],
        // sold/rented tags drive the banner, so keep them out of the feature chips
        tags:        (r.tags || []).filter(t => !/^(sold|rented|leased)/i.test(String(t).trim())),
        dealStatus:  readDealStatus(r),
        submittedBy: r.agent_name  || 'Admin',
        createdAt:   r.created_at  ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        phone:       r.agent_phone || '',
        whatsapp:    (r.agent_phone || '').replace(/\D/g, ''),
        parking:     r.parking     || 0,
        agentName:   r.agent_name    || '',
        agentCompany:r.agent_company || '',
        agentLogo:   r.agent_logo    || '',
      };
    });

    localStorage.setItem('ee_listings_v2', JSON.stringify(mapped));
    window.dispatchEvent(new CustomEvent('ee:synced'));
  } catch (e) {
    console.warn('Supabase sync failed, using local data:', e);
  }
}

// ── Site settings ──────────────────────────────────────────────
async function checkComingSoon() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/site_settings?key=eq.coming_soon&select=value`,
      { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
    );
    const data = await res.json();
    console.log('[ComingSoon] status:', res.status, 'data:', JSON.stringify(data));
    if (!res.ok) { console.error('[ComingSoon] fetch error:', data); return false; }
    return data[0]?.value === 'true';
  } catch(e) { console.error('[ComingSoon] exception:', e); return false; }
}

async function setComingSoon(enabled) {
  await fetch(`${SUPABASE_URL}/rest/v1/site_settings`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ key: 'coming_soon', value: enabled ? 'true' : 'false' }),
  });
}

// ── Store helpers ──────────────────────────────────────────────

function initStore() {
  localStorage.setItem('ee_listings_v2', JSON.stringify([]));
  syncFromSupabase();
}

function getListings() {
  return JSON.parse(localStorage.getItem('ee_listings_v2') || '[]');
}

function getListing(id) {
  return getListings().find(l => l.id === id) || null;
}

function saveListings(listings) {
  localStorage.setItem('ee_listings_v2', JSON.stringify(listings));
}

function addListing(listing) {
  const listings = getListings();
  listings.unshift(listing);
  saveListings(listings);
}

function updateListing(id, updates) {
  const listings = getListings();
  const idx = listings.findIndex(l => l.id === id);
  if (idx !== -1) {
    listings[idx] = { ...listings[idx], ...updates };
    saveListings(listings);
    return true;
  }
  return false;
}

function deleteListing(id) {
  saveListings(getListings().filter(l => l.id !== id));
}

function generateId() {
  const listings = getListings();
  const maxNum = listings.reduce((max, l) => {
    const num = parseInt(l.id.replace('EE-0', ''));
    return isNaN(num) ? max : Math.max(max, num);
  }, 17340);
  return `EE-0${maxNum + 1}`;
}

function formatPrice(price, purpose) {
  if (!price || price === 0) return 'Price on request';
  const fmt = new Intl.NumberFormat('en-US').format(price);
  return purpose === 'rent' ? `$${fmt}/mo` : `$${fmt}`;
}

function typeLabel(type) {
  return { villa: 'Villa', apartment: 'Apartment', commercial: 'Commercial', land: 'Land', office: 'Commercial', warehouse: 'Commercial' }[type] || type;
}

function tagClass(tag) {
  return {
    luxury: 'tag-gold',
    sale:   'tag-brown',
    rent:   'tag-green',
    new:    'tag-teal',
  }[tag] || 'tag-brown';
}

const WA_CENTER = '96171991088';

function trackEvent(eventType, propertyId) {
  const page = location.pathname.split('/').pop() || 'index.html';
  fetch(`${SUPABASE_URL}/rest/v1/click_events`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Content-Type': 'application/json', 'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ event_type: eventType, property_id: propertyId || null, page }),
  }).catch(() => {});
}

function waLink(l) {
  const url = `${location.origin}/property.html?id=${l.id}`;
  const d   = dealState(l);
  const msg = d
    ? `Hi, I saw property ${l.id} — ${l.title} — is ${d.label.toLowerCase()}. Can you show me something similar?\n\nListing: ${url}`
    : `Hi, I'm interested in property ${l.id} — ${l.title}.\n\nListing: ${url}`;
  return `https://wa.me/${WA_CENTER}?text=${encodeURIComponent(msg)}`;
}

function tagText(tag) {
  return {
    luxury: 'Luxury',
    sale:   'For Sale',
    rent:   'For Rent',
    new:    'New',
  }[tag] || tag;
}

function statusBadge(status) {
  return {
    approved: '<span class="status-approved">Approved</span>',
    pending:  '<span class="status-pending">Pending</span>',
    rejected: '<span class="status-rejected">Rejected</span>',
  }[status] || '';
}

// Admin auth stubs — session logic handled in admin.html
function isAdminLoggedIn() { return false; }
function adminLogin()       { return false; }
function adminLogout()      {}

// ══════════════════════════════════════════════════════════════
//  CLOSED-DEAL SYSTEM — sold / rented
//  A property is closed when the CRM says so. Every flag below is
//  read, so the CRM needs no schema change to start using this:
//    • text column   deal_status | sale_status | property_status |
//                    listing_status | availability | status  →  "sold" / "rented"
//    • bool column   sold = true  |  rented = true
//    • tag on the listing →  "Sold" / "Rented" / "Leased"
//  Keep `listed` = true in the CRM so the closed property still
//  reaches the site and can show its banner.
// ══════════════════════════════════════════════════════════════

const DEAL_STATES = {
  sold: {
    key: 'sold', label: 'Sold', eyebrow: 'Deal closed',
    accent: '#C8A24A', fg: '#F7EED6', rule: 'rgba(200,162,74,0.55)',
    line: 'Closed through Elevate Estates.',
  },
  rented: {
    key: 'rented', label: 'Rented', eyebrow: 'Tenant placed',
    accent: '#9BC07A', fg: '#F1F7E9', rule: 'rgba(155,192,122,0.55)',
    line: 'Let through Elevate Estates.',
  },
};

function readDealStatus(r) {
  if (r.sold   === true) return 'sold';
  if (r.rented === true) return 'rented';
  const words = [r.deal_status, r.sale_status, r.property_status, r.listing_status, r.availability, r.status]
    .concat(Array.isArray(r.tags) ? r.tags : [])
    .filter(v => typeof v === 'string')
    .map(v => v.trim().toLowerCase());
  if (words.some(w => /^sold/.test(w)))                  return 'sold';
  if (words.some(w => /^(rented|leased|let\b)/.test(w))) return 'rented';
  return null;
}

function dealState(l)    { return (l && DEAL_STATES[l.dealStatus]) || null; }
function isClosedDeal(l) { return !!dealState(l); }

// Corner sash for listing cards — sits inside any .card-img / .img-wrap
function dealSashHtml(l) {
  const d = dealState(l);
  if (!d) return '';
  return `<div class="ee-sash" style="--sash-fg:${d.fg};--sash-rule:${d.rule}" aria-hidden="true"><span>${d.label}</span></div>`;
}

// Pressed stamp for the property hero image
function dealStampHtml(l) {
  const d = dealState(l);
  if (!d) return '';
  return `<div class="ee-stamp" style="--stamp-fg:${d.fg};--stamp-rule:${d.accent}" aria-hidden="true">
    <b>${d.label}</b><i>Elevate Estates</i>
  </div>`;
}

// The banner. Full-width plate stating the property is off the market.
function dealPlateHtml(l, ctaHref) {
  const d = dealState(l);
  if (!d) return '';
  const what  = typeLabel(l.type).toLowerCase();
  const where = l.location ? ` in ${l.location}` : '';
  return `<section class="ee-plate" style="--plate-accent:${d.accent};--plate-fg:${d.fg}" role="status">
    <span class="ee-seal" aria-hidden="true">
      <svg viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="26" stroke="currentColor" stroke-opacity="0.45" stroke-width="1"/>
        <circle cx="28" cy="28" r="21" stroke="currentColor" stroke-opacity="0.9" stroke-width="1.5" stroke-dasharray="3 3"/>
        <path d="M19 28.6l5.6 5.6L37 21.8" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <div class="ee-plate-copy">
      <p class="ee-plate-eyebrow">${d.eyebrow}</p>
      <h2 class="ee-plate-title">This ${what} is ${d.label.toLowerCase()}.</h2>
      <p class="ee-plate-line">${d.line} It is no longer available — ask us what else we have${where}.</p>
    </div>
    <a class="ee-plate-cta" href="${ctaHref || 'listings.html'}">
      See similar properties
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>
    </a>
  </section>`;
}

// Small inline pill — admin table, tight spots
function dealChipHtml(l) {
  const d = dealState(l);
  if (!d) return '';
  return `<span class="ee-chip" style="--chip-accent:${d.accent}">${d.label}</span>`;
}

(function injectDealStyles() {
  const css = `
  /* Muted photo treatment — a closed deal reads as archive, not stock */
  .ee-closed-media > img, .ee-closed-media img.ee-muted {
    filter: grayscale(0.72) sepia(0.16) contrast(0.94) brightness(0.9);
  }

  /* Corner sash — cards */
  .ee-sash { position:absolute; top:0; right:0; width:116px; height:116px; overflow:hidden; pointer-events:none; z-index:4; }
  .ee-sash span {
    position:absolute; top:21px; right:-36px; width:156px; padding:7px 0;
    transform:rotate(45deg); text-align:center;
    background:linear-gradient(180deg,#3A2510,#221507);
    color:var(--sash-fg,#F7EED6);
    font:700 10px/1 'Nunito Sans',sans-serif; letter-spacing:2.4px; text-indent:2.4px; text-transform:uppercase;
    border-top:1px solid var(--sash-rule,rgba(200,162,74,0.55));
    border-bottom:1px solid var(--sash-rule,rgba(200,162,74,0.55));
    box-shadow:0 6px 18px rgba(34,21,7,0.4);
  }

  /* Pressed stamp — property hero */
  .ee-stamp {
    position:absolute; top:50%; left:50%; z-index:4; pointer-events:none; text-align:center;
    transform:translate(-50%,-50%) rotate(-7deg);
    padding:18px 44px 16px; border-radius:4px;
    border:2.5px solid var(--stamp-rule,#C8A24A);
    outline:1px solid rgba(247,238,214,0.28); outline-offset:5px;
    background:rgba(24,15,5,0.62);
    -webkit-backdrop-filter:blur(4px) saturate(0.7); backdrop-filter:blur(4px) saturate(0.7);
    box-shadow:0 20px 56px rgba(24,15,5,0.5), inset 0 0 0 1px rgba(247,238,214,0.18);
    animation:ee-press 0.7s cubic-bezier(0.22,1.2,0.36,1) both;
  }
  .ee-stamp b {
    display:block; color:var(--stamp-fg,#F7EED6); text-transform:uppercase;
    font:700 clamp(30px,5.2vw,54px)/1 'Playfair Display',serif;
    letter-spacing:0.16em; text-indent:0.16em;
  }
  .ee-stamp i {
    display:block; margin-top:7px; font-style:normal; color:var(--stamp-fg,#F7EED6); opacity:0.62;
    font:700 9px/1 'Nunito Sans',sans-serif; letter-spacing:3px; text-indent:3px; text-transform:uppercase;
  }
  @keyframes ee-press {
    from { opacity:0; transform:translate(-50%,-50%) rotate(-7deg) scale(1.32); }
    to   { opacity:1; transform:translate(-50%,-50%) rotate(-7deg) scale(1); }
  }

  /* The banner */
  .ee-plate {
    position:relative; overflow:hidden; border-radius:16px; margin-bottom:1.5rem;
    padding:1.5rem 1.75rem; display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap;
    background:
      radial-gradient(120% 180% at 88% 0%, rgba(200,162,74,0.15), transparent 58%),
      radial-gradient(90% 160% at 6% 100%, rgba(168,120,80,0.2), transparent 62%),
      linear-gradient(168deg,#3A2510 0%,#271908 62%,#1E1306 100%);
    border:1px solid rgba(247,238,214,0.14);
    box-shadow:0 22px 60px rgba(46,31,14,0.32), 0 2px 8px rgba(46,31,14,0.18), inset 0 1px 0 rgba(247,238,214,0.09);
  }
  .ee-plate::before {
    content:''; position:absolute; inset:0 0 auto 0; height:2px; opacity:0.7;
    background:linear-gradient(90deg,transparent,var(--plate-accent,#C8A24A),transparent);
  }
  .ee-plate::after {
    content:''; position:absolute; inset:0; pointer-events:none; opacity:0.055;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  .ee-seal { flex:none; width:54px; height:54px; color:var(--plate-accent,#C8A24A); position:relative; z-index:1; }
  .ee-seal svg { width:100%; height:100%; display:block; }
  .ee-plate-copy { flex:1 1 260px; min-width:0; position:relative; z-index:1; }
  .ee-plate-eyebrow {
    margin:0 0 6px; color:var(--plate-accent,#C8A24A);
    font:700 10px/1 'Nunito Sans',sans-serif; letter-spacing:2.6px; text-transform:uppercase;
  }
  .ee-plate-title {
    margin:0 0 7px; color:var(--plate-fg,#F7EED6);
    font:700 clamp(21px,3vw,28px)/1.15 'Playfair Display',serif; letter-spacing:-0.03em;
  }
  .ee-plate-line { margin:0; color:rgba(247,238,214,0.68); font-size:13.5px; line-height:1.7; max-width:52ch; }
  .ee-plate-cta {
    flex:none; position:relative; z-index:1;
    display:inline-flex; align-items:center; gap:8px; text-decoration:none;
    padding:12px 18px; border-radius:10px;
    background:rgba(247,238,214,0.09); color:var(--plate-fg,#F7EED6);
    border:1px solid rgba(247,238,214,0.28);
    font:700 13px/1 'Nunito Sans',sans-serif;
    transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
  }
  .ee-plate-cta:hover  { background:rgba(247,238,214,0.16); transform:translateY(-2px); }
  .ee-plate-cta:active { transform:translateY(0) scale(0.98); }
  .ee-plate-cta:focus-visible { outline:2px solid var(--plate-accent,#C8A24A); outline-offset:3px; }
  @media (max-width:560px) {
    .ee-plate { padding:1.25rem; gap:1rem; }
    .ee-seal { width:42px; height:42px; }
    .ee-plate-cta { width:100%; justify-content:center; }
  }

  /* Inline pill */
  .ee-chip {
    display:inline-block; padding:3px 9px; border-radius:20px;
    background:#2A1B09; color:var(--chip-accent,#C8A24A);
    border:1px solid var(--chip-accent,#C8A24A);
    font:700 9px/1.5 'Nunito Sans',sans-serif; letter-spacing:1.4px; text-transform:uppercase;
  }

  @media (prefers-reduced-motion: reduce) {
    .ee-stamp { animation:none; }
    .ee-plate-cta { transition:none; }
  }`;
  const tag = document.createElement('style');
  tag.id = 'ee-deal-styles';
  tag.textContent = css;
  (document.head || document.documentElement).appendChild(tag);
})();

// ══════════════════════════════════════════════════════════════
//  STRUCTURED DATA — schema.org RealEstateListing
//  Built from the same Supabase rows that render the cards, so the
//  markup can't drift from what's on screen. Defined once here;
//  index / listings / property each call injectListingSchema()
//  with whatever that page rendered.
//  Shapes follow Google's Rich Results rules: price is a number,
//  priceCurrency is ISO 4217, image URLs are absolute.
// ══════════════════════════════════════════════════════════════

const SITE_ORIGIN = 'https://www.elevateestateslb.com';

// schema.org has no residence type for commercial units or land, so both map to Place.
const SCHEMA_TYPE_BY_TYPE = {
  apartment:  'Apartment',
  villa:      'House',
  commercial: 'Place',
  land:       'Place',
};

function absoluteUrl(u) {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  return `${SITE_ORIGIN}/${String(u).replace(/^\/+/, '')}`;
}

// location arrives as "Area" or "Area, Region" — split so each part lands in its own field
function listingAddress(l) {
  const parts = String(l.location || '').split(',').map(s => s.trim()).filter(Boolean);
  const addr  = { '@type': 'PostalAddress', addressCountry: 'LB' };
  if (parts.length > 1) {
    addr.addressLocality = parts[0];
    addr.addressRegion   = parts[parts.length - 1];
  } else if (parts.length === 1) {
    addr.addressLocality = parts[0];
  }
  return addr;
}

function realEstateListingNode(l) {
  const url    = `${SITE_ORIGIN}/property.html?id=${encodeURIComponent(l.id)}`;
  const images = ((l.images && l.images.length) ? l.images : [l.img])
    .map(absoluteUrl)
    .filter(Boolean);

  // Availability follows the CRM deal status — a sold or rented listing is SoldOut.
  const offers = {
    '@type': 'Offer',
    availability: isClosedDeal(l) ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
    businessFunction: l.purpose === 'rent'
      ? 'http://purl.org/goodrelations/v1#LeaseOut'
      : 'http://purl.org/goodrelations/v1#Sell',
  };
  // Price must be a bare number for Rich Results. 0 means "price on request" — omit
  // rather than publish a false 0.
  if (Number(l.price) > 0) {
    offers.price         = Number(l.price);
    offers.priceCurrency = 'USD';
  }

  const about = {
    '@type': SCHEMA_TYPE_BY_TYPE[l.type] || 'Place',
    name:    l.title,
    address: listingAddress(l),
  };
  if (Number(l.beds)  > 0) about.numberOfBedrooms       = Number(l.beds);
  if (Number(l.baths) > 0) about.numberOfBathroomsTotal = Number(l.baths);
  if (Number(l.sqm)   > 0) about.floorSize = {
    '@type': 'QuantitativeValue',
    value:    Number(l.sqm),
    unitCode: 'MTK', // UN/CEFACT code for square metre
  };
  if (l.amenities && l.amenities.length) {
    about.amenityFeature = l.amenities.map(a => ({
      '@type': 'LocationFeatureSpecification', name: String(a), value: true,
    }));
  }

  const node = {
    '@type': 'RealEstateListing',
    '@id':   url,
    url,
    name:    l.title,
    offers,
    about,
  };
  if (l.createdAt)   node.datePosted = l.createdAt;
  if (images.length) node.image      = images;
  if (l.description) {
    node.description = String(l.description).replace(/\s+/g, ' ').trim().slice(0, 500);
  }
  return node;
}

// One listing emits a bare RealEstateListing; several emit an ItemList of them.
function injectListingSchema(listings) {
  const rows  = Array.isArray(listings) ? listings : [listings];
  const items = rows.filter(Boolean).map(realEstateListingNode);
  if (!items.length) return;

  const payload = items.length === 1
    ? Object.assign({ '@context': 'https://schema.org' }, items[0])
    : {
        '@context': 'https://schema.org',
        '@type':    'ItemList',
        numberOfItems: items.length,
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem', position: i + 1, item,
        })),
      };

  let tag = document.getElementById('ee-listing-schema');
  if (!tag) {
    tag      = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.id   = 'ee-listing-schema';
    document.head.appendChild(tag);
  }
  tag.textContent = JSON.stringify(payload, null, 2);
}
