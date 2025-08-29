class Layout extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.render()
  }

  
  async render() {
    const styleEls = await createStyleEls(["utils.css", "pages/layout/layout.css"])
    this.shadowRoot.innerHTML = `
      ${styleEls}
      <my-navbar></my-navbar>
      <main class="container">
        <slot></slot>
        <my-inventory></my-inventory>
        <my-shop></my-shop>
        <my-item-modal></my-item-modal>
        <my-reward-modal></my-reward-modal>
        <my-dialog></my-dialog>
        <my-coins-popup></my-coins-popup>
        <my-toast></my-toast>
        <my-popup-banner></my-popup-banner>
      </main>
    `
  }
}

customElements.define("my-layout", Layout);