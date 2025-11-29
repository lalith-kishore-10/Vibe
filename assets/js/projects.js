// assets/js/projects.js
// Fetch and render projects in the table on projects.html

document.addEventListener("DOMContentLoaded", async () => {
  // Use the shared client from projects.html
  if (!window.vibeSupabaseClient) {
    console.error("Supabase client not initialized");
    return;
  }
  const client = window.vibeSupabaseClient;
  const tableBody = document.querySelector("#projects-table tbody");
  if (!tableBody) return;
  tableBody.innerHTML =
    '<tr><td colspan="6" class="text-center text-muted-2">Loading projects...</td></tr>';

  // Get current user info
  const authRaw = localStorage.getItem("vibe_logged_in");
  const auth = authRaw ? JSON.parse(authRaw) : null;
  const userId = auth && auth.id ? auth.id : null;
  const userEmail = auth && auth.email ? auth.email.toLowerCase() : null;

  // Fetch all registrations with a project link
  console.log("Fetching registrations with project links...");
  const { data: regData, error } = await client
    .from("registrations")
    .select(
      "id, event_id, team_lead, team_name, project_name, project_description, members, project_link, link_uploaded_at, events(title)"
    )
    .not("project_link", "is", null)
    .order("link_uploaded_at", { ascending: false });

  console.log("Registrations fetched:", regData);
  console.log("Error (if any):", error);

  if (error) {
    console.error("Error fetching projects:", error);
    tableBody.innerHTML =
      '<tr><td colspan="6" class="text-center text-danger">Error loading projects: ' +
      error.message +
      "</td></tr>";
    return;
  }

  if (!regData || regData.length === 0) {
    // Let's also check all registrations to debug
    const { data: allRegs } = await client
      .from("registrations")
      .select("id, project_link");
    console.log("All registrations (for debugging):", allRegs);

    tableBody.innerHTML =
      '<tr><td colspan="6" class="text-center text-muted-2">No projects submitted yet. Check console for details.</td></tr>';
    return;
  }

  tableBody.innerHTML = "";
  regData.forEach((reg, idx) => {
    // Build team members list (team lead + other members)
    const teamLeadName = reg.team_lead?.split("@")[0] || "Team Lead";
    const allMembers = [teamLeadName];
    if (reg.members && Array.isArray(reg.members)) {
      allMembers.push(...reg.members.map((m) => m.name));
    }
    const teamMembersText = allMembers.join(", ");

    // Truncate description if too long
    const description = reg.project_description || "No description provided";
    const truncatedDesc =
      description.length > 80
        ? description.substring(0, 77) + "..."
        : description;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="rank">${idx + 1}</td>
      <td class="project">${reg.team_name || "Untitled Team"}</td>
      <td class="project">${reg.project_name || "Untitled Project"}</td>
      <td class="metric" style="text-align: left; max-width: 300px;">${truncatedDesc}</td>
      <td class="metric">${reg.events?.title || "Unknown Event"}</td>
      <td><a href="${
        reg.project_link
      }" class="btn btn-sm vibe-gradient metric" target="_blank">View</a></td>
      <td><button class="btn btn-sm btn-outline-light view-team-btn" data-team-name="${
        reg.team_name || "Untitled Team"
      }" data-team-lead="${teamLeadName}" data-members='${JSON.stringify(
      reg.members || []
    )}'>View Team</button></td>
    `;
    tableBody.appendChild(tr);
  });

  // View Team button logic
  document.querySelectorAll(".view-team-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const teamName = this.getAttribute("data-team-name");
      const teamLead = this.getAttribute("data-team-lead");
      const membersJson = this.getAttribute("data-members");
      let members = [];
      try {
        members = JSON.parse(membersJson);
      } catch (e) {}

      // Build team details HTML
      let html = `<h6 class="text-white mb-3">${teamName}</h6>`;
      html += `<div class="mb-3"><strong>Team Lead:</strong> ${teamLead}</div>`;

      if (members.length > 0) {
        html += `<div><strong>Team Members:</strong></div><ul class="list-unstyled ms-3 mt-2">`;
        members.forEach((m) => {
          html += `<li>• ${m.name} <span class="text-muted">(${m.email})</span></li>`;
        });
        html += `</ul>`;
      } else {
        html += `<div class="text-muted">No additional members</div>`;
      }

      document.getElementById("teamDetailsContent").innerHTML = html;
      new bootstrap.Modal(document.getElementById("teamDetailsModal")).show();
    });
  });

  // --- Upload Modal logic ---
  function setupUploadBtns() {
    document.querySelectorAll(".upload-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const eventId = this.getAttribute("data-event-id");
        // Find registration for this event
        const reg = leadRegByEvent[eventId];
        if (!reg) {
          alert("Registration not found for this event.");
          return;
        }
        document.getElementById("uploadEventId").value = eventId;
        document.getElementById("uploadRegistrationId").value = reg.id;
        document.getElementById("projectTitle").value = "";
        document.getElementById("projectTheme").value = "";
        document.getElementById("projectUrl").value = "";
        new bootstrap.Modal(
          document.getElementById("uploadProjectModal")
        ).show();
      });
    });
  }

  // Handle upload form submit
  const uploadForm = document.getElementById("uploadProjectForm");
  if (uploadForm) {
    uploadForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const event_id = document.getElementById("uploadEventId").value;
      const registration_id = document.getElementById(
        "uploadRegistrationId"
      ).value;
      const project_title = document.getElementById("projectTitle").value;
      const theme = document.getElementById("projectTheme").value;
      const project_url = document.getElementById("projectUrl").value;
      // Find registration for this event
      const reg = leadRegByEvent[event_id];
      if (!reg) {
        alert("Registration not found.");
        return;
      }
      // Insert project
      const { error } = await client.from("projects").insert([
        {
          event_id,
          registration_id,
          team_lead: reg.team_lead,
          team_name: reg.team_name,
          project_title,
          theme,
          project_url,
        },
      ]);
      if (error) {
        alert("Error uploading project: " + error.message);
      } else {
        bootstrap.Modal.getInstance(
          document.getElementById("uploadProjectModal")
        ).hide();
        alert("Project uploaded successfully!");
        location.reload();
      }
    });
  }
});
