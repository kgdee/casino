class Slideshow extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.element = null;
    this.imagesEl = null;

    this.images = "banner-1.jpg banner-2.jpg banner-3.jpg";
    this.interval = 4;
    this.currentIndex = 0;
    this.intervalId = null;
    this.disabled = false;

    this.ready = this.render();
    this.instanceKey = globalThisPut(this, "slideshows");
  }

  static get observedAttributes() {
    return ["disabled", "images"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue || newValue !== null;
  }

  async render() {
    const styleEls = await createStyleEls(["utils.css", "components/slideshow/slideshow.css"])
    this.images = this.images.split(" ");
    this.shadowRoot.innerHTML = `
      ${styleEls}
      <div class="slideshow">
        <div class="images"></div>
        <button class="prev" onclick="${this.instanceKey}.slide(-1)"><i class="bi bi-caret-left"></i></button>
        <button class="next" onclick="${this.instanceKey}.slide(1)"><i class="bi bi-caret-right"></i></button>
      </div>
    `;
    this.element = this.shadowRoot.querySelector(".slideshow");
    this.imagesEl = this.element.querySelector(".images");
    this.slide();
  }

  async slide(direction = 1) {
    if (this.disabled) return;

    const image = this.images[this.currentIndex];
    this.currentIndex = cycle(this.currentIndex + direction, this.images.length);
    const nextImage = this.images[this.currentIndex];

    const moveX = direction >= 0 ? 100 : -100;

    this.imagesEl.innerHTML = `
      <img src="images/${image}" />
      <img src="images/${nextImage}" style="left: ${moveX}%;" />
    `;

    await sleep(100);
    this.imagesEl.children[0].style.left = `${-moveX}%`;
    this.imagesEl.children[1].style.left = "0";

    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (this.disabled) clearInterval(this.intervalId);
      else this.slide();
    }, 1000 * this.interval);
  }
}

customElements.define("my-slideshow", Slideshow);
