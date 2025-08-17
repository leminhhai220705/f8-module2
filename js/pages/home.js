import artistsApi from "../services/artistsHandlingData.js";
import albumsApi from "../services/albumsHandlingData.js";
import httpRequest from "../services/httpRequest.js";
import trackPage from "./trackPage.js";
import trackPlaying from "../components/trackplaying.js";
import { playlistTracks } from "../components/newPlaylistLogic.js";

export let publicPlaylistTracks = [];

class Home {
  artistGrid = document.querySelector("#artist-grid");
  hitsGrid = document.querySelector("#hits-grid");
  playListContainer = document.querySelector(".playlists-container");
  albumContainer = document.querySelector(".albums-container");
  addPlaylistBtn = document.querySelector("#add-public-playlist");

  constructor() {}

  async _getArtistsData() {
    const artistsData = await artistsApi.getAllArtists();
    return artistsData;
  }

  async _getAlbumsData() {
    const albumsData = await albumsApi.getAllAlbums();
    return albumsData;
  }

  async _renderPopularArtists() {
    this.artistGrid.innerHTML = "";
    const artistsData = await this._getArtistsData();
    const allArtists = artistsData.artists;

    const popularArtists = allArtists
      .map((artist) => {
        const html = `
            <div class="artist-card" data-id="${artist.id}"> 
                <div class="artist-card-cover">
                  <img src="${artist.image_url}" alt="${artist.name}" />
                  <button class="artist-play-btn">
                    <i class="fas fa-play"></i>
                  </button>
                </div>
                <div class="artist-card-info">
                  <h3 class="artist-card-name">${artist.name}</h3>
                  <p class="artist-card-type">Artist</p>
                </div>
              </div>
        `;

        const cleanHtml = DOMPurify.sanitize(html);
        return cleanHtml;
      })
      .join("");

    this.artistGrid.innerHTML = popularArtists;
  }

  _handleOpenArtistTrack() {
    this.artistGrid.onclick = async (e) => {
      const artistCard = e.target.closest(".artist-card");

      if (!artistCard) return;

      // Get ID of Artist through dataset
      const artistId = artistCard.dataset.id;

      this.addPlaylistBtn.dataset.artistid = artistId;
      // Base on ID, Get artist's album
      const artistAlbumData = await this._getArtistAlbumApi(artistId);

      // Get Artist's Name
      const nameArtist = artistAlbumData?.artist?.name;

      console.log(artistAlbumData);

      // Get first Album of artist
      const albumId = artistAlbumData?.albums[0]?.id;

      // if (!albumId) return;

      // Base on Album ID, get Album Track
      const artistAlbumTrack = await this._getAlbumTrackApi(albumId);

      this._swapState();
      const albumCoverImg = artistAlbumTrack?.album?.cover_image_url;
      const albumTracks = artistAlbumTrack?.tracks;

      publicPlaylistTracks = albumTracks;

      console.log(albumTracks);

      // Render to Interface
      trackPage.handleRenderTrackPage(albumCoverImg, nameArtist, albumTracks);

      // allow to play audio after render artist to interface
      trackPlaying.playingTrack();
    };
  }

  async _getArtistAlbumApi(id) {
    try {
      const res = await httpRequest.sendApi(
        `/artists/${id}/albums`,
        null,
        "get",
      );

      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async _renderTopHits() {
    this.hitsGrid.innerHTML = "";
    const albumsData = await this._getAlbumsData();
    const allAlbums = albumsData.albums;

    const allTopHits = allAlbums
      .map((album) => {
        const html = `
         <div class="hit-card" data-id="${album.id}" data-title="${album.title}">
                <div class="hit-card-cover">
                  <img
                    src="${album.cover_image_url}"
                    alt="${album.title}"
                  />
                  <button class="hit-play-btn">
                    <i class="fas fa-play"></i>
                  </button>
                </div>
                <div class="hit-card-info">
                  <h3 class="hit-card-title">${album.title}</h3>
                  <p class="hit-card-artist">${album.artist_name}</p>
                </div>
              </div>
      `;

        const cleanHtml = DOMPurify.sanitize(html);
        return cleanHtml;
      })
      .join("");

    this.hitsGrid.innerHTML = allTopHits;
  }

  _handleOpenHitTrack() {
    this.hitsGrid.onclick = async (e) => {
      const hitItem = e.target.closest(".hit-card");
      if (hitItem) {
        const hitId = hitItem.dataset.id;

        this.addPlaylistBtn.dataset.playlistid = hitId;
        const hitTitle = hitItem.dataset.title;
        const hitData = await this._getAlbumTrackApi(hitId);
        this._setQueryParam(this._slugify(hitTitle), hitId);
        this._swapState();
        const albumCoverImg = hitData?.album.cover_image_url;
        const albumTitle = hitData?.album.title;
        const albumTracks = hitData?.tracks;

        publicPlaylistTracks = albumTracks;

        trackPage.handleRenderTrackPage(albumCoverImg, albumTitle, albumTracks);

        // allow to play audio after render hit track to interface
        trackPlaying.playingTrack();
      }
    };
  }

  _slugify(str) {
    const newStr = str
      .normalize("NFD")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

    return newStr;
  }

  _swapState() {
    this.albumContainer.hidden = true;
    this.playListContainer.hidden = false;
  }

  _setQueryParam(title, id) {
    const param = new URLSearchParams(location.search);
    param.set(title, id);
    history.pushState(null, null, `?${title}=${param.get(title)}`);
  }

  async _getAlbumTrackApi(id) {
    try {
      const res = await httpRequest.sendApi(
        `/albums/${id}/tracks`,
        null,
        "get",
      );
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  _handleReturnHome() {
    document.querySelector(".home-btn").onclick = (e) => (location.href = "/");
    document.querySelector("#logo-spotify").onclick = (e) => {
      location.href = location.origin + location.pathname;
    };

    document.querySelector("#logo-spotify").style.cursor = "pointer";
  }

  async _handleWithTopHits() {
    await this._renderTopHits();
    this._handleOpenHitTrack();
  }

  async _handleWithArtist() {
    await this._renderPopularArtists();
    this._handleOpenArtistTrack();
  }

  async executeHome() {
    this._handleReturnHome();
    // history.replaceState(null, null, `/`);
    await this._handleWithTopHits();
    await this._handleWithArtist();
  }
}

const home = new Home();

export default home;
