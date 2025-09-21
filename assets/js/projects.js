// Supabase project logic for Vibe
const SUPABASE_URL = 'https://poekchmrknttynedwpwm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvZWtjaG1ya250dHluZWR3cHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjMwOTYsImV4cCI6MjA3Mjc5OTA5Nn0.zKMf44M_MKtWVp0U5HCG-QuB7hbxUUu_Mw-xJ-m50tA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Upload a new project
async function uploadProject({ title, theme, link, members }) {
  const { data, error } = await supabase
    .from('projects')
    .insert([{ title, theme, link, members }]);
  return { data, error };
}

// Check if user can vote for a project
async function canVote(userId, projectId) {
  const { data: project, error } = await supabase
    .from('projects')
    .select('members')
    .eq('id', projectId)
    .single();
  if (error || !project) return false;
  return !project.members.includes(userId);
}

// Vote for a project
async function voteProject(project_id, user_id) {
  const allowed = await canVote(user_id, project_id);
  if (!allowed) {
    alert('You cannot vote for your own project!');
    return { error: 'self-vote' };
  }
  const { data, error } = await supabase
    .from('project_votes')
    .insert([{ project_id, user_id, votes: 1 }]);
  return { data, error };
}

// Fetch all projects with votes
async function getProjectsWithVotes() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, theme, link, members, project_votes(votes, user_id)');
  return { data, error };
}
