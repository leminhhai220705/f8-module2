import httpRequest from "../services/httpRequest.js";
import newPlaylistLogic from "./newPlaylistLogic.js";

class NewPublicPlaylist {
  libraryContent = document.querySelector("#library-content");
  addPlaylistBtn = document.querySelector("#add-public-playlist");
  hitGrid = document.querySelector("#hits-grid");
  playlists = JSON.parse(localStorage.getItem("liked_playlist")) ?? [];

  constructor() {}

  async handleAddPublicPlaylist(type) {
    this._renderAvailableStateForBoth(type);
    this._handleBoth();
  }

  async renderLikedAlbumAndFlArtistToSidebar() {
    await this._renderAllLikedAlbums();
    await this._renderAllFollowedArtists();
  }

  async _renderAllLikedAlbums(extra = false) {
    const allLikedAlbums = await this._getAllLikedAlbums();
    const allAlbums = extra ? this.extraLikedAlbums : allLikedAlbums.albums;
    console.log(allAlbums);

    const allAlbumsStructure = allAlbums
      .map((album) => {
        const html = `<div class="library-item" data-type="album" data-id="${album.id}" data-title="${album.title}">
              <div class="item-title">${album.title}</div>
              <img
                src="${album.cover_image_url}"
                alt="${album.cover_image_url}"
                class="item-image"
              />
              <div class="item-info">
                <div class="item-title">${album.title}</div>
                <div class="item-subtitle">Album</div>
              </div>
            </div> `;

        const cleanHtml = DOMPurify.sanitize(html);
        return cleanHtml;
      })
      .join("");

    this.libraryContent.innerHTML = this.libraryContent.innerHTML + allAlbumsStructure;
  }

  async _renderAllFollowedArtists(extra = false) {
    const allFlArtists = await this._getAllFollowedArtists();
    const allArtists = extra ? this.extraFlArtists : allFlArtists.artists;
    console.log(allArtists);

    const allArtistsStructure = allArtists
      .map((artist) => {
        const html = `<div class="library-item" data-type="artist" data-id="${artist.id}" data-title="${artist.name}">
              <div class="item-title">${artist.name}</div>
              <img
                src="${artist.background_image_url}"
                alt="${artist.background_image_url}"
                class="item-image"
              />
              <div class="item-info">
                <div class="item-title">${artist.name}</div>
                <div class="item-subtitle">Artist</div>
              </div>
            </div> `;

        const cleanHtml = DOMPurify.sanitize(html);
        return cleanHtml;
      })
      .join("");

    this.libraryContent.innerHTML = this.libraryContent.innerHTML + allArtistsStructure;
  }

  _isChecking() {
    return this.addPlaylistBtn.classList.contains("checked");
  }

  async _handleBoth() {
    this.addPlaylistBtn.onclick = async (e) => {
      if (!this._wasLogined()) return;
      if (this._isChecking()) {
        if (this._getType() === "album") {
          await this._handleUnlikeAlbum();
        } else if (this._getType() === "artist") {
          await this._handleUnfollowArtist();
        }
        this.addPlaylistBtn.classList.remove("checked");
      } else {
        if (this._getType() === "album") {
          await this._handleLikeAlbum();
        } else if (this._getType() === "artist") {
          await this._handleFollowArtist();
        }
        this.addPlaylistBtn.classList.add("checked");
      }

      await newPlaylistLogic.handleAllNewPlaylist();
    };
    // ... handle toggle like/follow button
  }

  async _renderAvailableStateForBoth(type) {
    if (type === "album") {
      const albumRes = await this._getAlbumLikedState(this._getAlbumId());
      const { state } = albumRes;
      if (state) {
        this.addPlaylistBtn.classList.add("checked");
      } else {
        this.addPlaylistBtn.classList.remove("checked");
      }
    } else if (type === "artist") {
      const artistRes = await this._getArtistFollowedState(this._getArtistId());
      const { state } = artistRes;
      if (state) {
        this.addPlaylistBtn.classList.add("checked");
      } else {
        this.addPlaylistBtn.classList.remove("checked");
      }
    }
  }

  async _handleUnlikeAlbum() {
    const unlikeRes = await this._unlikeAlbum(this._getAlbumId());
    console.log(unlikeRes);
  }

  async _handleUnfollowArtist() {
    const unflRes = await this._unfollowArtist(this._getArtistId());
    console.log(unflRes);
  }

  async _handleLikeAlbum() {
    const likeRes = await this._likeAlbum(this._getAlbumId());
    console.log(likeRes);
  }

  async _handleFollowArtist() {
    const flRes = await this._followArtist(this._getArtistId());
    console.log(flRes);
  }

  _getAlbumId() {
    return this.addPlaylistBtn.dataset.playlistid;
  }

  _getArtistId() {
    return this.addPlaylistBtn.dataset.artistid;
  }

  _getType() {
    return this.addPlaylistBtn.dataset.type;
  }

  async _getAlbumLikedState(albumId) {
    const token = localStorage.getItem("access_token");
    try {
      const res = await httpRequest.sendApi(`/albums/${albumId}`, null, "get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { state: res.is_liked };
    } catch (error) {
      console.log(error);
    }
  }

  async _getArtistFollowedState(artistId) {
    const token = localStorage.getItem("access_token");
    console.log(artistId);

    try {
      const res = await httpRequest.sendApi(`/artists/${artistId}`, null, "get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { state: res.is_following };
    } catch (error) {
      console.log(error);
    }
  }

  async _likeAlbum(albumId) {
    const token = localStorage.getItem("access_token");
    try {
      const res = await httpRequest.sendApi(`/albums/${albumId}/like`, {}, "post", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async _followArtist(artistId) {
    const token = localStorage.getItem("access_token");
    try {
      const res = await httpRequest.sendApi(`/artists/${artistId}/follow`, {}, "post", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async _unlikeAlbum(albumId) {
    const token = localStorage.getItem("access_token");
    try {
      const res = await httpRequest.sendApi(`/albums/${albumId}/like`, null, "delete", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async _unfollowArtist(artistId) {
    const token = localStorage.getItem("access_token");
    try {
      const res = await httpRequest.sendApi(`/artists/${artistId}/follow`, null, "delete", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async _getAllLikedAlbums() {
    const token = localStorage.getItem("access_token");
    try {
      const res = await httpRequest.sendApi(`/me/albums/liked?limit=20&offset=0`, null, "get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async _getAllFollowedArtists() {
    const token = localStorage.getItem("access_token");
    try {
      const res = await httpRequest.sendApi(`/me/following?limit=20&offset=0`, null, "get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  _wasLogined() {
    if (localStorage.getItem("login_success")) return true;
    return false;
  }

  async _getPlaylistInfo(id) {}
}

const newPublicPlaylist = new NewPublicPlaylist();

export default newPublicPlaylist;

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
