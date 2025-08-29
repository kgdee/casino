class Navbar extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.element = null;
    this.menuEl = null;
    this.balanceText = null;
    this.themeToggle = null;

    this.ready = this.render()
    globalThis.navbar = this
  }

  async render() {
    const styleEls = await createStyleEls(["utils.css", "components/navbar/navbar.css"])
    const html = await fetchText("components/navbar/navbar.html");
    this.shadowRoot.innerHTML = `
      ${styleEls}
      ${html}
    `;
    this.element = this.shadowRoot.querySelector(".navbar")
    this.menuEl = this.element.querySelector(".navbar .menu");
    this.balanceText = this.element.querySelector(".balance span");
    this.themeToggle = this.element.querySelector(".theme-toggle");
    Array.from(this.menuEl.children).forEach((el) => el.addEventListener("click", () => this.toggle(false)));

    this.update()
  }

  toggle(force) {
    this.menuEl.classList.toggle("m-hidden", force != null ? !force : undefined);
  }

  async update() {
    await this.ready
    this.balanceText.textContent = currentBalance;

    this.themeToggle.innerHTML = isDarkTheme ? `<i class="bi bi-brightness-high"></i>` : `<i class="bi bi-moon"></i>`;
  }
}

customElements.define("my-navbar", Navbar)
