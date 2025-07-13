class Inventory extends HTMLElement {
  constructor() {
    super();

    // Create shadow root
    this.attachShadow({ mode: "open" });

    this.element = null;
    this.itemsEl = null;
    this.itemModal = null;
    this.rewardModal = null;

    this.items = [
      { id: 1, quantity: 7 },
      { id: 2, quantity: 1 },
      { id: 3, quantity: 2 },
    ];
    this.maxSize = 10;
    this.currentSize = 0;

    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="components/inventory/inventory.css" />
      <div class="inventory-modal modal hidden" onclick="inventory.toggle()">
        <div class="modal-content">
          <div class="items items-container"></div>
          <button class="close-btn" onclick="inventory.toggle()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="reward-modal modal hidden" onclick="inventory.toggleRewardModal()">
          <div class="modal-content"></div>
        </div>
        <div class="item-modal modal hidden" onclick="inventory.toggleItemModal()">
          <div class="modal-content"></div>
        </div>
      </div>
    `;

    this.element = this.shadowRoot.querySelector(".inventory-modal");
    this.itemsEl = this.shadowRoot.querySelector(".items");
    this.itemModal = this.shadowRoot.querySelector(".item-modal");
    this.rewardModal = this.shadowRoot.querySelector(".reward-modal");
    this.shadowRoot.querySelectorAll(".modal > *").forEach((el) => el.addEventListener("click", (event) => event.stopPropagation()));
  }

  findItem(itemId) {
    return this.items.find((item) => item.id === itemId);
  }

  getItemData(itemId) {
    const itemData = itemDB.find((item) => item.id === itemId)
    if (!itemData) return null
    return { ...itemData };
  }

  update() {
    this.itemsEl.innerHTML = this.items.map(item => this.createItemEl(this.getItemData(item.id), item.quantity)).join("")
  }

  createItemEl(itemData, quantity) {
    return `
      <div class="item" onclick="inventory.toggleItemModal(${itemData.id})">
        <img src="${itemData.image}" />
        ${quantity ? `<span>${quantity}</span>` : ""}
      </div>
    `;
  }

  createRarityLabel(rarity) {
    let label = "C";

    if (rarity >= 1000) label = "SSR"
    else if (rarity >= 500) label = "SR"
    else if (rarity >= 250) label = "R"
    else if (rarity >= 100) label = "UC"
    
    return `
      <span class="rarity-label ${label.toLowerCase()}">${label}</span>
    `
  }

  toggle(force) {
    this.element.classList.toggle("hidden", force != null ? !force : undefined);
    this.update();
  }

  addItem(itemId, quantity = 1) {
    const itemData = this.getItemData(itemId);
    if (!itemData) return;

    const existing = this.items.find((item) => item.id === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      if (this.items.length < this.maxSize) {
        this.items.push({ id: itemId, quantity });
      } else {
        console.log("Inventory is full!");
      }
    }
  }

  removeItem(itemId, quantity = 1) {
    const item = this.findItem(itemId);
    if (!item || quantity <= 0) return;
    
    if (quantity > item.quantity) quantity = item.quantity
    item.quantity -= quantity;

    if (item.quantity <= 0) this.items = this.items.filter((item) => item.id !== itemId);
  }

  toggleItemModal(itemId) {
    const itemData = this.getItemData(itemId);
    this.itemModal.classList.toggle("hidden", !itemData);
    if (!itemData) return;
    const item = this.findItem(itemId)

    const modalContent = this.itemModal.children[0];
    modalContent.innerHTML = `
      <div class="title">
        <img src="${itemData.image}" /> 
        <span>
          <span class="name truncated">${itemData.name}</span>
          ${item && item.quantity > 1 ? ` x${item.quantity}` : ""} 
        </span>
        ${this.createRarityLabel(itemData.rarity)}
      </div>
      <div class="description">${itemData.description}</div>
      <div class="actions">
        ${itemData.effect ? `<button onclick="inventory.useItem(${itemData.id})">Use</button>` : ""}
        <button onclick="inventory.sellItem(${itemData.id})">Sell</button>
      </div>
      <button class="close-btn" onclick="inventory.toggleItemModal()"><i class="bi bi-x-lg"></i></button>
    `;
  }

  useItem(itemId) {
    const itemData = this.getItemData(itemId);
    if (!itemData) return;

    this.removeItem(itemId);

    const rewards = [];
    if (itemData.effect === "rewards") {
      for (let i = 0; i < 3; i++) {
        const item = this.getRandomItem();
        this.addItem(item.id);
        rewards.push(item);
      }
    }

    this.toggleItemModal()
    this.toggleRewardModal(rewards);

    this.update()
  }

  getRandomItem() {
    const totalWeight = itemDB.reduce((sum, item) => sum + item.rarity, 0);
    const rand = Math.random() * totalWeight;
    let cumulative = 0;

    for (const item of itemDB) {
      cumulative += item.rarity;
      if (rand <= cumulative) {
        return item;
      }
    }
  }

  toggleRewardModal(items = []) {
    const hasRewards = items.length > 0
    this.rewardModal.classList.toggle("hidden", !hasRewards);
    if (!hasRewards) return;

    const modalContent = this.rewardModal.querySelector(".modal-content");
    modalContent.innerHTML = `
      <div class="title">You got</div>
      <div class="items items-container">${items.map(item => this.createItemEl(item, item.quantity)).join("")}</div>
      <div class="actions">
        <button onclick="inventory.toggleRewardModal()">Ok</button>   
      </div>
      <button class="close-btn" onclick="inventory.toggleRewardModal()"><i class="bi bi-x-lg"></i></button>   
    `;
  }

  sellItem(itemId) {
    const item = this.findItem(itemId)
    if (!item) return

    this.removeItem(itemId)
    const itemData = this.getItemData(itemId)
    const price = itemData.rarity * 2
    increaseBalance(price)

    this.toggleItemModal()

    this.update()
  }
}

// Register the element
customElements.define("my-inventory", Inventory);

// // Example usage:
// const playerInventory = new Inventory(10);
// playerInventory.addItem("Potion", 3);
// playerInventory.addItem("Sword", 1);
// playerInventory.removeItem("Potion", 1);
// playerInventory.listItems();
