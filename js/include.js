document.addEventListener('DOMContentLoaded', () => {
  const includes = [
    { id: 'site-header', url: 'header/index.html' },
    { id: 'site-footer', url: 'footer/index.html' }
  ];

  includes.forEach(async (inc) => {
    const el = document.getElementById(inc.id);
    if (!el) return;
    try {
      const res = await fetch(inc.url, { cache: 'no-store' });
      if (!res.ok) throw new Error(res.statusText);
      const html = await res.text();
      el.innerHTML = html;
    } catch (err) {
      console.error('Include failed:', inc.url, err);
    }
  });
});
