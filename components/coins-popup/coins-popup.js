class CoinsPopup extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.element = null;

    this.max = 10;

    this.render();
    globalThis.coinsPopup = this;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="utils.css" />
      <link rel="stylesheet" href="components/coins-popup/coins-popup.css" />
      <div class="coins-popup"></div>
    `;

    this.element = this.shadowRoot.querySelector(".coins-popup");
  }

  async show(balance) {
    if (this.element.children.length >= this.max) return

    const move = 200;
    const coins = balance ? clamp(Math.floor(balance / 100), 3, 9) : 3;
    
    this.element.classList.remove("hidden");
    const id = generateId()
    this.element.insertAdjacentHTML(
      "beforeend",
      `
      <div data-id="${id}" class="item">
        ${Array.from({ length: coins })
          .map((_, i) => `<img src="images/chip.png" />`)
          .join("")}
      </div>
    `
    );
    const itemEl = this.element.querySelector(`[data-id="${id}"]`);

    await sleep(100);
    Array.from(itemEl.children).forEach((el) => {
      const x = Math.random() * move - move / 2;
      const y = Math.random() * move - move / 2;
      el.style.translate = `${x}px ${y}px`;
    });

    await sleep(1000);
    Array.from(itemEl.children).forEach((el) => {
      el.style.translate = null;
      el.style.bottom = "-100px";
    });

    await sleep(3000);
    itemEl.remove();
    if (this.element.children.length <= 0) this.element.classList.add("hidden");
  }
}

customElements.define("my-coins-popup", CoinsPopup);
