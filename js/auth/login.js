import httpRequest from "../services/httpRequest.js";
import newPlaylistLogic from "../components/newPlaylistLogic.js";

class Login {
  loginForm = document.querySelector("#login-form");
  emailLoginGroup = document.querySelector("#email-login-group");
  passwordLoginGroup = document.querySelector("#password-login-group");
  errorEmailLoginMess = document.querySelector("#error-email-login-message");
  errorPasswordLoginMess = document.querySelector(
    "#error-password-login-message",
  );
  modalOverlay = document.querySelector(".modal-overlay");
  authBtn = document.querySelector("#auth-buttons");
  userMenu = document.querySelector("#user-menu");
  userName = document.querySelector("#username");

  constructor() {}

  async handleLogin() {
    this._renderAlreadyLogin();
    this.loginForm.onsubmit = async (e) => {
      e.preventDefault();
      await this._renderUserData();
      newPlaylistLogic.handleAllNewPlaylist();
    };
  }

  async _renderAlreadyLogin() {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const alreadyLoginUser = await this._getCurrentUserData(token);

      if (alreadyLoginUser) {
        this._handleAfterLogin(alreadyLoginUser);
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("login_success");
      }
    } catch (error) {
      const errorMess = error?.response?.data?.error?.message;
      this.errorPasswordLoginMess.textContent = errorMess;
      console.log(error);
    }
  }

  async _renderUserData() {
    const userData = await this._getNewCurrentUserData();
    if (userData) {
      this._handleAfterLogin(userData);
    } else {
      localStorage.removeItem("access_token");
      localStorage.removeItem("login_success");
    }
  }

  _handleAfterLogin(data) {
    this.authBtn.style.display = "none";
    this.userMenu.style.display = "flex";
    this.userName.textContent = data.user.display_name || data.user.username;
    this.modalOverlay.classList.remove("show");
    localStorage.setItem("login_success", true);
  }

  async _getCurrentUserData(token) {
    try {
      const currentUserData = await httpRequest.sendApi(
        "/users/me",
        null,
        "get",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return currentUserData;
    } catch (error) {
      console.log(error);
    }
  }

  async _getNewCurrentUserData() {
    this.passwordLoginGroup.classList.remove("invalid");
    try {
      const res = await this._getApiData();
      if (res) {
        const accessToken = res.access_token;
        localStorage.setItem("access_token", accessToken);
        const token = localStorage.getItem("access_token");
        const currentNewUserData = await this._getCurrentUserData(token);
        if (!currentNewUserData) {
          localStorage.removeItem("access_token");
        }

        return currentNewUserData;
      }
    } catch (error) {
      this.passwordLoginGroup.classList.add("invalid");
      this.errorPasswordLoginMess.textContent =
        error?.response?.data?.error?.message;
      console.log(error);
    }
  }

  _checkValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  _getUserData() {
    this.emailLoginGroup.classList.remove("invalid");
    const formData = Object.fromEntries(new FormData(this.loginForm));

    if (!this._checkValidEmail(formData.email)) {
      this.emailLoginGroup.classList.add("invalid");
      this.errorEmailLoginMess.textContent = "Please enter a valid email";
      return;
    }
    return formData;
  }

  async _getApiData() {
    this.passwordLoginGroup.classList.remove("invalid");
    const data = this._getUserData();

    if (data) {
      try {
        const res = await httpRequest.sendApi("/auth/login", data, "post");
        return res;
      } catch (error) {
        this.errorPasswordLoginMess.textContent = "Invalid Email or Password";
        this.passwordLoginGroup.classList.add("invalid");
      }
    }
  }
}

const login = new Login();

export default login;
