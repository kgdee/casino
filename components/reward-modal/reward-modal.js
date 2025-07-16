class RewardModal extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.element = null;
    this.itemsContainer = null;

    this.render();
    globalThis.rewardModal = this;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="utils.css" />
      <link rel="stylesheet" href="components/reward-modal/reward-modal.css" />
      <div class="reward-modal modal hidden" onclick="rewardModal.toggle()">
        <div class="modal-content">
          <div class="title">You got</div>
          <div class="slots items-container"></div>
          <div class="actions">
            <button onclick="rewardModal.toggle()">Ok</button>   
          </div>
          <button class="close-btn" onclick="rewardModal.toggle()"><i class="bi bi-x-lg"></i></button>   
        </div>
      </div>
    `;
    this.element = this.shadowRoot.querySelector(".reward-modal");
    this.itemsContainer = this.element.querySelector(".items-container");
  }

  async toggle(items = []) {
    const hasRewards = items.length > 0;
    this.element.classList.toggle("hidden", !hasRewards);
    if (!hasRewards) return;

    handleModalLayer(this.element);
    this.itemsContainer.innerHTML = ""
    for (let i = 0; i < items.length; i++) {
      this.itemsContainer.insertAdjacentHTML("beforeend", this.createItemEl(items[i], items[i].quantity));
      await sleep(250);
    }
  }

  createItemEl(itemData, quantity) {
    return `
      <div class="item" onclick="itemModal.toggle(${itemData.id}, { quantity: ${quantity}, mode: 'manage' })">
        <img src="${itemData.image}" />
        ${quantity ? `<span>${quantity}</span>` : ""}
      </div>
    `;
  }
}

customElements.define("my-reward-modal", RewardModal);
