let userId = null;

const $ = (id) => document.getElementById(id);

function showSection(sectionId) {
  ["login-section", "registration-section", "dashboard"].forEach((id) => {
    $(id).hidden = id !== sectionId;
  });
}

function showMessage(id, message, success = false) {
  $(id).textContent = message;
  $(id).style.color = success ? "#187744" : "#b93838";
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// Register user
$("registration-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const data = await request("/api/register", {
      method: "POST",
      body: JSON.stringify({
        username: $("username").value.trim(),
        email: $("reg-email").value.trim(),
        rollNumber: $("roll-number").value.trim(),
        casualLeave: Number($("casual-leave").value),
        medicalLeave: Number($("medical-leave").value)
      })
    });

    $("registration-form").reset();
    showSection("login-section");
    showMessage("login-message", data.message + ". Please log in.", true);
    showMessage("registration-message", "");
  } catch (error) {
    showMessage("registration-message", error.message);
  }
});

// Login by email (for classroom demonstration only)
$("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const data = await request("/api/login", {
      method: "POST",
      body: JSON.stringify({ email: $("email").value.trim() })
    });

    userId = data.userId;
    $("username-display").textContent = data.username;
    $("roll-number-display").textContent = data.rollNumber;
    $("casual-leave-display").textContent = data.casualLeave;
    $("medical-leave-display").textContent = data.medicalLeave;

    showMessage("login-message", "");
    showMessage("response-message", "");
    showSection("dashboard");
  } catch (error) {
    showMessage("login-message", error.message);
  }
});

// Refresh current leave balance
async function refreshLeaveBalance() {
  if (!userId) return;

  try {
    const data = await request(`/api/leave-balance/${userId}`);
    $("casual-leave-display").textContent = data.casualLeave;
    $("medical-leave-display").textContent = data.medicalLeave;
    showMessage("response-message", "Leave balance updated.", true);
  } catch (error) {
    showMessage("response-message", error.message);
  }
}

$("refresh-balance").addEventListener("click", refreshLeaveBalance);

// Apply for leave
$("leave-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!userId) {
    showMessage("response-message", "Please log in first.");
    return;
  }

  try {
    const data = await request(`/api/apply-leave/${userId}`, {
      method: "POST",
      body: JSON.stringify({
        type: $("leave-type").value,
        days: Number($("leave-days").value)
      })
    });

    $("casual-leave-display").textContent = data.casualLeave;
    $("medical-leave-display").textContent = data.medicalLeave;
    $("leave-form").reset();
    showMessage("response-message", data.message, true);
  } catch (error) {
    showMessage("response-message", error.message);
  }
});

// Logout
$("logout-button").addEventListener("click", () => {
  userId = null;
  $("login-form").reset();
  $("leave-form").reset();
  showMessage("login-message", "");
  showMessage("response-message", "");
  showSection("login-section");
});

// Switch between login and registration
$("show-registration").addEventListener("click", () => {
  showMessage("registration-message", "");
  showSection("registration-section");
});

$("show-login").addEventListener("click", () => {
  showMessage("login-message", "");
  showSection("login-section");
});
