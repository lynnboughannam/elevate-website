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
        type:        (r.type       || 'apartment').toLowerCase(),
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
  return { villa: 'Villa', apartment: 'Apartment', commercial: 'Commercial', land: 'Land' }[type] || type;
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

function waLink(l) {
  const url = `${location.origin}/property.html?id=${l.id}`;
  const msg = `Hi, I'm interested in property ${l.id} — ${l.title}.\n\nListing: ${url}`;
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

// Admin auth
function isAdminLoggedIn() {
  return sessionStorage.getItem('ee_admin') === 'true';
}
function adminLogin(password) {
  if (password === 'elevate2025') {
    sessionStorage.setItem('ee_admin', 'true');
    return true;
  }
  return false;
}
function adminLogout() {
  sessionStorage.removeItem('ee_admin');
}
