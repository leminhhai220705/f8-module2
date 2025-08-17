import httpRequest from "../services/httpRequest.js";

class Logout {
  logoutDropdown = document.querySelector("#userDropdown");
  userMenu = document.querySelector("#user-menu");
  authButtons = document.querySelector("#auth-buttons");

  constructor() {}

  handleLogout() {
    this.logoutDropdown.onclick = async (e) => {
      const res = await this._postLogout();
      if (res) {
        this._handleAfterLogout();
      }
    };
  }

  async _postLogout() {
    const token = localStorage.getItem("access_token") ?? "";
    try {
      const res = await httpRequest.sendApi("/auth/logout", {}, "post", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res;
    } catch (error) {
      console.log(error);
    }
  }

  _handleAfterLogout() {
    location.href = "/";
    localStorage.removeItem("access_token");
    localStorage.removeItem("login_success");
    this.userMenu.style.display = "none";
    this.authButtons.style.display = "flex";
  }
}

const logout = new Logout();

export default logout;
