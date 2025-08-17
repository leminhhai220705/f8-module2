import httpRequest from "../services/httpRequest.js";
import secToMin from "../utils/SecToMin.js";
import trackPlaying from "../components/trackplaying.js";

class Footer {
  trackList = document.querySelector(".track-list");
  playerImg = document.querySelector(".player-image");
  playerTitle = document.querySelector(".player-title");
  playerArtist = document.querySelector(".player-artist");
  playBtn = document.querySelector(".play-btn");
  audio = document.querySelector("#audio");
  progressBar = document.querySelector(".progress-bar");
  progressFill = document.querySelector(".progress-fill");
  progressHandle = document.querySelector(".progress-handle");
  timeStart = document.querySelector("#time-start");
  timeEnd = document.querySelector("#time-end");

  isSeeking = false;
  isInFooter = false;

  constructor() {}
  async handleFooter(home = false) {
    if (home) {
      trackPlaying.handleShuffle();
      trackPlaying.handleLoop();
      this._renderTrack();

      this.playBtn.onclick = () => {
        if (this.audio.paused) {
          this.audio.play().catch((err) => {
            console.log(err);
            this.audio.src =
              "./audio/Rất Lâu Rồi Mới Khóc Remix - Kiều Chi  Chiều Nay Mưa Giông Ở Đâu Cứ Trút Vào Lòng.mp3";
          });
        } else {
          this.audio.pause();
        }
      };

      this.audio.onplay = () => {
        this.playBtn
          .querySelector("i")
          .classList.replace("fa-play", "fa-pause");
      };

      this.audio.onpause = () => {
        this.playBtn
          .querySelector("i")
          .classList.replace("fa-pause", "fa-play");
      };

      document.addEventListener("keydown", (e) => {
        if (!this.isPlaying) return;
        if (e.key === "ArrowRight") {
          this.audio.currentTime += 5;
        } else if (e.key === "ArrowLeft") {
          this.audio.currentTime -= 5;
        }
      });

      this.audio.ontimeupdate = () => {
        if (this.isSeeking) return;
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;
        const progressBarWidth = this.progressBar.offsetWidth;

        if (isNaN(currentTime) || isNaN(duration) || isNaN(progressBarWidth))
          return;

        const percentCurrentTime = (currentTime / duration) * 100;
        const timeWidth = (percentCurrentTime / 100) * progressBarWidth;
        this.progressFill.style.width = `${timeWidth}px`;
        this.progressHandle.style.transform = `translate(${timeWidth}px, -50%)`;
        this.timeStart.textContent = secToMin.transferFromSecToMin(currentTime);
        this.timeEnd.textContent = secToMin.transferFromSecToMin(duration);
      };

      this.progressHandle.onmousedown = (e) => {
        this.isSeeking = true;
      };

      this.progressHandle.onmouseup = (e) => {
        this.isSeeking = false;

        this.audio.currentTime = this._updateChange(e);
      };

      this.progressHandle.onmouseleave = (e) => {
        this.isSeeking = false;
      };

      this.progressBar.onmousemove = (e) => {
        if (this.isSeeking) {
          this._updateChange(e);
        }
      };

      this.progressBar.onclick = (e) => {
        this._updateChange(e);
        this.audio.currentTime = this._updateChange(e);
      };

      return;
    }
    await this._saveTrack();
  }

  _updateChange(e) {
    const seekingPosition = e.clientX;
    const minSeekingPosition = this.progressBar.offsetLeft;
    const maxSeekingPosition =
      this.progressBar.offsetLeft + this.progressBar.offsetWidth;
    const seeklimitation = Math.max(
      minSeekingPosition,
      Math.min(maxSeekingPosition, seekingPosition),
    );
    this.progressHandle.style.transform = `translate(${
      seeklimitation - minSeekingPosition
    }px, -50%)`;
    const seekingPositionViaProgressBar = Math.max(
      0,
      Math.min(
        this.progressBar.offsetWidth,
        seekingPosition - this.progressBar.offsetLeft,
      ),
    );

    console.log(seekingPositionViaProgressBar);

    const percentage =
      (seekingPositionViaProgressBar / this.progressBar.offsetWidth) * 100;
    const currentTimeUpdate = (percentage / 100) * this.audio.duration;
    if (isNaN(currentTimeUpdate)) return;
    this.progressFill.style.width = `${seekingPositionViaProgressBar}px`;

    this.timeStart.textContent =
      secToMin.transferFromSecToMin(currentTimeUpdate);
    return currentTimeUpdate;
  }

  async _getTrack(id) {
    try {
      const res = await httpRequest.sendApi(`/tracks/${id}`, null, "get");
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async _saveTrack() {
    const track = this.trackList.querySelector(".playing");
    const trackId = track.dataset.id;
    const trackInfo = await this._getTrack(trackId);
    this.playerImg.src = trackInfo.image_url;
    this.playerTitle.textContent = trackInfo.title;
    this.playerArtist.textContent = trackInfo.artist_name;
    localStorage.setItem("current_track", JSON.stringify(trackInfo));
  }

  _renderTrack() {
    const trackInfo = JSON.parse(localStorage.getItem("current_track"));
    if (!trackInfo) return;
    this.playerImg.src = trackInfo.image_url;
    this.playerTitle.textContent = trackInfo.title;
    this.playerArtist.textContent = trackInfo.artist_name;
    this.audio.src = trackInfo.audio_url;
  }
}

const footer = new Footer();

export default footer;
