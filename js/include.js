document.addEventListener('DOMContentLoaded', () => {
  const includes = [
    { id: 'site-header', url: 'header/index.html' },
    { id: 'site-footer', url: 'footer/index.html' }
  ];

  includes.forEach(async (inc) => {
    const el = document.getElementById(inc.id);
    if (!el) return;
    // attempt to preload a conventional stylesheet for the fragment (e.g. header/css/style.css)
    try{
      const cssCandidate = (inc.url.endsWith('index.html') ? inc.url.replace(/index\.html$/, 'css/style.css') : null);
      if(cssCandidate && !document.querySelector('link[rel="stylesheet"][href="'+cssCandidate+'"]')){
        await new Promise((resolve) => {
          const l = document.createElement('link');
          l.rel = 'stylesheet';
          l.href = cssCandidate;
          l.onload = () => resolve();
          l.onerror = () => resolve();
          document.head.appendChild(l);
        });
      }
    }catch(e){ console.warn('Preload stylesheet failed', e); }
    try {
      const res = await fetch(inc.url, { cache: 'no-store' });
      if (!res.ok) throw new Error(res.statusText);
      const html = await res.text();
      el.innerHTML = html;
      // move any stylesheet/style/script tags from the injected fragment into <head>
      moveInjectedResourcesToHead(el);
      // load header script dynamically
      if(inc.url === 'header/index.html'){
        const script = document.createElement('script');
        script.src = 'header/js/header.js';
        document.head.appendChild(script);
      }
      // try to initialize header behaviors exposed by header script (if present)
      setTimeout(() => {
        try{
          if(window.__initMegaMenu && typeof window.__initMegaMenu === 'function'){
            window.__initMegaMenu();
          } else if(typeof attachMegaMenuBehavior === 'function'){
            attachMegaMenuBehavior();
          }
        }catch(e){ console.warn('Initializing megamenu failed', e); }
      }, 100);
    } catch (err) {
      console.error('Include failed:', inc.url, err);
    }
  });
});

// Attach behavior for megamenu toggles (click only, no hover)
function attachMegaMenuBehavior(){
  try{
    const menus = document.querySelectorAll('[data-megamenu]');
    if(!menus || menus.length === 0) return;
    menus.forEach(menu => {
      const toggle = menu.querySelector('.megamenu-toggle');
      const panel = menu.querySelector('.megamenu-panel');
      if(!toggle || !panel) return;

      // helpers
      const closeMenu = () => { menu.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); panel.setAttribute('aria-hidden','true'); };
      const openMenu = () => { menu.classList.add('open'); toggle.setAttribute('aria-expanded','true'); panel.setAttribute('aria-hidden','false'); };

      // click toggles
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        if(menu.classList.contains('open')) closeMenu(); else openMenu();
      });

      // prevent closing when clicking inside panel
      panel.addEventListener('click', (e)=>{ e.stopPropagation(); });

      // close on outside click
      document.addEventListener('click', (e) => {
        if(!menu.contains(e.target)) closeMenu();
      });

      // close on escape
      document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape') closeMenu();
      });
    });
  }catch(err){ console.error('Mega menu init failed', err); }
}

function moveInjectedResourcesToHead(container){
  try{
    if(!container) return;
    // move <link rel="stylesheet"> elements
    const links = container.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if(!href) return;
      if(!document.querySelector('link[rel="stylesheet"][href="'+href+'"]')){
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = href;
        document.head.appendChild(newLink);
      }
      link.remove();
    });

    // move any <style> blocks
    const styles = container.querySelectorAll('style');
    styles.forEach(s => {
      const cloned = s.cloneNode(true);
      document.head.appendChild(cloned);
      s.remove();
    });

    // move external scripts (with src) into head so they execute
    const scripts = container.querySelectorAll('script[src]');
    scripts.forEach(sc => {
      const src = sc.getAttribute('src');
      if(!src) return;
      // avoid duplicates
      if(!document.querySelector('script[src="'+src+'"]')){
        const newScript = document.createElement('script');
        newScript.src = src;
        newScript.defer = true;
        document.head.appendChild(newScript);
      }
      sc.remove();
    });
  }catch(e){ console.error('moveInjectedResourcesToHead failed', e); }
}

