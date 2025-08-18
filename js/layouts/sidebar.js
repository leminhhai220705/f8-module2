import httpRequest from "../services/httpRequest.js";
import newPlaylistLogic from "../components/newPlaylistLogic.js";
import newPublicPlaylist from "../components/newPublicPlaylist.js";

class Sidebar {
  sortBtn = document.querySelector("#sort-btn");
  sortMenu = document.querySelector("#sort-menu");
  allModeNodes = document.querySelectorAll(".mode-item");
  libraryContent = document.querySelector("#library-content");
  searchLibraryBtn = document.querySelector(".search-library-btn");
  recent = document.querySelector("#sort-btn-recent");
  playlistSearchInput = document.querySelector(".playlist-search-input");
  sidebarNav = document.querySelector(".sidebar-nav");
  allModes = [];

  constructor() {}

  async handleSidebar() {
    this.sortBtn.onclick = (e) => {
      this.sortMenu.classList.toggle("open");
      this._handleSortMenuClick();
    };

    this.searchLibraryBtn.onclick = (e) => {
      e.stopPropagation();
      this.searchLibraryBtn.style.display = "none";
      this.recent.style.display = "none";
      this.playlistSearchInput.classList.add("show");
      document.addEventListener("click", this._resetFindState);
    };

    this.playlistSearchInput.oninput = async (e) => {
      const myPlaylists = await this._getMyPlaylist();
      const playlists = myPlaylists.playlists;

      const value = e.target.value.toLowerCase();
      playlists.forEach((pl) => {
        pl.hidden = true;
        if (pl.name.toLowerCase().includes(value)) {
          console.log(true);
          pl.hidden = false;
        }
      });

      console.log(playlists);

      await newPlaylistLogic._renderAllMyPlaylist(true, playlists);
      await newPublicPlaylist.renderLikedAlbumAndFlArtistToSidebar();
    };
  }

  async _getMyPlaylist() {
    const token = localStorage.getItem("access_token");

    try {
      const res = await httpRequest.sendApi("/me/playlists", null, "get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res;
    } catch (error) {
      console.log(error);
    }
  }

  _resetFindState = async (e) => {
    if (e.target.closest(".sidebar-nav")) return;
    this.searchLibraryBtn.style.display = "";
    this.recent.style.display = "";
    this.playlistSearchInput.classList.remove("show");
    const myPlaylists = await this._getMyPlaylist();
    const playlists = myPlaylists.playlists;
    playlists.forEach((pl) => {
      pl.hidden = false;
    });

    await newPlaylistLogic._renderAllMyPlaylist(true, playlists);
    await newPublicPlaylist.renderLikedAlbumAndFlArtistToSidebar();
    document.removeEventListener("click", this._resetStyleInput);
  };

  _handleSortMenuClick() {
    this.sortMenu.onclick = (e) => {
      const mode = e.target.closest(".mode-item");
      if (mode) {
        this._handleResetModeActive();
        this._handleResetModeState();
        const modeName = mode.dataset.mode;
        mode.classList.add("active");
        this.libraryContent.classList.add(modeName);
      }
    };
  }

  _handleResetModeActive() {
    this.allModeNodes.forEach((node) => {
      node.classList.remove("active");
      this.allModes.push(node.dataset.mode);
    });
  }

  _handleResetModeState() {
    this.allModes.forEach((mode) => {
      if (this.libraryContent.classList.contains(mode)) {
        this.libraryContent.classList.remove(mode);
      }
    });
  }

  _renderSidebar() {
    // ...
  }
}

const sideBar = new Sidebar();

export default sideBar;
