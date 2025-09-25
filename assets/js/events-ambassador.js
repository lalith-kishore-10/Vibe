// events-ambassador.js
// Checks ambassador status and exposes it for use in events.html

const SUPABASE_URL = 'https://poekchmrknttynedwpwm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvZWtjaG1ya250dHluZWR3cHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjMwOTYsImV4cCI6MjA3Mjc5OTA5Nn0.zKMf44M_MKtWVp0U5HCG-QuB7hbxUUu_Mw-xJ-m50tA';

window.isAmbassador = false;
window.ambassadorProfile = null;

async function checkAmbassadorStatus() {
  const authRaw = localStorage.getItem('vibe_logged_in');
  if (!authRaw) return false;
  const auth = JSON.parse(authRaw);
  if (!auth.id) {
    return false;
  }
  if (!window.supabase || typeof supabase.createClient !== 'function') {
    return false;
  }
  const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  // Fetch profile by user id
  const { data, error } = await client
    .from('profiles')
    .select('id, ambassador, full_name, college')
    .eq('id', auth.id)
    .single();
  if (error || !data) {
    window.isAmbassador = false;
    window.ambassadorProfile = null;
    return false;
  }
  window.isAmbassador = !!data.ambassador;
  window.ambassadorProfile = data;
  return window.isAmbassador;
}

// Call on page load
checkAmbassadorStatus();
