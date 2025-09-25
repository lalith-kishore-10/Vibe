// assets/js/projects.js
// Fetch and render projects in the table on projects.html

const SUPABASE_URL = 'https://poekchmrknttynedwpwm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvZWtjaG1ya250dHluZWR3cHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjMwOTYsImV4cCI6MjA3Mjc5OTA5Nn0.zKMf44M_MKtWVp0U5HCG-QuB7hbxUUu_Mw-xJ-m50tA';

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.supabase || typeof supabase.createClient !== 'function') return;
  const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const tableBody = document.querySelector('#projects-table tbody');
  if (!tableBody) return;
  tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted-2">Loading projects...</td></tr>';

  // Get current user info
  const authRaw = localStorage.getItem('vibe_logged_in');
  const auth = authRaw ? JSON.parse(authRaw) : null;
  const userId = auth && auth.id ? auth.id : null;
  const userEmail = auth && auth.email ? auth.email.toLowerCase() : null;

  // Fetch all registrations for this user (as team lead)
  const { data: regData } = await client
    .from('registrations')
    .select('id, event_id, team_lead, team_name, members');
  // Find event_ids where user is team lead (by id or email)
  const leadEventIds = new Set();
  const leadRegByEvent = {};
  if (regData) {
    regData.forEach(r => {
      if ((userId && r.team_lead === userId) ||
          (userEmail && typeof r.team_lead === 'string' && r.team_lead.toLowerCase() === userEmail)) {
        leadEventIds.add(r.event_id);
        leadRegByEvent[r.event_id] = r;
      }
    });
  }

  // Fetch projects with event name
  const { data, error } = await client
    .from('projects')
    .select('id, project_title, team_name, event_id, project_url, events(title)')
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted-2">No projects submitted yet.</td></tr>';
    // Show upload button for events where user is team lead and hasn't uploaded
    if (leadEventIds.size > 0) {
      leadEventIds.forEach(eventId => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" class="text-center"><button class="btn vibe-gradient upload-btn" data-event-id="${eventId}">Upload Project</button></td>`;
        tableBody.appendChild(tr);
      });
    }
    setupUploadBtns();
    return;
  }

  // Track which events already have a project
  const uploadedEvents = new Set(data.map(p => p.event_id));

  tableBody.innerHTML = '';
  data.forEach((project, idx) => {
    const tr = document.createElement('tr');
    let uploadCell = '';
    // If user is team lead for this event and hasn't uploaded, show upload button
    if (leadEventIds.has(project.event_id) && !uploadedEvents.has(project.event_id)) {
      uploadCell = `<button class="btn vibe-gradient btn-sm upload-btn" data-event-id="${project.event_id}">Upload Project</button>`;
    }
    tr.innerHTML = `
      <td class="rank">${idx + 1}</td>
      <td class="project">${project.project_title || ''}</td>
      <td class="team">${project.team_name || ''}</td>
      <td class="metric">${project.events?.title || ''}</td>
      <td><a href="${project.project_url || '#'}" class="btn btn-sm vibe-gradient metric" target="_blank">View</a></td>
      <td>${uploadCell}</td>
    `;
    tableBody.appendChild(tr);
  });

  // For events where user is team lead but hasn't uploaded, show upload button row
  leadEventIds.forEach(eventId => {
    if (!uploadedEvents.has(eventId)) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="6" class="text-center"><button class="btn vibe-gradient upload-btn" data-event-id="${eventId}">Upload Project</button></td>`;
      tableBody.appendChild(tr);
    }
  });
  setupUploadBtns();

  // --- Upload Modal logic ---
  function setupUploadBtns() {
    document.querySelectorAll('.upload-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const eventId = this.getAttribute('data-event-id');
        // Find registration for this event
        const reg = leadRegByEvent[eventId];
        if (!reg) {
          alert('Registration not found for this event.');
          return;
        }
        document.getElementById('uploadEventId').value = eventId;
        document.getElementById('uploadRegistrationId').value = reg.id;
        document.getElementById('projectTitle').value = '';
        document.getElementById('projectTheme').value = '';
        document.getElementById('projectUrl').value = '';
        new bootstrap.Modal(document.getElementById('uploadProjectModal')).show();
      });
    });
  }

  // Handle upload form submit
  const uploadForm = document.getElementById('uploadProjectForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const event_id = document.getElementById('uploadEventId').value;
      const registration_id = document.getElementById('uploadRegistrationId').value;
      const project_title = document.getElementById('projectTitle').value;
      const theme = document.getElementById('projectTheme').value;
      const project_url = document.getElementById('projectUrl').value;
      // Find registration for this event
      const reg = leadRegByEvent[event_id];
      if (!reg) {
        alert('Registration not found.');
        return;
      }
      // Insert project
      const { error } = await client.from('projects').insert([{
        event_id,
        registration_id,
        team_lead: reg.team_lead,
        team_name: reg.team_name,
        project_title,
        theme,
        project_url
      }]);
      if (error) {
        alert('Error uploading project: ' + error.message);
      } else {
        bootstrap.Modal.getInstance(document.getElementById('uploadProjectModal')).hide();
        alert('Project uploaded successfully!');
        location.reload();
      }
    });
  }
});
