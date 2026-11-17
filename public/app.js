const $ = (id) => document.getElementById(id);
let userId = null;

function message(id, text, error = false) {
  $(id).textContent = text;
  $(id).className = error ? "message error" : "message success";
}
function show(view) {
  ["login-section", "registration-section", "balance-section", "apply-leave-section"]
    .forEach(id => $(id).hidden = id !== view && !(view === "dashboard" && ["balance-section", "apply-leave-section"].includes(id)));
}
async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}
function showDashboard(user) {
  userId = user.userId;
  localStorage.setItem("leaveUserId", userId);
  $("username-display").textContent = user.username;
  $("roll-number-display").textContent = user.rollNumber;
  $("casual-leave-display").textContent = user.casualLeave;
  $("medical-leave-display").textContent = user.medicalLeave;
  show("dashboard");
}

$("show-registration").addEventListener("click", () => show("registration-section"));
$("show-login").addEventListener("click", () => show("login-section"));

$("registration-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    username: $("username").value.trim(),
    email: $("reg-email").value.trim(),
    rollNumber: $("roll-number").value.trim(),
    casualLeave: Number($("casual-leave").value),
    medicalLeave: Number($("medical-leave").value)
  };
  try {
    const data = await api("/api/register", { method: "POST", body: JSON.stringify(payload) });
    $("registration-form").reset();
    $("email").value = payload.email;
    message("registration-response", data.message);
    show("login-section");
  } catch (err) {
    message("registration-response", err.message, true);
  }
});

$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const data = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ email: $("email").value.trim() })
    });
    showDashboard(data);
    message("response-message", data.message);
  } catch (err) {
    message("response-message", err.message, true);
  }
});

$("refresh-balance").addEventListener("click", async () => {
  if (!userId) return show("login-section");
  try {
    const data = await api(`/api/leave-balance/${userId}`);
    $("casual-leave-display").textContent = data.casualLeave;
    $("medical-leave-display").textContent = data.medicalLeave;
    message("response-message", "Leave balance refreshed.");
  } catch (err) {
    message("response-message", err.message, true);
  }
});

$("logout-button").addEventListener("click", () => {
  userId = null;
  localStorage.removeItem("leaveUserId");
  $("login-form").reset();
  show("login-section");
  message("response-message", "You have logged out.");
});

$("leave-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!userId) return show("login-section");
  try {
    const data = await api(`/api/apply-leave/${userId}`, {
      method: "POST",
      body: JSON.stringify({ type: $("leave-type").value, days: Number($("leave-days").value) })
    });
    $("casual-leave-display").textContent = data.casualLeave;
    $("medical-leave-display").textContent = data.medicalLeave;
    $("leave-form").reset();
    message("response-message", data.message);
  } catch (err) {
    message("response-message", err.message, true);
  }
});

show("login-section");
