
const config = window.AURA_CONFIG;

const configured =
  config &&
  config.SUPABASE_URL &&
  config.SUPABASE_PUBLISHABLE_KEY &&
  !config.SUPABASE_URL.includes("YOUR_") &&
  !config.SUPABASE_PUBLISHABLE_KEY.includes("YOUR_");

const board = document.getElementById("leaderboard");
const search = document.getElementById("search");
const emptyState = document.getElementById("empty-state");

document.getElementById("year").textContent = new Date().getFullYear();

let members = [];

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getInitials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0] || "")
    .join("")
    .toUpperCase();
}

function renderLeaderboard() {
  const query = search.value.trim().toLowerCase();

  const filtered = members.filter(member =>
    String(member.display_name).toLowerCase().includes(query)
  );

  board.innerHTML = "";
  emptyState.hidden = filtered.length > 0;

  filtered.forEach((member, index) => {
    const row = document.createElement("div");
    row.className = "member-row";

    const rankClass =
      index === 0 ? "first" :
      index === 1 ? "second" :
      index === 2 ? "third" : "";

    row.innerHTML = `
      <div class="member-info">
        <span class="rank ${rankClass}">${index + 1}</span>
        <span class="avatar">${escapeHTML(getInitials(member.display_name))}</span>
        <div>
          <div class="member-name">${escapeHTML(member.display_name)}</div>
          <div class="member-sub">Community member</div>
        </div>
      </div>
      <div class="points">
        ${Number(member.aura_points).toLocaleString()}
        <small>AP</small>
      </div>
    `;

    board.appendChild(row);
  });

  document.getElementById("member-count").textContent =
    members.length.toLocaleString();

  document.getElementById("total-aura").textContent =
    members.reduce(
      (total, member) => total + Number(member.aura_points || 0),
      0
    ).toLocaleString();

  document.getElementById("top-rank").textContent =
    members[0]?.display_name || "—";
}

async function loadLeaderboard() {
  if (!configured) {
    board.innerHTML = `
      <div class="loading">
        Add your Supabase Project URL and publishable key to config.js.
      </div>
    `;
    document.getElementById("data-note").textContent =
      "Database setup is not finished.";
    return;
  }

  const supabase = window.supabase.createClient(
    config.SUPABASE_URL,
    config.SUPABASE_PUBLISHABLE_KEY
  );

  const { data, error } = await supabase
    .from("public_leaderboard")
    .select("display_name, aura_points")
    .order("aura_points", { ascending: false })
    .order("display_name", { ascending: true });

  if (error) {
    board.innerHTML = `
      <div class="loading">
        Unable to load leaderboard data. Check your database permissions.
      </div>
    `;

    document.getElementById("data-note").textContent =
      "Database connection needs attention.";

    console.error("Leaderboard error:", error.message);
    return;
  }

  members = data || [];

  document.getElementById("data-note").textContent =
    "Leaderboard data loaded from Supabase.";

  renderLeaderboard();
}

search.addEventListener("input", renderLeaderboard);

loadLeaderboard();
