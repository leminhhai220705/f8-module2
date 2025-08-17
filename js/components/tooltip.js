class Tooltip {
  tooltip = document.querySelector("#tooltip");
  shuffleBtn = document.querySelector("#shuffle-btn");
  repeatBtn = document.querySelector("#repeat-btn");

  constructor() {}

  handleDisplayTooltip() {
    const setTooltipState = (content, btn) => {
      this.tooltip.textContent = content;
      this.tooltip.style = `bottom: 80px; left: ${btn.offsetLeft - 35}px`;
    };
    this.shuffleBtn.addEventListener("mouseenter", (e) => {
      setTooltipState("Enable Shuffle", e.target);
    });

    this.repeatBtn.addEventListener("mouseenter", (e) => {
      setTooltipState("Enable Repeat", e.target);
    });
  }
}

const tooltip = new Tooltip();

export default tooltip;
