import httpRequest from "../services/httpRequest.js";
import { publicPlaylistTracks } from "../pages/home.js";
import { playlistTracks } from "./newPlaylistLogic.js";
import footer from "../layouts/footer.js";
// const publicPlaylistTracks = [
//   {
//     audio_url:
//       "./audio/Lao Tâm Khổ Tứ ( Bản Hot Nhất TikTok AE Đang Tìm Kiếm ) x Cao Ốc 20 - HHuy Remix 2.mp3",
//   },
//   {
//     audio_url:
//       "./audio/Mở Lối Cho Em (Style Huy PT Remix) - Lương Quý Tuấn & AIR Remix  Đậm Sâu Rồi Cũng Rẽ Hai Hot TikTok.mp3",
//   },
//   {
//     audio_url:
//       "./audio/Nắng Dưới Chân Mây Remix (Bản Hot TikTok) - Nguyễn Hữu Kha  Trả Lại Em Những Nỗi Buồn Remix TikTok.mp3",
//   },
//   {
//     audio_url:
//       "./audio/Rất Lâu Rồi Mới Khóc Remix - Kiều Chi  Chiều Nay Mưa Giông Ở Đâu Cứ Trút Vào Lòng.mp3",
//   },

//   {
//     audio_url:
//       "./audio/Chúng Ta Không Giống Nhau (我們不一樣) - ARS Remix  ARS ft Mrr Fy & Bros Oun Cheq.mp3",
//   },
// ];
import secToMin from "../utils/SecToMin.js";

class TrackPlaying {
  playlistsContainer = document.querySelector("#playlists-container");
  hitsGrid = document.querySelector("#hits-grid");
  playBtnLarge = document.querySelector(".play-btn-large");
  playBtn = document.querySelector(".play-btn");
  audio = document.querySelector("#audio");
  progressBar = document.querySelector(".progress-bar");
  progressFill = document.querySelector(".progress-fill");
  progressHandle = document.querySelector(".progress-handle");
  timeStart = document.querySelector("#time-start");
  timeEnd = document.querySelector("#time-end");
  prevBtn = document.querySelector(".prev-btn");
  nextBtn = document.querySelector(".next-btn");
  playBtn = document.querySelector(".play-btn");
  repeatBtn = document.querySelector("#repeat-btn");
  shuffleBtn = document.querySelector("#shuffle-btn");

  currentIndex = 0;
  wasAssigned = false;
  isSeeking = false;
  isPlaying = false;
  isLoop = localStorage.getItem("is_loop") === "true";
  isShuffle = localStorage.getItem("is_shuffle") === "true";
  tracksPlayingNow = null;

  constructor() {}

  handleLoop() {
    if (this.isLoop) {
      this.repeatBtn.classList.add("active");
      this.audio.loop = this.isLoop;
    } else {
      this.repeatBtn.classList.remove("active");
      this.audio.loop = this.isLoop;
    }

    this.repeatBtn.onclick = () => {
      this.isLoop = !this.isLoop;
      localStorage.setItem("is_loop", this.isLoop);
      this.audio.loop = this.isLoop;
      this.isLoop === true ? this.repeatBtn.classList.add("active") : this.repeatBtn.classList.remove("active");
    };
  }

  handleShuffle() {
    this.isShuffle ? this.shuffleBtn.classList.add("active") : this.shuffleBtn.classList.remove("active");
    this.shuffleBtn.onclick = () => {
      this.isShuffle = !this.isShuffle;
      localStorage.setItem("is_shuffle", this.isShuffle);
      this.isShuffle ? this.shuffleBtn.classList.add("active") : this.shuffleBtn.classList.remove("active");
    };
  }

  _handleLogicShuffle() {
    const length = this.tracksPlayingNow.length;

    if (length <= 1) return 0;
    let randomIndex = 0;
    while (this.currentIndex === randomIndex) {
      randomIndex = Math.floor(Math.random() * length);
    }

    return randomIndex;
  }

  playingTrack(tracks = publicPlaylistTracks) {
    this.tracksPlayingNow = tracks;
    this.handleLoop();
    this.handleShuffle();
    this.playlistsContainer.onclick = async (e) => {
      if (!e.target.closest(".track-item")) return;
      // const trackAudio = e.target.closest(".track-item").dataset.audio;

      this.currentIndex = +e.target.closest(".track-item").dataset.index;

      await this._assignUrlAudiAndPlayingActive();
      footer.handleFooter();
    };

    this.playBtn.onclick = async () => {
      await this._playAudio();
    };

    this.playBtnLarge.onclick = async () => {
      await this._playAudio();
    };

    this.audio.onplay = async () => {
      this._changeBtnState("fa-play", "fa-pause");
      this.isPlaying = true;
    };

    this.audio.onpause = () => {
      this._changeBtnState("fa-pause", "fa-play");
      this.isPlaying = false;
    };

    document.addEventListener("keydown", (e) => {
      if (!this.isPlaying) return;
      if (e.key === "ArrowRight") {
        this.audio.currentTime += 5;
      } else if (e.key === "ArrowLeft") {
        this.audio.currentTime -= 5;
      }
    });

    this.audio.ontimeupdate = async () => {
      if (this.isSeeking) return;
      const currentTime = this.audio.currentTime;
      const duration = this.audio.duration;
      const progressBarWidth = this.progressBar.offsetWidth;

      if (isNaN(currentTime) || isNaN(duration) || isNaN(progressBarWidth)) return;

      const percentCurrentTime = (currentTime / duration) * 100;
      const timeWidth = (percentCurrentTime / 100) * progressBarWidth;
      this.progressFill.style.width = `${timeWidth}px`;
      this.progressHandle.style.transform = `translate(${timeWidth}px, -50%)`;
      this.timeStart.textContent = secToMin.transferFromSecToMin(currentTime);
      this.timeEnd.textContent = secToMin.transferFromSecToMin(duration);

      if (Math.floor(currentTime) >= Math.floor(duration) && !this.isLoop) {
        if (this.isShuffle) {
          this.currentIndex = this._handleLogicShuffle();
        } else {
          this.currentIndex += 1;
        }
        await this._assignUrlAudiAndPlayingActive();
        footer.handleFooter();
      }
    };

    this.audio.oncanplay = () => {
      if (!this.isPlaying) return;
      this.audio.play().catch((err) => {
        this.currentIndex = 0;
        console.log(err);
      });
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

    this.prevBtn.onclick = async () => {
      await this._prevTrack();
      footer.handleFooter();
    };

    this.nextBtn.onclick = async () => {
      await this._nextTrack();
      footer.handleFooter();
    };
  }

  async _playAudio() {
    if (!this.wasAssigned) {
      await this._assignUrlAudiAndPlayingActive();
      footer.handleFooter();
    }

    if (this.audio.paused) {
      this.audio.play().catch((err) => console.log(err));
    } else {
      this.audio.pause();
    }
  }

  async _assignUrlAudiAndPlayingActive() {
    if (!this.tracksPlayingNow.length) return;
    const length = this.tracksPlayingNow.length;
    this.currentIndex = (this.currentIndex + length) % length;

    await this._setPlayingActive();
    const tracksAudioUrl = this.tracksPlayingNow[this.currentIndex]?.audio_url;
    if (!tracksAudioUrl) return;

    this.audio.src = tracksAudioUrl;

    this.wasAssigned = true;
    this.isPlaying = true;
  }

  async _nextTrack() {
    if (this.isShuffle) {
      this.currentIndex = this._handleLogicShuffle();
    } else {
      this.currentIndex += 1;
    }
    await this._assignUrlAudiAndPlayingActive();
  }

  async _prevTrack() {
    if (this.isShuffle) {
      this.currentIndex = this._handleLogicShuffle();
    } else if (this.audio.currentTime >= 2) {
      this.currentIndex -= 0;
    } else {
      this.currentIndex -= 1;
    }
    await this._assignUrlAudiAndPlayingActive();
  }

  _seeking() {}

  _changeBtnState(prevClass, changedClass) {
    [this.playBtnLarge.querySelector("i"), this.playBtn.querySelector("i")].forEach((icon) =>
      icon.classList.replace(prevClass, changedClass),
    );
  }

  _updateChange(e) {
    const seekingPosition = e.clientX;
    const minSeekingPosition = this.progressBar.offsetLeft;
    const maxSeekingPosition = this.progressBar.offsetLeft + this.progressBar.offsetWidth;
    const seeklimitation = Math.max(minSeekingPosition, Math.min(maxSeekingPosition, seekingPosition));
    this.progressHandle.style.transform = `translate(${seeklimitation - minSeekingPosition}px, -50%)`;
    const seekingPositionViaProgressBar = Math.max(
      0,
      Math.min(this.progressBar.offsetWidth, seekingPosition - this.progressBar.offsetLeft),
    );

    const percentage = (seekingPositionViaProgressBar / this.progressBar.offsetWidth) * 100;
    const currentTimeUpdate = (percentage / 100) * this.audio.duration;
    if (isNaN(currentTimeUpdate)) return;
    this.progressFill.style.width = `${seekingPositionViaProgressBar}px`;

    this.timeStart.textContent = secToMin.transferFromSecToMin(currentTimeUpdate);
    return currentTimeUpdate;
  }

  async _setPlayingActive() {
    const tracks = document.querySelectorAll(".track-item");
    tracks.forEach((track) => {
      track.classList.remove("playing");
    });

    tracks[this.currentIndex].classList.add("playing");
  }
}

const trackPlaying = new TrackPlaying();

export default trackPlaying;
