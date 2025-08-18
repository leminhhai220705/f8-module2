import httpRequest from "../services/httpRequest.js";
import trackPage from "../pages/trackPage.js";
import trackPlaying from "./trackplaying.js";
import home, { publicPlaylistTracks } from "../pages/home.js";
import newPublicPlaylist from "./newPublicPlaylist.js";

export let playlistTracks = [];

class NewPlaylistLogic {
  sideBar = document.querySelector("#sidebar");
  navSection = document.querySelector("#nav-section");
  createBtn = document.querySelector("#create-btn");
  authModal = document.querySelector("#authModal");
  albumsContainer = document.querySelector("#albums-container");
  playlistsContainer = document.querySelector("#playlists-container");
  newPlaylist = document.querySelector("#new-playlist");
  playlistState = document.querySelector("#playlist-state");
  playlistName = document.querySelector("#playlist-name");
  userName = document.querySelector("#user-name");
  infoEdit = document.querySelector("#info-edit");
  imgChoosing = document.querySelector("#img-choosing-hero");
  editCloseBtn = document.querySelector("#edit-close-btn");
  editForm = document.querySelector("#edit-form");
  libraryContent = document.querySelector("#library-content");
  likedPlaylist = this.libraryContent.innerHTML;
  libraryMenu = document.querySelector("#library-menu");
  likedsongLibrary = document.querySelector("#liked-song-library");
  imgChoosingHero = document.querySelector("#img-choosing-hero");
  imgChoosingInput = document.querySelector("#img-choosing");
  addPlaylistBtn = document.querySelector("#add-public-playlist");

  constructor() {}

  async handleAllNewPlaylist() {
    if (this._wasLogined()) {
      await this._renderAllMyPlaylist();
      await newPublicPlaylist.renderLikedAlbumAndFlArtistToSidebar();
      this._handleEditPlaylist();
    }
    this.createBtn.onclick = async (e) => {
      e.stopPropagation();
      if (!this._wasLogined()) {
        this._notLogin();
      } else {
        await this._login();
        await this._renderAllMyPlaylist();
        await newPublicPlaylist.renderLikedAlbumAndFlArtistToSidebar();
        const allLibraryItems = document.querySelectorAll(".library-item");
        allLibraryItems.forEach((item) => item.classList.remove("active"));
        allLibraryItems[1].classList.add("active");
      }
    };
  }

  _wasLogined() {
    const loginState = localStorage.getItem("login_success");
    if (loginState) {
      return true;
    } else {
      return false;
    }
  }

  _notLogin() {
    // show the notification to inform user need to register or login before use the utility
    this._addInformTooltip();
  }

  _addInformTooltip() {
    // Create a structure code of the noti
    if (this.informToolTip) return;
    this.informToolTip = document.createElement("div");
    this.informToolTip.className = "login-inform-tooltip";
    const informScript = document.createElement("p");
    informScript.textContent = "Please Sign Up before add Playlists";
    const btn = document.createElement("button");
    btn.textContent = "Sign up here";
    this.informToolTip.append(informScript, btn);
    this.navSection.appendChild(this.informToolTip);

    setTimeout(() => {
      if (!this.informToolTip.classList.contains("show")) {
        this.informToolTip.classList.add("show");
      }
    });

    btn.onclick = () => {
      if (!this.authModal.classList.contains("show")) {
        this.authModal.classList.add("show");
        this.informToolTip.remove();
        this.informToolTip = null;
      }
    };
    this._removeInformTooltip();
  }

  _removeInformTooltip() {
    document.addEventListener("click", (e) => {
      if (e.target.matches("#create-btn") || e.target.closest(".login-inform-tooltip")) return;
      if (this.informToolTip) {
        this.informToolTip.classList.remove("show");
        this.informToolTip.ontransitionend = (e) => {
          if (e.propertyName !== "opacity") return;

          this.informToolTip.remove();
          this.informToolTip = null;
        };
      }
    });
  }

  async _login() {
    const newPlaylistApi = await this._createNewPlaylist();
    console.log(newPlaylistApi);
    if (newPlaylistApi) {
      const id = newPlaylistApi.playlist.id;
      const state = newPlaylistApi.playlist.is_public ? "public" : "private";
      const playlistName = newPlaylistApi.playlist.name;
      this.playlistState.textContent = state;
      this.playlistName.textContent = playlistName;
      this._openNewPlaylistTrackContainer();
      this._handleOpenModal(id);
    }
  }

  _handleOpenModal(playlistId) {
    this.imgChoosing.onclick = (e) => {
      this.infoEdit.classList.add("show");
      this._handleCloseModal();
      this._updateData(playlistId);
    };
  }

  async _uploadPlaylistCoverImg(id, contentImg) {
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("cover", contentImg);
    try {
      const res = await httpRequest.sendApi(`/upload/playlist/${id}/cover`, formData, "post", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  _updateData(playlistId) {
    this.editForm.onsubmit = async (e) => {
      e.preventDefault();

      const data = new FormData(this.editForm);
      const fileImg = data.get("image_url");
      console.log(fileImg);
      console.log(playlistId);

      const imgData = await this._uploadPlaylistCoverImg(playlistId, fileImg);
      console.log(imgData);

      data.set("image_url", imgData.file.url);

      const formData = Object.fromEntries(data);

      const dataUpdated = await this._updatePlaylistInfo(playlistId, formData);
      console.log(dataUpdated);
      if (dataUpdated) {
        const playlistName = dataUpdated.playlist.name;
        const state = Boolean(dataUpdated.playlist.is_public);

        // render sidebar
        await this._renderAllMyPlaylist();
        await newPublicPlaylist.renderLikedAlbumAndFlArtistToSidebar();

        // render playlistTrackContainer
        this.playlistState.textContent = state ? "public" : "private";
        this.playlistName.textContent = playlistName;

        //   Close after finished for updating
        this.infoEdit.classList.remove("show");
      }
    };
  }

  async _updatePlaylistInfo(id, data) {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const res = await httpRequest.sendApi(`/playlists/${id}`, data, "put", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  _handleCloseModal() {
    this.editCloseBtn.onclick = (e) => {
      this.infoEdit.classList.remove("show");
    };

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.infoEdit.classList.remove("show");
      }
    });
  }

  _openNewPlaylistTrackContainer() {
    this.albumsContainer.hidden = true;
    this.newPlaylist.style.display = "flex";
    this.playlistsContainer.hidden = true;
  }

  async _createNewPlaylist() {
    const token = localStorage.getItem("access_token") ?? "";
    if (token) {
      try {
        const newInfoPlaylist = {
          name: "My New Playlist",
          description: "",
          is_public: true,
          image_url: null,
        };
        const res = await httpRequest.sendApi("/playlists", newInfoPlaylist, "post", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return res;
      } catch (error) {
        console.log(error);
      }
    }
  }

  async _getAllMyPlaylist() {
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

  async _renderAllMyPlaylist(sidebar = false, anotherPlaylists) {
    this.libraryContent.innerHTML = "";
    const allPlaylists = await this._getAllMyPlaylist();

    const playlists = sidebar ? anotherPlaylists : allPlaylists.playlists;

    if (playlists) {
      const playlistStructure = playlists
        .map((playlist) => {
          const html = `
          
        <div class="library-item" data-id="${playlist.id}" data-type="playlist" style="display: ${
            playlist.hidden ? "none" : ""
          }">
              <div class="item-title">${playlist.name}</div>
              <img
                src="${playlist.image_url ?? "https://i.pinimg.com/736x/ba/7a/8a/ba7a8a369e4a6a83e7d2181f1339b39b.jpg"}"
                alt="${playlist.name}"
                class="item-image"
              />
              <div class="item-info">
                <div class="item-title">${playlist.name}</div>
                <div class="item-subtitle">Playlist</div>
              </div>
            </div>
        `;

          const cleanHtml = DOMPurify.sanitize(html);
          return cleanHtml;
        })
        .join("");

      this.libraryContent.innerHTML = playlistStructure;
    }
  }

  async _getPlaylist(id) {
    const token = localStorage.getItem("access_token");
    try {
      const res = httpRequest.sendApi(`/playlists/${id}`, null, "get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async _getPlaylistTracks(id) {
    const token = localStorage.getItem("access_token");
    try {
      const res = await httpRequest.sendApi(`/playlists/${id}/tracks`, null, "get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.tracks;
    } catch (error) {
      console.log(error);
    }
  }

  async _renderTrack(id, namePlaylist) {
    this.newPlaylist.style.display = "none";
    this.albumsContainer.hidden = true;
    this.playlistsContainer.hidden = false;
    const tracksPlaylist = await this._getPlaylistTracks(id);
    const tracksBeforeHandle = tracksPlaylist.map(async (track) => {
      const id = track.track_id;
      try {
        const res = await httpRequest.sendApi(`/tracks/${id}`, null, "get");
        return res;
      } catch (error) {
        console.log(error);
      }
    });

    const finalTracks = await Promise.all(tracksBeforeHandle);
    const coverImg = finalTracks[0].image_url;
    const title = namePlaylist;
    console.log(finalTracks);
    playlistTracks = finalTracks;
    trackPage.handleRenderTrackPage(coverImg, title, finalTracks);
    trackPlaying.playingTrack(playlistTracks);
  }

  _handleEditPlaylist() {
    this.libraryContent.onclick = async (e) => {
      const playlistItem = e.target.closest(".library-item");
      if (!playlistItem) return;
      if (playlistItem.dataset.type === "playlist") {
        const allLibraryItems = document.querySelectorAll(".library-item");
        allLibraryItems.forEach((item) => item.classList.remove("active"));

        playlistItem.classList.add("active");
        const id = playlistItem.dataset.id;
        const res = await this._getPlaylist(id);

        if (res) {
          const state = Boolean(res.is_public);
          const namePlaylist = res.name;
          this.playlistState.textContent = state ? "public" : "private";
          this.playlistName.textContent = namePlaylist;
          if (res.total_tracks) {
            try {
              const res = this._renderTrack(id, namePlaylist);
            } catch (error) {
              console.log(error);
            }
          } else {
            this._openNewPlaylistTrackContainer();
          }
          this._handleOpenModal(id);
        }
      } else if (playlistItem.dataset.type === "album") {
        const allLibraryItems = document.querySelectorAll(".library-item");
        allLibraryItems.forEach((item) => item.classList.remove("active"));

        playlistItem.classList.add("active");
        const albumId = playlistItem.dataset.id;

        this.addPlaylistBtn.dataset.playlistid = albumId;
        this.addPlaylistBtn.dataset.type = "album";
        const title = playlistItem.dataset.title;
        const data = await home._getAlbumTrackApi(albumId);
        console.log(data);

        home._setQueryParam(home._slugify(title), albumId);
        home._swapState();
        const albumCoverImg = data?.album.cover_image_url;
        const albumTitle = data?.album.title;
        const albumTracks = data?.tracks;

        trackPage.handleRenderTrackPage(albumCoverImg, albumTitle, albumTracks);

        // allow to play audio after render hit track to interface
        trackPlaying.playingTrack(albumTracks);

        // Handle Add Public Playlist
        newPublicPlaylist.handleAddPublicPlaylist("album");
      } else if (playlistItem.dataset.type === "artist") {
        const allLibraryItems = document.querySelectorAll(".library-item");
        allLibraryItems.forEach((item) => item.classList.remove("active"));

        playlistItem.classList.add("active");
        // Get ID of Artist through dataset
        const artistId = playlistItem.dataset.id;
        console.log(artistId);

        this.addPlaylistBtn.dataset.artistid = artistId;
        this.addPlaylistBtn.dataset.type = "artist";
        // Base on ID, Get artist's album
        const artistAlbumData = await home._getArtistAlbumApi(artistId);

        console.log(artistAlbumData);

        // Get Artist's Name
        const nameArtist = artistAlbumData?.artist?.name;

        console.log(artistAlbumData);

        // Get first Album of artist
        const albumId = artistAlbumData?.albums[0]?.id;

        if (!artistAlbumData.albums.length) return;

        // if (!albumId) return;

        // Base on Album ID, get Album Track
        const artistAlbumTrack = await home._getAlbumTrackApi(albumId);

        home._swapState();

        const albumCoverImg = artistAlbumTrack?.album?.cover_image_url;
        const albumTracks = artistAlbumTrack?.tracks;

        console.log(albumTracks);

        // Render to Interface
        trackPage.handleRenderTrackPage(albumCoverImg, nameArtist, albumTracks);

        // allow to play audio after render artist to interface
        trackPlaying.playingTrack(albumTracks);

        // Handle Add Public Playlist
        newPublicPlaylist.handleAddPublicPlaylist("artist");
      }
    };
  }
}

const newPlaylistLogic = new NewPlaylistLogic();

export default newPlaylistLogic;

{
  /* <div class="library-item">
              <div class="item-title">Đen</div>
              <img
                src="placeholder.svg?height=48&width=48"
                alt="Đen"
                class="item-image"
              />
              <div class="item-info">
                <div class="item-title">Đen</div>
                <div class="item-subtitle">Artist</div>
              </div>
            </div> */
}
