class ControlBar extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.element = null;
    this.playBtn = null;
    this.messageEl = null;
    this.betDisplay = null;

    this.ready = this.render();
    globalThis.controlBar = this;
  }

  async render() {
    const styleEls = await createStyleEls(["utils.css", "components/control-bar/control-bar.css"])
    const html = await fetchText("components/control-bar/control-bar.html");
    this.shadowRoot.innerHTML = `
      ${styleEls}
      ${html}
    `;
    this.element = this.shadowRoot.querySelector(".control-bar");
    this.playBtn = this.element.querySelector(".play");
    this.messageEl = this.element.querySelector(".message p");
    this.betDisplay = this.element.querySelector(".bet span");

    this.displayMessage();
  }

  toggle(force) {
    this.element.classList.toggle("hidden", force != null ? !force : undefined);
  }

  update() {
    this.betDisplay.innerHTML = `Total bet<br />$${currentBet}`;
    this.playBtn.innerHTML = currentGame.isPlaying ? "End" : "Play";
  }

  displayMessage(message) {
    if (!message) message = "GOOD LUCK";
    this.messageEl.innerHTML = message;

    this.messageEl.style.animation = "message 0.5s ease-out infinite";
    clearTimeout(timeOuts.message);
    timeOuts.message = setTimeout(() => {
      this.messageEl.style.animation = null;
    }, 1000);
  }
}

customElements.define("my-control-bar", ControlBar);
