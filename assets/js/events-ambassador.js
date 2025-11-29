// events-ambassador.js
// Checks ambassador status and exposes it for use in events.html

window.isAmbassador = false;
window.ambassadorProfile = null;

async function checkAmbassadorStatus() {
  const authRaw = localStorage.getItem("vibe_logged_in");
  if (!authRaw) {
    window.isAmbassador = false;
    window.ambassadorProfile = null;
    return false;
  }
  const auth = JSON.parse(authRaw);
  if (!auth.id) {
    window.isAmbassador = false;
    window.ambassadorProfile = null;
    return false;
  }

  // Use the shared client instance if available
  if (!window.vibeSupabaseClient) {
    // Retry after a short delay if Supabase client isn't created yet
    setTimeout(checkAmbassadorStatus, 100);
    return false;
  }
  const client = window.vibeSupabaseClient;
  // Fetch profile by user id
  const { data, error } = await client
    .from("profiles")
    .select("id, ambassador, full_name, college")
    .eq("id", auth.id)
    .single();
  if (error || !data) {
    window.isAmbassador = false;
    window.ambassadorProfile = null;
    console.log("Ambassador check: Not an ambassador or error", error);
    return false;
  }
  window.isAmbassador = !!data.ambassador;
  window.ambassadorProfile = data;
  console.log("Ambassador status loaded:", window.isAmbassador);

  // Dispatch event to notify that ambassador status is ready
  window.dispatchEvent(
    new CustomEvent("ambassadorStatusLoaded", {
      detail: { isAmbassador: window.isAmbassador },
    })
  );

  return window.isAmbassador;
}

// Call on page load
checkAmbassadorStatus();
