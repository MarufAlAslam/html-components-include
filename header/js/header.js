// Header behaviors: make megamenu click-to-open and keep it open while interacting
(function(){
  function initMegaMenu(){
    const menus = document.querySelectorAll('[data-megamenu]');
    if(!menus || menus.length === 0) return;

    menus.forEach(menu => {
      const toggle = menu.querySelector('.megamenu-toggle');
      const panel = menu.querySelector('.megamenu-panel');
      if(!toggle || !panel) return;

      const openMenu = () => {
        menu.classList.add('open');
        toggle.setAttribute('aria-expanded','true');
        panel.setAttribute('aria-hidden','false');
        // focus first link for keyboard users
        const firstLink = panel.querySelector('a');
        if(firstLink) firstLink.focus();
      };
      const closeMenu = () => {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
        panel.setAttribute('aria-hidden','true');
      };

      // toggle on click
      toggle.addEventListener('click', (e)=>{
        e.preventDefault();
        if(menu.classList.contains('open')) closeMenu(); else openMenu();
      });

      // prevent closing when clicking inside panel
      panel.addEventListener('click', (e)=>{ e.stopPropagation(); });

      // close when clicking outside
      document.addEventListener('click', (e)=>{
        if(!menu.contains(e.target)) closeMenu();
      });

      // close on Escape
      document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeMenu(); });
    });
  }

  // initialize on DOMContentLoaded and also if content is injected later
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMegaMenu);
  else initMegaMenu();

  // expose for debugging
  window.__initMegaMenu = initMegaMenu;
})();