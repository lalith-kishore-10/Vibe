// Dummy events data (should be replaced with real DB fetch in production)
const DUMMY_EVENTS = [
  { id: 'event1', title: 'Example 1', desc: 'This is a placeholder for event example 1.' },
  { id: 'event2', title: 'Example 2', desc: 'This is a placeholder for event example 2.' },
  { id: 'event3', title: 'Example 3', desc: 'This is a placeholder for event example 3.' },
  { id: 'event4', title: 'Example 4', desc: 'This is a placeholder for event example 4.' },
  { id: 'event5', title: 'Example 5', desc: 'This is a placeholder for event example 5.' },
  { id: 'event6', title: 'Example 6', desc: 'This is a placeholder for event example 6.' }
];

const SUPABASE_URL = 'https://poekchmrknttynedwpwm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvZWtjaG1ya250dHluZWR3cHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjMwOTYsImV4cCI6MjA3Mjc5OTA5Nn0.zKMf44M_MKtWVp0U5HCG-QuB7hbxUUu_Mw-xJ-m50tA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function isLoggedIn() {
  return !!localStorage.getItem('vibe_logged_in');
}

function getUserEmail() {
  if (!isLoggedIn()) return null;
  const user = JSON.parse(localStorage.getItem('vibe_logged_in'));
  return user.email;
}

async function getUserTeamForEvent(eventId) {
  const email = getUserEmail();
  if (!email) return null;
  const { data, error } = await supabase
    .from('event_teams')
    .select('*')
    .eq('event_id', eventId)
    .contains('members', [{ email }]);
  if (error || !data || !data.length) return null;
  return data[0];
}

async function unregisterTeam(teamId) {
  await supabase.from('event_teams').delete().eq('id', teamId);
}

function showTeamDetailsModal(team) {
  let html = `<div class="modal fade" id="teamDetailsModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Team Details</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body">`;
  html += `<div><b>Team Name:</b> ${team.team_name}</div>`;
  html += `<div><b>Project Title:</b> ${team.title}</div>`;
  html += `<div><b>Theme:</b> ${team.theme}</div>`;
  html += `<div class="mt-2"><b>Members:</b><ul>`;
  team.members.forEach(m => {
    html += `<li>${m.name} (${m.email})${m.is_leader ? ' <span class="badge bg-primary">Leader</span>' : ''}</li>`;
  });
  html += `</ul></div></div></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  const modal = new bootstrap.Modal(document.getElementById('teamDetailsModal'));
  modal.show();
  document.getElementById('teamDetailsModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('teamDetailsModal').remove();
  });
}

async function getTeamCountForEvent(eventId) {
  const { count } = await supabase
    .from('event_teams')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);
  return count || 0;
}

async function renderEvents() {
  const container = document.getElementById('events-list');
  if (!container) return;
  const userEmail = getUserEmail();
  container.innerHTML = '';
  for (const ev of DUMMY_EVENTS) {
    let team = null;
    if (userEmail) team = await getUserTeamForEvent(ev.id);
    const teamCount = await getTeamCountForEvent(ev.id);
    const card = document.createElement('div');
    card.className = 'col';
    card.innerHTML = `
      <div class="card card-surface border h-100">
        <div class="card-body">
          <h5 class="h5 fw-semibold text-muted-2">${ev.title}</h5>
          <p class="card-text text-muted-2">${ev.desc}</p>
          <div class="mt-3" id="event-btns-${ev.id}">
            ${!team ? `<a class="btn vibe-gradient btn-sm" href="register-event.html?event=${ev.id}">Register</a>` : `<button class="btn btn-danger btn-sm unregister-btn" data-team="${team.id}" data-event="${ev.id}">Unregister</button> <button class="btn btn-outline-light btn-sm team-details-btn" data-team='${JSON.stringify(team)}'>Team Details</button>`}
          </div>
          <div class="mt-2 small text-muted-2">Registered Teams: <span class="fw-bold">${teamCount}</span></div>
        </div>
      </div>
    `;
    container.appendChild(card);
  }
  // Unregister button handler
  container.querySelectorAll('.unregister-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      if (!confirm('Are you sure you want to unregister your team?')) return;
      const teamId = btn.getAttribute('data-team');
      await unregisterTeam(teamId);
      renderEvents();
    });
  });
  // Team details button handler
  container.querySelectorAll('.team-details-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const team = JSON.parse(btn.getAttribute('data-team'));
      // Only allow if user is a member
      const email = getUserEmail();
      if (!team.members.some(m => m.email === email)) {
        alert('You are not a member of this team.');
        return;
      }
      showTeamDetailsModal(team);
    });
  });
}

document.addEventListener('DOMContentLoaded', renderEvents);
