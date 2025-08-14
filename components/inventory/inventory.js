class Inventory extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.element = null;
    this.itemsContainer = null;

    this.items = load("inventoryItems", [{ id: 1, quantity: 50 }]);
    this.maxSize = 50;
    this.currentSize = 0;

    this.ready = this.render();
    globalThis.inventory = this;
  }

  async render() {
    const styleEls = await createStyleEls(["utils.css", "components/inventory/inventory.css"]);
    this.shadowRoot.innerHTML = `
      ${styleEls}
      <div class="inventory-modal modal hidden" onclick="inventory.toggle()">
        <div class="modal-content container">
          <span class="title">Inventory</span>
          <div class="slots items-container"></div>
          <div class="actions">
            <button onclick="inventory.sellItems()">Sell all</button>
            <button onclick="shop.toggle(true)">Shop</button>
          </div>
          <button class="close-btn icon-btn" onclick="inventory.toggle()"><i class="bi bi-x-lg"></i></button>
        </div>
      </div>
    `;

    this.element = this.shadowRoot.querySelector(".inventory-modal");
    this.itemsContainer = this.shadowRoot.querySelector(".items-container");
    this.shadowRoot.querySelectorAll(".modal > *").forEach((el) => el.addEventListener("click", (event) => event.stopPropagation()));
  }

  findItem(itemId) {
    return this.items.find((item) => item.id === itemId);
  }

  update() {
    const hasItems = this.items.length > 0;
    this.itemsContainer.innerHTML = hasItems ? this.createItemEls() : `<span class="message">Your inventory is currently empty</span>`;
    this.itemsContainer.style.flex = hasItems ? null : "1";
  }

  getItemsMap() {
    return Object.fromEntries(this.items.map(item => [item.id, item]));
  }

  createItemEls() {
    let itemsMap = this.getItemsMap()
    const itemIds = this.items.map(item => item.id)
    let items = itemDB.getItems(itemIds);
    items = items.map((item) => ({
      ...item,
      ...itemsMap[item.id],
    }));
    items.sort((a, b) => a.name.localeCompare(b.name));

    const itemsEls = items
      .map(
        (item) => `
      <div class="item" onclick="itemModal.toggle(${item.id}, { quantity: ${item.quantity}, mode: 'manage' })">
        <img src="${item.image}" />
        ${item.quantity ? `<span>${item.quantity}</span>` : ""}
      </div>
    `
      )
      .join("");

    return itemsEls;
  }

  toggle(force) {
    this.element.classList.toggle("hidden", force != null ? !force : undefined);
    this.update();
    handleModalLayer(this.element);
  }

  addItem(itemId, quantity = 1) {
    const itemData = itemDB.getItem(itemId);
    if (!itemData) return;

    const existing = this.items.find((item) => item.id === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      if (this.items.length < this.maxSize) {
        this.items.push({ id: itemId, quantity });
      } else {
        toast.show("Inventory is full!");
        return;
      }
    }
    save("inventoryItems", this.items);
  }

  removeItem(itemId, quantity = 1) {
    const item = this.findItem(itemId);
    if (!item || quantity <= 0) return;

    if (quantity > item.quantity) quantity = item.quantity;
    item.quantity -= quantity;
    if (item.quantity <= 0) this.items = this.items.filter((item) => item.id !== itemId);

    save("inventoryItems", this.items);
  }

  useItem(itemId) {
    const itemData = itemDB.getItem(itemId);
    if (!itemData) return;

    this.removeItem(itemId);

    let rewards = [];
    if (itemData.effect === "loot") {
      if (!itemData.items) {
        for (let i = 0; i < 3; i++) {
          const item = itemDB.pullGacha();
          this.addItem(item.id);
          rewards.push(item);
        }
      } else {
        const item = itemDB.selectItem(itemData.items);
        this.addItem(item.id);
        rewards = [item];
      }
    }

    itemModal.toggle();
    rewardModal.toggle(rewards);

    this.update();
  }

  sellItem(itemId, quantity = 1) {
    const item = this.findItem(itemId);
    if (!item) return;

    this.removeItem(itemId, quantity);
    const itemData = itemDB.getItem(itemId);
    increaseBalance(itemData.price * quantity);

    itemModal.toggle();

    this.update();
  }

  async sellItems() {
    if (this.items.length <= 0) return;
    const isAccepted = await dialog.toggle({ title: "Sell all items", message: "Are you sure you want to sell all items?" });
    if (!isAccepted) return;

    this.items.forEach((item) => this.sellItem(item.id, item.quantity));
  }
}

customElements.define("my-inventory", Inventory);
