import secToMin from "../utils/SecToMin.js";
import trackPlaying from "../components/trackplaying.js";

class TrackPage {
  heroImg = document.querySelector(".hero-image");
  artistName = document.querySelector(".artist-name");
  trackList = document.querySelector(".track-list");
  constructor() {}

  handleRenderTrackPage(coverImg, title, tracks) {
    this.trackList.innerHTML = "";
    this.heroImg.src = coverImg;
    this.artistName.textContent = title;
    const trackStructures = tracks
      .map((track, index) => {
        const html = `
         <div class="track-item" data-id="${track.id}" data-index="${index}">
                  <div class="track-number">${index + 1}</div>
                  <div class="track-image">
                    <img
                      src="${track.artist_image_url}"
                      alt="${track.title}"
                    />
                  </div>
                  <div class="track-info">
                    <div class="track-name">${track.title}</div>
                  </div>
                  <div class="track-plays">${track.play_count}</div>
                  <div class="track-duration">${secToMin.transferFromSecToMin(
                    track.duration,
                  )}</div>
                  <button class="track-menu-btn">
                    <i class="fas fa-ellipsis-h"></i>
                  </button>
                </div>
        `;

        const cleanHtml = DOMPurify.sanitize(html);
        return cleanHtml;
      })
      .join("");
    this.trackList.innerHTML = trackStructures;

    // handle playing track
  }
}

const trackPage = new TrackPage();

export default trackPage;
