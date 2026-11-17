
const $ = (id) => document.getElementById(id);
let userId = null;

// Render backend URL
const API_BASE = "https://leave-management-x6i5.onrender.com";

// Display messages
function message(id, text, error = false) {
  $(id).textContent = text;
  $(id).className = error ? "message error" : "message success";
}

// Switch between sections
function show(view) {
  ["login-section", "registration-section", "balance-section", "apply-leave-section"]
    .forEach(id => {
      $(id).hidden =
        id !== view &&
        !(view === "dashboard" &&
          ["balance-section", "apply-leave-section"].includes(id));
    });
}

// API request function
async function api(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

// Display dashboard
function showDashboard(user) {
  userId = user.userId;

  localStorage.setItem("leaveUserId", userId);

  $("username-display").textContent = user.username;
  $("roll-number-display").textContent = user.rollNumber;
  $("casual-leave-display").textContent = user.casualLeave;
  $("medical-leave-display").textContent = user.medicalLeave;

  show("dashboard");
}

// Navigate to registration
$("show-registration").addEventListener("click", () => {
  show("registration-section");
});

// Navigate to login
$("show-login").addEventListener("click", () => {
  show("login-section");
});

// User registration
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
    const data = await api("/api/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    $("registration-form").reset();
    $("email").value = payload.email;

    message("registration-response", data.message);
    show("login-section");

  } catch (err) {
    message("registration-response", err.message, true);
  }
});

// User login
$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const data = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({
        email: $("email").value.trim()
      })
    });

    showDashboard(data);
    message("response-message", data.message);

  } catch (err) {
    message("response-message", err.message, true);
  }
});

// Refresh leave balance
$("refresh-balance").addEventListener("click", async () => {
  if (!userId) {
    return show("login-section");
  }

  try {
    const data = await api(`/api/leave-balance/${userId}`);

    $("casual-leave-display").textContent = data.casualLeave;
    $("medical-leave-display").textContent = data.medicalLeave;

    message("response-message", "Leave balance refreshed.");

  } catch (err) {
    message("response-message", err.message, true);
  }
});

// User logout
$("logout-button").addEventListener("click", () => {
  userId = null;

  localStorage.removeItem("leaveUserId");
  $("login-form").reset();

  show("login-section");
  message("response-message", "You have logged out.");
});

// Apply for leave
$("leave-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!userId) {
    return show("login-section");
  }

  try {
    const data = await api(`/api/apply-leave/${userId}`, {
      method: "POST",
      body: JSON.stringify({
        type: $("leave-type").value,
        days: Number($("leave-days").value)
      })
    });

    $("casual-leave-display").textContent = data.casualLeave;
    $("medical-leave-display").textContent = data.medicalLeave;

    $("leave-form").reset();

    message("response-message", data.message);

  } catch (err) {
    message("response-message", err.message, true);
  }
});

// Show login page initially
show("login-section");
