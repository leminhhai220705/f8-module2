import httpRequest from "../services/httpRequest.js";
import newPlaylistLogic from "./newPlaylistLogic.js";

class TrackToPlaylist {
  informRegisterBefore = document.querySelector("#inform-register-before");
  playlistModal = document.querySelector("#playlist-modal");
  addBtn = document.querySelector("#add-btn");
  playlistContainer = document.querySelector("#playlist-container");

  isOpen = false;
  finalPlaylists = [];

  constructor() {}

  handleAddTrackToPlaylist() {
    this.informRegisterBefore.style.display = "";
    this.playlistModal.style.display = "";

    // open add modal
    this.addBtn.onclick = async (e) => {
      e.stopPropagation();
      if (this.isOpen) {
        this._resetState(e);
        this.isOpen = false;
        return;
      }

      if (this._wasLogined()) {
        this.playlistModal.style.display = "block";
        await this._renderToInterface();
      } else {
        this.informRegisterBefore.style.display = "block";
      }

      document.addEventListener("click", this._resetState);
      this.isOpen = true;
    };

    this.playlistContainer.onclick = async (e) => {
      e.stopPropagation();
      const playlistPanel = e.target.closest(".playlist-item");
      console.log(playlistPanel);

      if (!playlistPanel) return;
      const id = playlistPanel.dataset.id;
      console.log(playlistPanel.classList.contains("saved"));

      if (playlistPanel.classList.contains("saved")) {
        playlistPanel.classList.remove("saved");
        const res = await this._removeTrackFromPlaylist(id);
      } else {
        playlistPanel.classList.add("saved");
        const res = this._addTrackToPlaylist(id);
      }
    };
  }

  async _addTrackToPlaylist(id) {
    const token = localStorage.getItem("access_token");
    const body = {
      track_id: this._getTrackIdInLcStr(),
      position: 0,
    };
    try {
      const res = await httpRequest.sendApi(
        `/playlists/${id}/tracks`,
        body,
        "post",
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

  async _removeTrackFromPlaylist(id) {
    const token = localStorage.getItem("access_token");
    const trackId = this._getTrackIdInLcStr();
    try {
      const res = await httpRequest.sendApi(
        `/playlists/${id}/tracks/${trackId}`,
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

  async _getAllPlaylists() {
    const token = localStorage.getItem("access_token");
    console.log(token);

    try {
      const res = httpRequest.sendApi("/me/playlists", null, "get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async _getAllMyPlaylists() {
    const res = await this._getAllPlaylists();
    return res.playlists;
  }

  _getTrackIdInLcStr() {
    return JSON.parse(localStorage.getItem("current_track")).id;
  }

  async _getTracks(id) {
    const token = localStorage.getItem("access_token");
    try {
      const playlistTracks = await httpRequest.sendApi(
        `/playlists/${id}/tracks`,
        null,
        "get",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return playlistTracks;
    } catch (err) {
      console.log(err);
    }
  }

  async _checkTrackInPlaylist() {
    const allMyPlaylists = await this._getAllMyPlaylists();

    const checkedPlaylists = allMyPlaylists.map(async (playlist) => {
      const playlistId = playlist.id;
      console.log(playlistId);

      const playlistTracks = await this._getTracks(playlistId);

      const allTracks = playlistTracks.tracks;

      const resultChecking = allTracks.some(
        (track) => track.track_id === this._getTrackIdInLcStr(),
      );

      return { playlist, match: resultChecking };
    });

    const satisfiedPlaylist = await Promise.all(checkedPlaylists);
    satisfiedPlaylist.forEach((pl) => {
      pl.playlist.save = pl.match;
    });

    const allPlaylists = satisfiedPlaylist.map((pl) => pl.playlist);
    return allPlaylists;
  }

  _renderAllMyPlaylist(playlists) {
    const playlistHtml = playlists
      .map((playlist) => {
        const html = `<li class="playlist-item ${
          playlist.save ? "saved" : ""
        }" data-id="${playlist.id}">
                  <img
                    src="${
                      playlist.image_url ||
                      "https://i.pinimg.com/736x/ba/7a/8a/ba7a8a369e4a6a83e7d2181f1339b39b.jpg"
                    }"
                    alt="Playlist cover"
                  />
                  <div class="playlist-info-item">
                    <span class="playlist-name">${playlist.name}</span>
                    <span class="playlist-type">Playlist</span>
                  </div>
                  <div class="playlist-tick">
                    <i class="fa-solid fa-check"></i>
                  </div>
                </li>`;
        const cleanHtml = DOMPurify.sanitize(html);
        return cleanHtml;
      })
      .join("");

    this.playlistContainer.innerHTML = playlistHtml;
  }

  async _renderToInterface() {
    const allMyPlaylists = await this._checkTrackInPlaylist();
    this.finalPlaylists = [...allMyPlaylists];
    this._renderAllMyPlaylist(this.finalPlaylists);
  }

  _wasLogined() {
    const token = localStorage.getItem("access_token");
    if (!token) return false;
    return true;
  }

  _resetState = (e) => {
    console.log(e.target);

    if (e.target.closest("#playlist-modal")) {
      return;
    }
    this.playlistModal.style.display = "";
    this.informRegisterBefore.style.display = "";
    document.removeEventListener("click", this._resetState);
  };
}

const trackToPlaylist = new TrackToPlaylist();

export default trackToPlaylist;

{
  /* <li class="playlist-item saved">
                  <img
                    src="https://via.placeholder.com/40"
                    alt="Playlist cover"
                  />
                  <div class="playlist-info-item">
                    <span class="playlist-name">Chill Vibes</span>
                    <span class="playlist-type">Playlist</span>
                  </div>
                  <div class="playlist-tick">
                    <i class="fa-solid fa-check"></i>
                  </div>
                </li> */
}
