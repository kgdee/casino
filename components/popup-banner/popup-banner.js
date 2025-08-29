class PopupBanner extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.element = null;

    this.duration = 2;
    this.timeOut = null;
    
    this.ready = this.render();
    globalThis.popupBanner = this;
  }

  async render() {
    const styleEls = await createStyleEls(["utils.css", "components/popup-banner/popup-banner.css"])
    this.shadowRoot.innerHTML = `
      ${styleEls}
      <div class="popup-banner hidden"></div>
    `;
    this.element = this.shadowRoot.querySelector(".popup-banner");
  }

  show(multiplier) {
    let index = 0;

    if (multiplier >= 5) index = 2;
    else if (multiplier >= 2) index = 1;

    launchConfetti();
    if (index > 0) this.displayBanner(index)
  }

  displayBanner(index) {
    this.element.classList.remove("hidden");
    this.element.innerHTML = `
      <img class="center" src="images/popup-${index}.png" style="animation: popup-banner ${this.duration}s ease-out forwards;">
    `;

    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => {
      this.element.classList.add("hidden");
    }, 1000 * this.duration);
  }

}

customElements.define("my-popup-banner", PopupBanner)