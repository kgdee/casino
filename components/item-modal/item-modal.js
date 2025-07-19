class ItemModal extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.element = null;
    this.modalContent = null;

    this.itemData = null;
    this.mode = null;
    this.onCancel = () => {};

    this.ready = this.render();
    globalThis.itemModal = this;
  }

  async render() {
    const styleEls = await createStyleEls(["utils.css", "components/item-modal/item-modal.css"])
    this.shadowRoot.innerHTML = `
      ${styleEls}
      <div class="item-modal modal hidden" onclick="itemModal.toggle()">
        <div class="modal-content"></div>
      </div>
    `;

    this.element = this.shadowRoot.querySelector(".item-modal");
    this.shadowRoot.querySelectorAll(".modal > *").forEach((el) => el.addEventListener("click", (event) => event.stopPropagation()));
  }

  async toggle(itemId, { quantity = null, mode = null } = {}) {
    this.onCancel();
    this.itemData = itemDB.getItem(itemId);
    const itemData = this.itemData
    this.element.classList.toggle("hidden", !itemData);
    if (!itemData) return;

    this.mode = mode;
    this.modalContent = this.element.children[0];
    this.modalContent.innerHTML = `
      <div class="title">
        <img src="${itemData.image}" /> 
        <span>
          <span class="name truncated">${itemData.name}</span>
          ${quantity > 1 ? ` x${quantity}` : ""} 
        </span>
        ${this.createTierLabel(itemData.rarity)}
      </div>
      <div class="description">${itemData.description}</div>
      <div class="actions"></div>
      <button class="close-btn icon-btn" onclick="itemModal.toggle()"><i class="bi bi-x-lg"></i></button>
    `;

    handleModalLayer(this.element)
    const result = await this.handleActions();
    return result;
  }

  handleActions() {
    const actionsEl = this.modalContent.querySelector(".actions");
    if (this.mode === "manage") {
      actionsEl.innerHTML = `
        ${this.itemData.effect ? `<button onclick="inventory.useItem(${this.itemData.id})">Use</button>` : ""}
        <button onclick="inventory.sellItem(${this.itemData.id})">Sell</button>
      `;
    } else if (this.mode === "shop") {
      actionsEl.innerHTML = `
        <button class="confirm">Buy</button>
      `;
      const confirmBtn = actionsEl.querySelector(".confirm");
      return new Promise((resolve) => {
        this.onCancel = () => resolve(false);
        confirmBtn.onclick = () => {
          this.accept(resolve);
        };
      });
    }
  }

  accept(resolve) {
    resolve(true);
    this.onCancel = () => {};
    this.toggle();
  }

  createTierLabel(rarity) {
    const tierName = itemDB.getTierName(rarity)
    return `
      <span class="tier-label ${tierName.toLowerCase()}">${tierName}</span>
    `;
  }
}

customElements.define("my-item-modal", ItemModal);
