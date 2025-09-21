// JS for register-event.html: handles team registration for events
const SUPABASE_URL = 'https://poekchmrknttynedwpwm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvZWtjaG1ya250dHluZWR3cHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjMwOTYsImV4cCI6MjA3Mjc5OTA5Nn0.zKMf44M_MKtWVp0U5HCG-QuB7hbxUUu_Mw-xJ-m50tA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function getEventIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('event');
}

function renderMemberInputs(size) {
  const membersDiv = document.getElementById('team-members');
  membersDiv.innerHTML = '';
  for (let i = 0; i < size; i++) {
    membersDiv.innerHTML += `
      <div class="mb-2 row g-2 align-items-center">
        <div class="col-6"><input type="text" class="form-control" name="member-name" placeholder="Member ${i+1} Name" required></div>
        <div class="col-6"><input type="email" class="form-control" name="member-email" placeholder="Member ${i+1} Email" required></div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const eventId = getEventIdFromUrl();
  if (!eventId) {
    document.getElementById('register-form-area').innerHTML = '<div class="alert alert-danger">No event specified.</div>';
    return;
  }
  // Team size input
  const teamSizeInput = document.getElementById('team-size');
  teamSizeInput.addEventListener('input', function() {
    let size = parseInt(teamSizeInput.value);
    if (isNaN(size) || size < 2) size = 2;
    if (size > 5) size = 5;
    teamSizeInput.value = size;
    renderMemberInputs(size);
  });
  renderMemberInputs(parseInt(teamSizeInput.value) || 2);

  // Form submit
  document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const teamName = document.getElementById('team-name').value.trim();
    const teamSize = parseInt(document.getElementById('team-size').value);
    const title = document.getElementById('project-title').value.trim();
    const theme = document.getElementById('project-theme').value.trim();
    const memberNames = Array.from(document.getElementsByName('member-name')).map(x => x.value.trim());
    const memberEmails = Array.from(document.getElementsByName('member-email')).map(x => x.value.trim());
    const members = memberNames.map((name, i) => ({ name, email: memberEmails[i], is_leader: i === 0 }));
    const msg = document.getElementById('register-msg');
    // Prevent duplicate registration: check if any member is already registered for this event
    let alreadyRegistered = false;
    for (const email of memberEmails) {
      const { data, error } = await supabase
        .from('event_teams')
        .select('id')
        .eq('event_id', eventId)
        .contains('members', [{ email }]);
      if (data && data.length > 0) {
        alreadyRegistered = true;
        break;
      }
    }
    if (alreadyRegistered) {
      msg.textContent = 'One or more team members are already registered for this event.';
      msg.className = 'text-danger mt-2';
      return;
    }
    // Save to Supabase
    const { data, error } = await supabase.from('event_teams').insert([{ event_id: eventId, team_name: teamName, team_size: teamSize, members, title, theme }]);
    if (error) {
      msg.textContent = 'Registration failed: ' + error.message;
      msg.className = 'text-danger mt-2';
    } else {
      msg.textContent = 'Team registered successfully!';
      msg.className = 'text-success mt-2';
      document.getElementById('register-form').reset();
      renderMemberInputs(2);
    }
  });
});
