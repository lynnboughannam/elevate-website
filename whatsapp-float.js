// Floating WhatsApp bubble — injected on every customer-facing page
(function () {
  const MSG = "Hi, I'm interested in a property on elevateestateslb.com";
  const number = (typeof WA_CENTER !== 'undefined') ? WA_CENTER : '96171991088';
  const link = `https://wa.me/${number}?text=${encodeURIComponent(MSG)}`;

  const style = document.createElement('style');
  style.textContent = `
    #wa-float-btn {
      position: fixed;
      bottom: calc(22px + env(safe-area-inset-bottom, 0px));
      right: calc(22px + env(safe-area-inset-right, 0px));
      z-index: 999999;
      width: 58px; height: 58px; border-radius: 50%;
      background: #25D366; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 24px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);
      text-decoration: none; cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      -webkit-tap-highlight-color: transparent;
    }
    #wa-float-btn:hover { transform: scale(1.08); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    #wa-float-btn::before {
      content: ''; position: absolute; inset: 0; border-radius: 50%;
      background: #25D366; opacity: 0.5;
      animation: wa-pulse 2.2s ease-out infinite;
    }
    @keyframes wa-pulse {
      0%   { transform: scale(1); opacity: 0.5; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    #wa-float-tooltip {
      position: absolute; right: 70px; top: 50%; transform: translateY(-50%);
      background: #2E1F0E; color: #fff; font-family: 'Nunito Sans', sans-serif;
      font-size: 13px; font-weight: 700; padding: 8px 14px; border-radius: 8px;
      white-space: nowrap; opacity: 0; pointer-events: none;
      transition: opacity 0.2s ease;
    }
    #wa-float-btn:hover #wa-float-tooltip { opacity: 1; }
    @media (max-width: 600px) {
      #wa-float-btn {
        width: 54px; height: 54px;
        bottom: calc(18px + env(safe-area-inset-bottom, 0px));
        right: calc(16px + env(safe-area-inset-right, 0px));
      }
      #wa-float-tooltip { display: none; }
    }
  `;
  document.head.appendChild(style);

  const btn = document.createElement('a');
  btn.id = 'wa-float-btn';
  btn.href = link;
  btn.target = '_blank';
  btn.rel = 'noopener';
  btn.setAttribute('aria-label', 'Chat with us on WhatsApp');
  btn.innerHTML = `
    <span id="wa-float-tooltip">Chat with us</span>
    <svg width="30" height="30" fill="white" viewBox="0 0 24 24" style="position:relative;z-index:1">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.855L.057 23.428a.75.75 0 00.921.921l5.573-1.475A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 01-4.953-1.355l-.355-.212-3.683.974.974-3.565-.23-.368A9.72 9.72 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
    </svg>`;
  btn.addEventListener('click', () => {
    if (typeof trackEvent === 'function') trackEvent('whatsapp_float_click', null);
  });

  document.body.appendChild(btn);
})();
