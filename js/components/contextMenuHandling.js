import httpRequest from "../services/httpRequest.js";
import newPlaylistLogic from "./newPlaylistLogic.js";

class ContextMenuHandling {
  libraryMenu = document.querySelector("#library-menu");
  libraryContent = document.querySelector("#library-content");
  sideBar = document.querySelector("#sidebar");

  constructor() {}

  handleContextMenu() {
    document.oncontextmenu = async (e) => {
      e.preventDefault();
      //   libraryItem
      const libraryItem = e.target.closest(".library-item");
      const likedSong = e.target.closest("#liked-song-library");
      this.libraryMenu.style.display = "none";
      this.sideBar.style.overflow = "";
      if (libraryItem && !likedSong) {
        this.libraryMenu.textContent = "";
        const clientX = e.clientX + 20;
        const clientY = e.clientY;
        this.libraryMenu.style.top = `${clientY}px`;
        this.libraryMenu.style.left = `${clientX}px`;
        this.libraryMenu.style.display = "block";
        this.sideBar.style.overflow = "hidden";
        const id = libraryItem.dataset.id;
        if (libraryItem.dataset.type === "playlist") {
          this.libraryMenu.textContent = "Delete";
          await this._handleDeletePlaylist(id);
        }
      }
    };

    document.onclick = (e) => {
      if (e.target.closest("#library-menu")) return;
      this.libraryMenu.style.display = "none";
      this.sideBar.style.overflow = "";
    };
  }

  async _handleDeletePlaylist(id) {
    this.libraryMenu.onclick = async (e) => {
      const res = await this._deletePlaylist(id);
      console.log(res);
      if (res) {
        this.libraryMenu.style.display = "none";
        this.sideBar.style.overflow = "";
        await newPlaylistLogic._renderAllMyPlaylist();
      }
    };
  }

  async _deletePlaylist(id) {
    const token = localStorage.getItem("access_token");
    try {
      const res = await httpRequest.sendApi(
        `/playlists/${id}`,
        null,
        "delete",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return res;
    } catch (error) {
      console.log(error);
    }
  }
}

const contextMenuHandling = new ContextMenuHandling();

export default contextMenuHandling;
