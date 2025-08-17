import httpRequest from "../services/httpRequest.js";
import newPlaylistLogic from "../components/newPlaylistLogic.js";

class Register {
  signupEmail = document.querySelector("#signupEmail");
  signupPassword = document.querySelector("#signupPassword");
  emailErrorMessage = document.querySelector("#email-error-message");
  passwordErrorMessage = document.querySelector("#password-error-message");
  usernameErrorMessage = document.querySelector("#username-error-message");
  emailGroup = document.querySelector("#email-group");
  passwordGroup = document.querySelector("#password-group");
  usernameGroup = document.querySelector("#username-group");
  formRegister = document.querySelector("#auth-form-content");
  modalOverlay = document.querySelector(".modal-overlay");
  authBtn = document.querySelector("#auth-buttons");
  userMenu = document.querySelector("#user-menu");
  userName = document.querySelector("#username");

  constructor() {}

  async _renderCurrentLogin() {
    const currentUserData = await this._getCurrentUserData();
    if (currentUserData) {
      this.authBtn.style.display = "none";
      this.userMenu.style.display = "flex";
      const currentUserStats = currentUserData.stats;
      const currentUserInfo = currentUserData.user;
      this.userName.textContent =
        currentUserInfo.display_name || currentUserInfo.username;
      localStorage.setItem("login_success", true);
    }
  }

  async handleRegister() {
    // if (localStorage.getItem("access_token")) {
    //   await this._renderCurrentLogin();
    // }

    this.formRegister.onsubmit = async (e) => {
      e.preventDefault();
      const res = await this.getInfoRegister();
      if (res) {
        this.modalOverlay.classList.remove("show");
        const accessToken = res.access_token;
        localStorage.setItem("access_token", accessToken);
        await this._renderCurrentLogin();
        newPlaylistLogic.handleAllNewPlaylist();
      } else {
        localStorage.removeItem("access_token");
      }
    };
  }

  async _getCurrentUserData() {
    try {
      const token = localStorage.getItem("access_token") ?? "";
      const res = await httpRequest.sendApi("/users/me", null, "get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res;
    } catch (error) {
      console.log(`HTTP Response: ${error.response.data.error.message}`);
    }
  }

  _checkValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  _handleError(errorRes) {
    const details = errorRes?.response?.data?.error?.details;
    const code = errorRes?.response?.data?.error?.code;
    const message = errorRes?.response?.data?.error?.message ?? "Unknown error";

    if (details && details[0]?.field === "password") {
      this.passwordGroup.classList.add("invalid");
      this.passwordErrorMessage.textContent =
        details[0]?.message ?? "Unknown error";
    } else if (code === "EMAIL_EXISTS") {
      this.emailGroup.classList.add("invalid");
      this.emailErrorMessage.textContent = message;
    } else if (code === "USERNAME_EXISTS") {
      this.usernameGroup.classList.add("invalid");
      this.usernameErrorMessage.textContent = message;
    } else if (details && details[0]?.field === "username") {
      this.usernameGroup.classList.add("invalid");
      this.usernameErrorMessage.textContent =
        details[0]?.message ?? "Unknown error";
    } else if (details && details[0]?.field === "email") {
      this.emailGroup.classList.add("invalid");
      this.emailErrorMessage.textContent =
        details[0]?.message ?? "Unknown error";
    }
  }
  async getInfoRegister() {
    this.formData = Object.fromEntries(new FormData(this.formRegister));

    if (!this._checkValidEmail(this.formData.email)) {
      if (!this.emailGroup.classList.contains("invalid")) {
        this.emailGroup.classList.add("invalid");
        this.emailErrorMessage.textContent = "Please enter a valid email";
      }
    } else {
      if (this.emailGroup.classList.contains("invalid")) {
        this.emailGroup.classList.remove("invalid");
      }

      try {
        if (
          this.passwordGroup.classList.contains("invalid") ||
          this.emailGroup.classList.contains("invalid") ||
          this.usernameGroup.classList.contains("invalid")
        ) {
          this.passwordGroup.classList.remove("invalid");
          this.emailGroup.classList.remove("invalid");
          this.usernameGroup.classList.remove("invalid");
        }
        const res = await httpRequest.sendApi(
          "/auth/register",
          this.formData,
          "post",
        );

        return res;
      } catch (error) {
        this._handleError(error);
      }
    }
  }
}

const register = new Register();

export default register;
