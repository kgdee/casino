class Toast extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.element = null;

    this.currentItems = [];
    this.max = 3;
    this.time = 3;

    this.ready = this.render();
    globalThis.toast = this;
  }

  async render() {
    const styleEls = await createStyleEls(["utils.css", "components/toast/toast.css"]);
    this.shadowRoot.innerHTML = `
      ${styleEls}
      <div class="toast hidden"></div>
    `;
    this.element = this.shadowRoot.querySelector(".toast");
  }

  async show(message) {
    if (!message) return;
    this.element.classList.remove("hidden");
    const id = generateId();

    this.element.insertAdjacentHTML(
      "beforeend",
      `
      <div data-id="${id}" class="item">
        ${message}
      </div>
    `
    );
    const itemEl = this.element.querySelector(`[data-id="${id}"]`);

    if (this.element.children.length > this.max) this.element.children[0].remove();

    await sleep(1000 * this.time);

    itemEl.remove();
    if (this.element.children.length <= 0) this.element.classList.add("hidden");
  }
}

customElements.define("my-toast", Toast);
