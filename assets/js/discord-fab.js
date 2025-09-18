// Inject a floating Discord button (bottom-right) across the site
(function(){
  try {
    const INVITE = 'https://discord.gg/your-invite'; // <-- replace with your real invite
    const id = 'vibe-discord-fab';
    if (document.getElementById(id)) return;

    const a = document.createElement('a');
    a.id = id;
    a.href = INVITE;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', 'Join our Discord');

    // Basic styles
    Object.assign(a.style, {
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      width: '56px',
      height: '56px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#5865F2',
      color: 'white',
      borderRadius: '50%',
      boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
      textDecoration: 'none',
      zIndex: 9999,
      transition: 'transform 120ms ease, box-shadow 120ms ease'
    });

    a.addEventListener('mouseenter', () => { a.style.transform = 'translateY(-3px)'; a.style.boxShadow = '0 10px 24px rgba(0,0,0,0.28)'; });
    a.addEventListener('mouseleave', () => { a.style.transform = ''; a.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)'; });

    // Insert proper Discord SVG (white)
    a.innerHTML = '<svg width="20" height="20" viewBox="0 0 71 55" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'
      + '<path fill="white" d="M60.104 4.552A58.764 58.764 0 0 0 46.996.5a41.103 41.103 0 0 0-1.979 4.057 55.842 55.842 0 0 0-14.034 0A41.02 41.02 0 0 0 28.004.5 58.77 58.77 0 0 0 12.896 4.55C3.75 18.52-.96 31.097.41 43.448 13.573 49.113 25.176 51.5 35.5 51.5c10.323 0 21.927-2.386 34.088-8.052 1.374-12.351-3.364-24.928-9.984-38.896zM24.5 36.75c-3.044 0-5.5-2.498-5.5-5.573 0-3.075 2.456-5.573 5.5-5.573 3.045 0 5.501 2.498 5.5 5.573 0 3.075-2.456 5.573-5.5 5.573zm22 0c-3.044 0-5.5-2.498-5.5-5.573 0-3.075 2.456-5.573 5.5-5.573 3.045 0 5.501 2.498 5.5 5.573 0 3.075-2.456 5.573-5.5 5.573z"/>';

    // Small accessible tooltip
    const tooltip = document.createElement('span');
    tooltip.textContent = 'Discord';
    Object.assign(tooltip.style, {
      position: 'absolute',
      right: '70px',
      bottom: '28px',
      background: 'rgba(0,0,0,0.75)',
      color: 'white',
      padding: '6px 10px',
      borderRadius: '6px',
      fontSize: '13px',
      opacity: '0',
      transition: 'opacity 120ms ease',
      pointerEvents: 'none',
      zIndex: 9999
    });
  a.addEventListener('mouseenter', () => tooltip.style.opacity = '1');
  a.addEventListener('mouseleave', () => tooltip.style.opacity = '0');
  // keyboard accessibility: show tooltip on focus
  a.tabIndex = 0;
  a.addEventListener('focus', () => tooltip.style.opacity = '1');
  a.addEventListener('blur', () => tooltip.style.opacity = '0');
  a.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open(a.href, '_blank'); } });

    document.body.appendChild(a);
    document.body.appendChild(tooltip);
  } catch (err) { console.warn('discord-fab failed', err); }
})();
