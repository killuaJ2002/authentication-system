const signupContainer = document.querySelector(".signupContainer");
const loginContainer = document.querySelector(".loginContainer");
const messageBtns = document.querySelectorAll(".messageBtn");
const body = document.body;

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
