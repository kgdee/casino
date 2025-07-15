class RewardModal extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.element = null;
    this.modalContent = null;

    this.render();
    globalThis.rewardModal = this;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="components/reward-modal/reward-modal.css" />
      <div class="reward-modal modal hidden" onclick="rewardModal.toggle()">
        <div class="modal-content"></div>
      </div>
    `;
    this.element = this.shadowRoot.querySelector(".reward-modal");
    this.modalContent = this.element.children[0];
  }

  toggle(items = []) {
    const hasRewards = items.length > 0;
    this.element.classList.toggle("hidden", !hasRewards);
    if (!hasRewards) return;

    this.modalContent.innerHTML = `
      <div class="title">You got</div>
      <div class="items items-container">${items.map((item) => this.createItemEl(item, item.quantity)).join("")}</div>
      <div class="actions">
        <button onclick="rewardModal.toggle()">Ok</button>   
      </div>
      <button class="close-btn" onclick="rewardModal.toggle()"><i class="bi bi-x-lg"></i></button>   
    `;
    launchConfetti(1);
    handleModalLayer(this.element)
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

customElements.define("my-reward-modal", RewardModal)