// assets/js/projects.js
// Fetch and render projects in the table on projects.html

const SUPABASE_URL = 'https://poekchmrknttynedwpwm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvZWtjaG1ya250dHluZWR3cHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjMwOTYsImV4cCI6MjA3Mjc5OTA5Nn0.zKMf44M_MKtWVp0U5HCG-QuB7hbxUUu_Mw-xJ-m50tA';

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.supabase || typeof supabase.createClient !== 'function') return;
  const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const tableBody = document.querySelector('#projects-table tbody');
  if (!tableBody) return;
  tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted-2">Loading projects...</td></tr>';

  // Fetch projects with event name
  const { data, error } = await client
    .from('projects')
    .select('id, project_title, team_name, event_id, project_url, events(title)')
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted-2">No projects submitted yet.</td></tr>';
    return;
  }

  tableBody.innerHTML = '';
  data.forEach((project, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="rank">${idx + 1}</td>
      <td class="project">${project.project_title || ''}</td>
      <td class="team">${project.team_name || ''}</td>
      <td class="metric">${project.events?.title || ''}</td>
      <td><a href="${project.project_url || '#'}" class="btn btn-sm vibe-gradient metric" target="_blank">View</a></td>
    `;
    tableBody.appendChild(tr);
  });
});
