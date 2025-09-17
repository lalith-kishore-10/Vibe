// Shared auth nav script: reads localStorage.vibe_logged_in and updates navbar
document.addEventListener('DOMContentLoaded', () => {
  try {
    const authRaw = localStorage.getItem('vibe_logged_in');
    if (!authRaw) return; // not logged in
    const auth = JSON.parse(authRaw);

    // Find login/signup anchors
    const loginAnchor = document.querySelector('a[href="login.html"], a[href$="/login.html"]');
    const signupAnchor = document.querySelector('a[href="signup.html"], a[href$="/signup.html"]');

    // Determine a sensible container to insert the auth UI
    let container = document.getElementById('nav-auth-area') || (loginAnchor && loginAnchor.parentElement) || (signupAnchor && signupAnchor.parentElement) || document.querySelector('.navbar .ms-auto') || document.querySelector('.ms-auto.d-flex');
    if (!container) return;

    // Remove login/signup anchors from DOM if present
    if (loginAnchor && loginAnchor.parentNode) loginAnchor.parentNode.removeChild(loginAnchor);
    if (signupAnchor && signupAnchor.parentNode) signupAnchor.parentNode.removeChild(signupAnchor);

    // Also defensively remove any other anchors linking to login.html
    document.querySelectorAll('a[href="login.html"], a[href$="/login.html"]').forEach(a => {
      if (a && a.parentNode) a.parentNode.removeChild(a);
    });

    // Build profile icon, badge + logout
    const wrapper = document.createElement('div');
    wrapper.className = 'd-flex align-items-center gap-2';

    // Profile link (icon)
    const profileLink = document.createElement('a');
    profileLink.href = 'profile.html';
    profileLink.className = 'd-flex align-items-center text-decoration-none';
    profileLink.setAttribute('aria-label', 'Profile');
    const profileIcon = document.createElement('div');
    profileIcon.className = 'rounded-circle bg-white text-dark d-inline-flex align-items-center justify-content-center';
    profileIcon.style.width = '34px';
    profileIcon.style.height = '34px';
    profileIcon.style.fontSize = '0.9rem';
  const displayName = auth.name || auth.fullName || (auth.email ? auth.email.split('@')[0] : 'User');
  profileIcon.textContent = (displayName && displayName[0]) ? displayName[0].toUpperCase() : 'U';
    profileLink.appendChild(profileIcon);

    const badge = document.createElement('div');
    badge.className = 'small text-muted-2';
  badge.textContent = displayName || auth.email || 'You';

    const logout = document.createElement('button');
    logout.className = 'btn btn-outline-light btn-sm';
    logout.textContent = 'Logout';
    logout.addEventListener('click', () => {
      localStorage.removeItem('vibe_logged_in');
      // best-effort sign out from Supabase if available
      try {
        if (window.supabase && typeof supabase.createClient === 'function') {
          const client = supabase.createClient('https://poekchmrknttynedwpwm.supabase.co','public');
          if (client?.auth?.signOut) client.auth.signOut().catch(()=>{});
        }
      } catch (e) {}
      window.location.reload();
    });

    wrapper.appendChild(profileLink);
    wrapper.appendChild(badge);
    wrapper.appendChild(logout);
    container.appendChild(wrapper);
  } catch (err) {
    console.error('auth-nav init failed', err);
  }
});
