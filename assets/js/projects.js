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

  // Fetch all registrations with a project link
  const { data: regData, error } = await client
    .from('registrations')
    .select('id, event_id, team_lead, team_name, members, project_link, link_uploaded_at, events(title)')
    .order('link_uploaded_at', { ascending: true });

  if (error || !regData || regData.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted-2">No projects submitted yet.</td></tr>';
    return;
  }

  tableBody.innerHTML = '';
  regData.forEach((reg, idx) => {
    if (!reg.project_link) return; // Only show if project link is present
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="rank">${idx + 1}</td>
      <td class="project">${reg.team_name || ''}</td>
      <td class="team">${reg.members?.map(m => m.name).join(', ') || ''}</td>
      <td class="metric">${reg.events?.title || ''}</td>
      <td><a href="${reg.project_link}" class="btn btn-sm vibe-gradient metric" target="_blank">View</a></td>
      <td></td>
    `;
    tableBody.appendChild(tr);
  });

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
