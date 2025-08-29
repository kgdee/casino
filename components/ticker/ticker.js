class Ticker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.element = null;
    this.itemsEl = null;

    this.items = [
      { game: 0, amount: "$32", user: "James" },
      { game: 1, amount: "$10", user: "Mary" },
      { game: 2, amount: "$201", user: "John" },
      { game: 3, amount: "$50", user: "Sarah" },
      { game: 0, amount: "$100", user: "Michael" },
      { game: 1, amount: "$29", user: "Emily" },
      { game: 2, amount: "$12", user: "David" },
      { game: 3, amount: "$85", user: "Jessica" },
    ];

    this.max = 7;
    this.rate = 1;
    this.interval = 2;
    this.itemWidth = 150;
    this.gap = 10;
    this.step = 0;
    
    this.ready = this.render();
    globalThis.ticker = this;
  }

  async render() {
    const styleEls = await createStyleEls(["utils.css", "components/ticker/ticker.css"]);
    this.shadowRoot.innerHTML = `
      ${styleEls}
      <div class="ticker">
        <div class="title flex-center">
          <span>NEWS</span>
        </div>
        <div class="items-outer">
          <div class="items"></div>
        </div>
      </div>
    `;

    this.element = this.shadowRoot.querySelector(".ticker");
    this.itemsEl = this.element.querySelector(".items");
    this.itemsEl.style.gap = `${this.gap}px`;
  }

  async start() {
    await this.render();
    this.items.forEach((item) => this.addItemEl(item));

    this.update();
  }

  async update() {
    const item = this.items[this.step];
    this.step = (this.step + 1) % this.items.length;

    this.addItemEl(item);

    this.itemsEl.style.transition = `transform ${this.rate}s linear`;
    this.itemsEl.style.transform = `translateX(-${this.itemWidth + this.gap}px)`;

    await sleep(1000 * this.rate);

    this.itemsEl.style.transition = null;
    this.itemsEl.style.transform = null;

    if (this.itemsEl.children.length >= this.max) {
      this.itemsEl.children[0].remove();
    }

    await sleep(1000 * this.interval);
    this.update();
  }

  addItemEl(item) {
    this.itemsEl.insertAdjacentHTML(
      "beforeend",
      `
      <div class="item" style="width: ${this.itemWidth}px;">
        <img src="${gameDetails[item.game].image}" />
        <div class="details">
          <span class="amount">${item.amount}</span>
          <span class="user">${item.user}</span>
          <span class="game">${gameDetails[item.game].name}</span>
        </div>
      </div>
    `
    );
  }
}

customElements.define("my-ticker", Ticker);
