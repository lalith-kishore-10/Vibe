// Inject a floating Discord button (bottom-right) across the site
(function(){
  try {
    const INVITE = 'https://discord.gg/NEBbag8B'; // <-- Replace with your real invite
    const id = 'vibe-discord-fab';
    if (document.getElementById(id)) return;

    // Create the button element
    const a = document.createElement('a');
    a.id = id;
    a.href = INVITE;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'discord-fab-btn-open'; // Use a new class for the always-open style
    a.setAttribute('aria-label', 'Join our Discord');

    // Create the SVG icon and text label
    const svgIcon = '<svg width="24" height="24" viewBox="0 0 71 55" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M60.104 4.552A58.764 58.764 0 0 0 46.996.5a41.103 41.103 0 0 0-1.979 4.057 55.842 55.842 0 0 0-14.034 0A41.02 41.02 0 0 0 28.004.5 58.77 58.77 0 0 0 12.896 4.55C3.75 18.52-.96 31.097.41 43.448 13.573 49.113 25.176 51.5 35.5 51.5c10.323 0 21.927-2.386 34.088-8.052 1.374-12.351-3.364-24.928-9.984-38.896zM24.5 36.75c-3.044 0-5.5-2.498-5.5-5.573 0-3.075 2.456-5.573 5.5-5.573 3.045 0 5.501 2.498 5.5 5.573 0 3.075-2.456 5.573-5.5 5.573zm22 0c-3.044 0-5.5-2.498-5.5-5.573 0-3.075 2.456-5.573 5.5-5.573 3.045 0 5.501 2.498 5.5 5.573 0 3.075-2.456 5.573-5.5 5.573z"/></svg>';
    const labelSpan = document.createElement('span');
    labelSpan.textContent = 'Join Discord';
    labelSpan.className = 'discord-fab-label';

    a.innerHTML = svgIcon;
    a.appendChild(labelSpan);

    document.body.appendChild(a);
  } catch (err) {
    console.warn('discord-fab failed', err);
  }
})();