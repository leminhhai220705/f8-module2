import httpRequest from "../services/httpRequest.js";

class NewPublicPlaylist {
  addPlaylistBtn = document.querySelector("#add-public-playlist");
  hitGrid = document.querySelector("#hits-grid");
  playlists = JSON.parse(localStorage.getItem("liked_playlist")) ?? [];

  constructor() {
    console.log(this.playlists);
  }

  handleAddPublicPlaylist() {
    console.log(this.playlists);

    this.addPlaylistBtn.onclick = async (e) => {
      const btn = e.target.closest("#add-public-playlist");
      btn.classList.toggle("checked");

      if (this._getCheckingState()) {
        const playlistId = this.addPlaylistBtn.dataset.playlistid;
        if (!playlistId) return;
        const playlistInfo = await this._getPlaylistInfo(playlistId);
        if (!playlistInfo) return;
        this.playlists.push(playlistInfo);
        console.log(this.playlists);
        localStorage.setItem("liked_playlist", JSON.stringify(this.playlists));
      }
    };
  }

  _getCheckingState() {
    return this.addPlaylistBtn.classList.contains("checked");
  }

  async _getPlaylistInfo(id) {
    try {
      const res = await httpRequest.sendApi(`/albums/${id}`, null, "get");
      return res;
    } catch (error) {
      console.log(error);
    }
  }
}

const newPublicPlaylist = new NewPublicPlaylist();

export default newPublicPlaylist;
