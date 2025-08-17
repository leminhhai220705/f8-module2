class VolumeSliding {
  audio = document.querySelector("#audio");

  constructor() {}

  handleSliding = (e) => {
    if (!this.isDragging) return;
    requestAnimationFrame(() => {
      const rightPosition =
        this.volumeBar.offsetLeft + this.volumeBar.offsetWidth;

      const leftPosition = this.volumeBar.offsetLeft;

      console.log(rightPosition - e.clientX, rightPosition - leftPosition);

      const range = Math.max(
        0,
        Math.min(rightPosition - e.clientX, rightPosition - leftPosition),
      );

      this.volumeThumb.style = `transform: translate(${-range}px, -50%); transition: none`;

      this.volumeFill.style = `max-width: ${
        this.volumeBar.offsetWidth - range
      }px; transition: none`;

      const volumeBarWidth = this.volumeBar.offsetWidth;
      const volumeBarFillWidth = this.volumeFill.offsetWidth;
      this.audio.volume = volumeBarFillWidth / volumeBarWidth;

      if (!this.audio.volume) {
        this.volumeIcon.classList.replace("fa-volume-down", "fa-volume-xmark");
      } else {
        this.volumeIcon.classList.replace("fa-volume-xmark", "fa-volume-down");
      }
    });
  };

  executeSlidingLogic() {
    this.volumeThumb = document.querySelector(".volume-handle");
    this.volumeBar = document.querySelector(".volume-bar");
    this.volumeFill = document.querySelector(".volume-fill");
    this.volumeIcon = document.querySelector("#volume-icon");
    this.isDragging = false;

    document.querySelector("#volume-btn").onclick = () => {
      if (this.volumeIcon.classList.contains("fa-volume-down")) {
        this.audio.volume = 0;
        this.volumeFill.style.maxWidth = "0";
        const range =
          this.volumeBar.offsetLeft +
          this.volumeBar.offsetWidth -
          this.volumeBar.offsetLeft;
        this.volumeThumb.style = `transform: translate(${-range}px, -50%); transition: none`;
        this.volumeIcon.classList.replace("fa-volume-down", "fa-volume-xmark");
      } else if (this.volumeIcon.classList.contains("fa-volume-xmark")) {
        this.audio.volume = 1;
        this.volumeFill.style.maxWidth = `${
          this.volumeBar.offsetLeft +
          this.volumeBar.offsetWidth -
          this.volumeBar.offsetLeft
        }px`;

        const range = 0;
        this.volumeThumb.style = `transform: translate(${-range}px, -50%); transition: none`;
        this.volumeIcon.classList.replace("fa-volume-xmark", "fa-volume-down");
      }
    };

    this.volumeThumb.onmousedown = (e) => {
      this.isDragging = true;
      this.volumeBar.addEventListener("mousemove", this.handleSliding);
      console.log(this.audio);
    };

    this.volumeThumb.onmouseup = (e) => {
      this.isDragging = false;
      this.volumeBar.removeEventListener("mousemove", this.handleSliding);
    };

    this.volumeBar.onmouseleave = () => {
      this.isDragging = false;
    };

    this.volumeBar.onmousedown = (e) => {
      this.isDragging = true;
      this.handleSliding(e);
      this.volumeBar.addEventListener("mousemove", this.handleSliding);
    };

    this.volumeBar.onmouseup = () => {
      this.isDragging = false;
      this.volumeBar.removeEventListener("mousemove", this.handleSliding);
    };
  }
}

const volumeSliding = new VolumeSliding();

export default volumeSliding;
