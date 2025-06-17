const currentPage = window.location.pathname;
const isLoginPage = currentPage.includes("login.html");

const checkAuth = async () => {
  try {
    const response = await fetch("http://localhost:8000/session-status", {
      credentials: "include",
    });
    const data = await response.json();

    if (!data.isLoggedIn && !isLoginPage) {
      window.location.href = "./login.html";
    } else if (data.isLoggedIn && isLoginPage) {
      window.location.href = "./index.html"; // If logged in but on login page, redirect to index
    }
  } catch (error) {
    if (!isLoginPage) {
      window.location.href = "./login.html";
    }
  }
};

window.addEventListener("DOMContentLoaded", checkAuth);

const signupContainer = document.querySelector(".signupContainer");
const loginContainer = document.querySelector(".loginContainer");
const messageBtns = document.querySelectorAll(".messageBtn");
const body = document.body;
const signupBtn = document.querySelector(".signupBtn");
const signupEmailInput = document.querySelector(".signupContainer .emailInput");
const signupPasswordInput = document.querySelector(
  ".signupContainer .passwordInput"
);
const signupConfirmPasswordInput = document.querySelector(
  ".signupContainer .confirmPasswordInput"
);
const signupMessageBox = signupContainer.querySelector(".messageBtn");
const loginMessageBox = loginContainer.querySelector(".messageBtn");
const loginBtn = document.querySelector(".loginBtn");
const loginEmailInput = document.querySelector(".loginContainer .emailInput");
const loginPasswordInput = document.querySelector(
  ".loginContainer .passwordInput"
);

const signUp = async () => {
  const email = signupEmailInput.value.trim();
  const password = signupPasswordInput.value;
  const confirmPassword = signupConfirmPasswordInput.value;

  // Basic frontend validation
  if (!email || !password || !confirmPassword) {
    signupMessageBox.textContent = "All fields are required";
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, confirmPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(data.message);
      signupMessageBox.textContent = data.message;
    } else {
      console.log(data.message);
      signupMessageBox.textContent = "Account created successfully!";
      // Clear form
      signupEmailInput.value = "";
      signupPasswordInput.value = "";
      signupConfirmPasswordInput.value = "";
      // Redirect after a short delay
      setTimeout(() => {
        window.location.replace("./index.html");
      }, 1000);
    }
  } catch (error) {
    console.error("Network error:", error);
    signupMessageBox.textContent = "Network error. Please try again.";
  }
};

const logIn = async () => {
  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;
  if (!email || !password) {
    loginMessageBox.textContent = "All fields are required";
    return;
  }
  try {
    const response = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.log(data.message);
      loginMessageBox.textContent = data.message;
    } else {
      console.log(data.message);
      loginMessageBox.textContent = data.message;
      loginEmailInput.value = "";
      loginPasswordInput.value = "";
      setTimeout(() => {
        window.location.replace("./index.html");
      }, 1000);
    }
  } catch (error) {
    console.log("network error:", error.message);
    loginMessageBox.textContent = "Network error, please try again";
  }
};

messageBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (body.classList.contains("show-login")) {
      body.classList.remove("show-login");
      body.classList.add("show-signup");
    } else {
      body.classList.remove("show-signup");
      body.classList.add("show-login");
    }
  });
});

// Fixed: Call the function, don't just pass reference
signupBtn.addEventListener("click", signUp);

loginBtn.addEventListener("click", logIn);
