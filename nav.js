// Shared navigation — injected into every page via renderNav(activePage)
(function () {
  const LINKS = {
    listings: [
      { href: 'listings.html',      label: 'Properties', active: true },
      { href: 'index.html#contact', label: 'Contact' },
    ],
    property: [
      { href: 'listings.html',      label: '← All Properties' },
    ],
    submit: [
      { href: 'listings.html',      label: 'Browse Properties' },
      { href: 'index.html#contact', label: 'Contact' },
    ],
  };

  const CTA = {
    listings: { href: 'submit.html', label: 'List Property' },
    property: { href: 'submit.html', label: 'List Property' },
    submit:   null,
  };

  window.renderNav = function (page) {
    const el = document.getElementById('site-nav');
    if (!el) return;

    const links  = LINKS[page]  || [];
    const ctaDef = CTA[page];

    const desktopLinks = links.map(l =>
      `<a href="${l.href}" style="font-size:14px;font-weight:${l.active?'700':'600'};color:${l.active?'#7A5230':'#4E3219'};text-decoration:none">${l.label}</a>`
    ).join('');

    const desktopCta = ctaDef
      ? `<a href="${ctaDef.href}" style="background:#7A5230;color:#fff;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none" onmouseover="this.style.background='#4E3219'" onmouseout="this.style.background='#7A5230'">${ctaDef.label}</a>`
      : '';

    const mobileLinks = links.map(l =>
      `<a href="${l.href}" style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(122,82,48,0.08);font-size:16px;font-weight:${l.active?'700':'600'};color:${l.active?'#7A5230':'#4E3219'};text-decoration:none">
        ${l.label}
        <svg width="16" height="16" fill="none" stroke="#A87850" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
      </a>`
    ).join('');

    const mobileCta = ctaDef
      ? `<div style="padding-top:1.25rem">
           <a href="${ctaDef.href}" style="display:block;text-align:center;background:#7A5230;color:#fff;padding:14px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">${ctaDef.label}</a>
         </div>`
      : '';

    el.innerHTML = `
      <style>
        #ee-nav-desktop-links { display:flex; }
        #ee-nav-hamburger { display:none; }
        #ee-nav-mobile-menu { display:none; }
        @media (max-width:768px) {
          #ee-nav-desktop-links { display:none !important; }
          #ee-nav-hamburger { display:flex !important; }
        }
      </style>
      <nav style="background:rgba(250,247,243,0.97);backdrop-filter:blur(16px);border-bottom:1px solid rgba(122,82,48,0.12);box-shadow:0 2px 20px rgba(78,50,25,0.08);position:sticky;top:0;z-index:100">
        <div style="max-width:1280px;margin:0 auto;padding:0 2rem;height:70px;display:flex;align-items:center;justify-content:space-between">
          <a href="index.html"><img src="brand_Assets/dark-elevate-logo.png" alt="Elevate Estates" style="height:52px;width:auto"></a>
          <div id="ee-nav-desktop-links" style="align-items:center;gap:1.5rem">
            ${desktopLinks}
            ${desktopCta}
          </div>
          <button id="ee-nav-hamburger" onclick="(function(){var m=document.getElementById('ee-nav-mobile-menu');m.style.display=m.style.display==='block'?'none':'block'})()" style="background:none;border:none;cursor:pointer;padding:4px;align-items:center;justify-content:center" aria-label="Menu">
            <svg width="24" height="24" fill="none" stroke="#4E3219" stroke-width="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
        <div id="ee-nav-mobile-menu" style="background:#FAF7F3;border-top:1px solid rgba(122,82,48,0.12);padding:1.5rem 2rem 2rem">
          <div style="display:flex;flex-direction:column">
            ${mobileLinks}
            ${mobileCta}
          </div>
        </div>
      </nav>`;
  };
})();
