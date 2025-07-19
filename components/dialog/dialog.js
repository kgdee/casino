class Dialog extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.element = null;
    this.titleEl = null
    this.messageEl = null
    this.onCancel = () => {}
    this.onAccept = () => {}

    this.ready = this.render();
    globalThis.dialog = this;
  }

  async render() {
    const styleEls = await createStyleEls(["utils.css", "components/dialog/dialog.css"])
    this.shadowRoot.innerHTML = `
      ${styleEls}
      <div class="dialog-modal modal hidden" onclick="dialog.toggle()">
        <div class="modal-content">
          <span class="title"></span>
          <p class="message"></p>
          <div class="actions">
            <button class="confirm" onclick="dialog.onAccept()">Yes</button>
            <button class="cancel" onclick="dialog.toggle()">No</button>
          </div>
          <button class="close-btn icon-btn" onclick="dialog.toggle()"><i class="bi bi-x-lg"></i></button>   
        </div>
      </div>
    `;
    this.element = this.shadowRoot.querySelector(".dialog-modal");
    this.titleEl = this.shadowRoot.querySelector(".title")
    this.messageEl = this.shadowRoot.querySelector(".message")
    this.shadowRoot.querySelectorAll(".modal > *").forEach((el) => el.addEventListener("click", (event) => event.stopPropagation()));
  }

  toggle({ title = "", message = "" } = {}) {
    this.onCancel()
    const hasContent = title || message
    this.element.classList.toggle("hidden", !hasContent);
    if (!hasContent) return;

    this.titleEl.innerHTML = title
    this.messageEl.innerHTML = message

    handleModalLayer(this.element)
    return new Promise((resolve) => {
      this.onCancel = () => resolve(false)
      this.onAccept = () => this.accept(resolve)
    })
  }

  accept(resolve) {
    resolve(true)
    this.onCancel = () => {}
    this.toggle()
  }
}

customElements.define("my-dialog", Dialog)