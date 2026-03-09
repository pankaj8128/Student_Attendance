// --- DOM Elements ---
const loginSection = document.getElementById("login-section");
const signupSection = document.getElementById("signup-section");
const signupStep = document.getElementById("signup-step");

const showSignupBtn = document.getElementById("show-signup");
const showLoginBtn = document.getElementById("show-login");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const response = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (response.status === 200) {
    window.location.href = "/dashboard";
  } else {
    showNotification(data.message);
  }
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("signup-username").value;
  const firstName = document.getElementById("first_name").value;
  const lastName = document.getElementById("last_name").value;
  const password = document.getElementById("signup-password").value;
  if (password !== document.getElementById("confirm-password").value) {
    showNotification("Passwords do not match");
    return;
  }
  const response = await fetch("/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      first_name: firstName,
      last_name: lastName,
      password,
    }),
  });
  const data = await response.json();
  if (response.status === 200) {
    window.location.href = "/dashboard";
  } else {
    showNotification(data.message);
  }
});

// --- Event Listeners ---

// Switch from Login to Signup view
showSignupBtn.addEventListener("click", () => {
  loginSection.classList.add("hidden");
  signupSection.classList.remove("hidden");
  signupStep.classList.remove("hidden");
});

// Switch from Signup to Login view
showLoginBtn.addEventListener("click", () => {
  signupSection.classList.add("hidden");
  loginSection.classList.remove("hidden");

  signupStep.classList.add("hidden");
});

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    if (document.body.contains(notification))
      document.body.removeChild(notification);
  }, 2000);
}
