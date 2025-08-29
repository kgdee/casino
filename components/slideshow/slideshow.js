class Slideshow extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.element = null;
    this.imagesEl = null;

    this.images = null;
    this.interval = 4;
    this.intervalId = null;
    this.currentIndex = 0;
    
    this.instanceKey = globalThisPut(this, "slideshows");
  }

  static get observedAttributes() {
    return ["images"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name ===  "images") {
      this.images = newValue
      this.render()
    }
  }

  async render() {
    const styleEls = await createStyleEls(["utils.css", "components/slideshow/slideshow.css"])
    this.images = this.images.split(" ");
    this.shadowRoot.innerHTML = `
      ${styleEls}
      <div class="slideshow">
        <div class="images">
          <img src="images/${this.images[0]}" />
        </div>
        <button class="prev" onclick="${this.instanceKey}.slide(-1)"><i class="bi bi-caret-left"></i></button>
        <button class="next" onclick="${this.instanceKey}.slide(1)"><i class="bi bi-caret-right"></i></button>
      </div>
    `;
    this.element = this.shadowRoot.querySelector(".slideshow");
    this.imagesEl = this.element.querySelector(".images");
    
    this.resetInterval()
  }

  async slide(direction = 1) {
    this.resetInterval()

    const image = this.images[this.currentIndex];
    this.currentIndex = cycleIndex(this.currentIndex + direction, this.images.length);
    const nextImage = this.images[this.currentIndex];

    const moveX = direction >= 0 ? 100 : -100;

    this.imagesEl.innerHTML = `
      <img src="images/${image}" />
      <img src="images/${nextImage}" style="left: ${moveX}%;" />
    `;

    await sleep(100);
    this.imagesEl.children[0].style.left = `${-moveX}%`;
    this.imagesEl.children[1].style.left = "0";
  }

  resetInterval() {
    clearInterval(this.intervalId)
    this.intervalId = setInterval(() => {
      this.slide();
    }, 1000 * this.interval);
  }
}

customElements.define("my-slideshow", Slideshow);