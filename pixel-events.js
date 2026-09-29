// Meta Pixel — standard events.
//
// The base pixel in each page's <head> fires PageView. This file adds the
// four standard events on top of it: Contact, ViewContent, Search and Lead.
// Loaded on every customer-facing page; deliberately NOT on admin.html, so
// staff sessions stay out of the pixel data.
//
// TIMING: there is nothing to wait for. The base snippet defines fbq()
// synchronously and queues every call until fbevents.js arrives, then flushes
// the queue in order. So calling fbq() early is safe by design. What is not
// safe is assuming fbq exists at all — an ad blocker can strip the snippet
// entirely — hence the guard in track(). These handlers sit in front of
// navigation we must not break, so nothing here throws and nothing here
// cancels a click.
(function () {
  'use strict';

  var CONTENT_TYPE = 'home_listing';
  var CURRENCY     = 'USD';

  // Two identical events this close together are one action — a double-tap on
  // a WhatsApp button is one contact, not two.
  var DEDUPE_MS = 1000;
  var lastKey = '';
  var lastAt  = 0;

  function track(name, params, dedupeKey) {
    if (typeof window.fbq !== 'function') return;

    // Meta reads absent and empty-string params differently; drop them.
    var clean = {};
    for (var k in params) {
      if (!Object.prototype.hasOwnProperty.call(params, k)) continue;
      var v = params[k];
      if (v === undefined || v === null || v === '') continue;
      clean[k] = v;
    }

    var key = name + '|' + (dedupeKey || JSON.stringify(clean));
    var now = Date.now();
    if (key === lastKey && now - lastAt < DEDUPE_MS) return;
    lastKey = key;
    lastAt  = now;

    try { window.fbq('track', name, clean); } catch (e) { /* never break the page */ }
  }

  // ── Current listing ──────────────────────────────────────────────────────
  // Set by property.html once the listing renders. Until then the reference is
  // still recoverable from the URL, so a WhatsApp tap during the loading
  // spinner carries the right id.
  var current = null;

  function onPropertyPage() {
    var p = location.pathname;
    return /(^|\/)property\.html$/.test(p) || /(^|\/)property\/[^/]+\.html$/.test(p);
  }

  function listingRef() {
    if (current && current.id) return current.id;
    if (!onPropertyPage()) return null;
    return new URLSearchParams(location.search).get('id') || window.__LISTING_ID__ || null;
  }

  // ── Contact ──────────────────────────────────────────────────────────────
  // Capture phase on purpose. The listing and sold cards call
  // event.stopPropagation() inside their own click handlers, so a bubble-phase
  // listener on document would never see those taps. Capture runs top-down
  // before the target's handlers, so stopPropagation cannot suppress it.
  document.addEventListener('click', function (e) {
    var el = e.target;
    if (!el || typeof el.closest !== 'function') return;
    var a = el.closest('a[href]');
    if (!a) return;

    var channel = null;
    if (a.protocol === 'tel:') channel = 'phone';
    else if (a.hostname === 'wa.me' || a.hostname === 'www.wa.me' || a.hostname === 'api.whatsapp.com') channel = 'whatsapp';
    if (!channel) return;

    var ref = listingRef();
    track('Contact', {
      content_name:  channel,
      content_ids:   ref ? [ref] : undefined,
      content_type:  ref ? CONTENT_TYPE : undefined,
    // Each card's wa.me link carries its own listing in the prefilled message,
    // so the href separates two different cards tapped in quick succession.
    }, channel + '|' + a.getAttribute('href'));

    // Nothing is prevented or delayed here: the link opens exactly as before.
  }, true);

  // ── ViewContent ──────────────────────────────────────────────────────────
  var viewContentFired = false;

  function viewContent(listing) {
    if (!listing || !listing.id) return;

    var price = Number(listing.price) || 0;
    current = { id: listing.id, price: price };

    // renderProperty() runs again on every ee:synced, and on a warm cache it
    // has already run once on load. One view is one ViewContent.
    if (viewContentFired) return;
    viewContentFired = true;

    track('ViewContent', {
      content_ids:  [listing.id],
      content_type: CONTENT_TYPE,
      content_name: listing.title || undefined,
      value:        price > 0 ? price : undefined,
      currency:     CURRENCY,
    });
  }

  // ── Search ───────────────────────────────────────────────────────────────
  var searchTimer = null;

  function describe(c) {
    var what  = c.type || 'property';
    var where = c.area ? ' in ' + c.area : '';
    var cap   = (c.maxPrice == null) ? '' : ' up to $' + Number(c.maxPrice).toLocaleString();
    return what + where + cap;
  }

  // Chips, the price slider and the keyword box all arrive here. The slider
  // fires on every step of a drag and the keyword box on every keystroke, so
  // coalesce into one event per pause rather than flooding the pixel.
  function search(criteria) {
    var c = criteria || {};
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      track('Search', {
        search_string:    c.keyword || describe(c),
        content_category: CONTENT_TYPE,
        area:             c.area || 'any',
        property_type:    c.type || 'any',
        max_price:        (c.maxPrice == null) ? 'any' : c.maxPrice,
        currency:         CURRENCY,
      });
    }, 500);
  }

  // ── Lead ─────────────────────────────────────────────────────────────────
  function lead(params) {
    track('Lead', params || {});
  }

  window.eePixel = {
    track:       track,
    viewContent: viewContent,
    search:      search,
    lead:        lead,
  };
})();
