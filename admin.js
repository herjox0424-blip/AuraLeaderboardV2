
(() => {
  const config = window.AURA_CONFIG || {};
  const url = config.SUPABASE_URL;
  const key = config.SUPABASE_PUBLISHABLE_KEY;

  const loginPanel = document.getElementById("login-panel");
  const adminPanel = document.getElementById("admin-panel");
  const loginForm = document.getElementById("login-form");
  const adjustForm = document.getElementById("adjust-form");
  const loginMessage = document.getElementById("login-message");
  const adminMessage = document.getElementById("admin-message");
  const memberSelect = document.getElementById("member-select");
  const membersTable = document.getElementById("members-table");

  let supabase = null;

  function message(element, text, isError = false) {
    element.textContent = text;
    element.classList.toggle("error", isError);
    element.classList.toggle("success", !isError && Boolean(text));
  }

  function points(value) {
    return Number(value || 0).toLocaleString();
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function showLogin() {
    loginPanel.classList.remove("hidden");
    adminPanel.classList.add("hidden");
  }

  function showAdmin(user) {
    loginPanel.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    document.getElementById("signed-in-as").textContent =
      `Signed in as ${user.email || "admin"}`;
  }

  async function loadMembers() {
    const { data, error } = await supabase
      .from("public_leaderboard")
      .select("*")
      .order("aura_points", { ascending: false });

    if (error) {
      message(adminMessage, `Could not load members: ${error.message}`, true);
      return;
    }

    // This assumes public_leaderboard includes an id column.
    // If your view currently only has display_name and aura_points,
    // we will update the view to include member IDs in the SQL setup.
    memberSelect.innerHTML = '<option value="">Choose a member...</option>';

    membersTable.innerHTML = "";

    if (!data || data.length === 0) {
      membersTable.innerHTML =
        '<tr><td colspan="2">No members found.</td></tr>';
      return;
    }

    data.forEach(member => {
      const option = document.createElement("option");
      option.value = member.id;
      option.textContent =
        `${member.display_name} — ${points(member.aura_points)} AP`;
      memberSelect.appendChild(option);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(member.display_name)}</td>
        <td>${points(member.aura_points)} AP</td>
      `;
      membersTable.appendChild(row);
    });
  }

  async function checkSession() {
    if (!supabase) return;

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      showLogin();
      return;
    }

    showAdmin(data.session.user);
    await loadMembers();
  }

  if (
    !url ||
    !key ||
    url.includes("YOUR_SUPABASE") ||
    key.includes("YOUR_SUPABASE")
  ) {
    message(
      loginMessage,
      "Set your Supabase URL and publishable key in config.js first.",
      true
    );
    loginForm.querySelector("button").disabled = true;
    return;
  }

  supabase = window.supabase.createClient(url, key);

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    message(loginMessage, "Signing in...");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      message(loginMessage, error.message, true);
      return;
    }

    message(loginMessage, "");
    showAdmin(data.user);
    await loadMembers();
  });

  document.getElementById("logout-button").addEventListener("click", async () => {
    await supabase.auth.signOut();
    showLogin();
    message(loginMessage, "You have signed out.");
  });

  adjustForm.addEventListener("submit", async event => {
    event.preventDefault();
    message(adminMessage, "Applying Aura Point change...");

    const memberId = Number(memberSelect.value);
    const amount = Number(document.getElementById("amount").value);
    const reason = document.getElementById("reason").value.trim();

    if (!Number.isInteger(memberId) || memberId <= 0) {
      message(adminMessage, "Choose a valid member.", true);
      return;
    }

    if (!Number.isInteger(amount) || amount === 0) {
      message(adminMessage, "Enter a non-zero whole number.", true);
      return;
    }

    if (!reason) {
      message(adminMessage, "Please enter a reason.", true);
      return;
    }

    const { error } = await supabase.rpc("adjust_aura_points", {
      p_member_id: memberId,
      p_amount: amount,
      p_reason: reason
    });

    if (error) {
      message(
        adminMessage,
        `Change failed: ${error.message}. Check the database setup and admin permissions.`,
        true
      );
      return;
    }

    message(adminMessage, "Aura Points updated successfully!");
    document.getElementById("amount").value = "";
    document.getElementById("reason").value = "";
    await loadMembers();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) showLogin();
  });

  checkSession();
})();
