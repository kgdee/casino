class Shop extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.element = null;
    this.itemsContainer = null;

    this.items = [
      { id: 32, quantity: 5, discount: 50, limit: 20 },
      { id: 35, quantity: 5, discount: 50, limit: 20 },
      { id: 1, quantity: 5, discount: 50, limit: 20 },
      { id: 5, quantity: 10, discount: 10 },
      { id: 16, quantity: 1 },
      { id: 20, quantity: 10 },
      { id: 22, quantity: 1 },
    ];

    this.render();
    globalThis.shop = this;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="components/shop/shop.css" />
      <div class="shop-modal modal hidden" onclick="shop.toggle()">
        <div class="modal-content container">
          <span class="title">Shop</span>
          <div class="items-container"></div>
          <div class="actions">
            <button onclick="inventory.toggle(true)">Inventory</button>
          </div>
          <button class="close-btn" onclick="shop.toggle()"><i class="bi bi-x-lg"></i></button>
        </div>
      </div>
    `;

    this.element = this.shadowRoot.querySelector(".shop-modal");
    this.itemsContainer = this.shadowRoot.querySelector(".items-container");
    this.shadowRoot.querySelectorAll(".modal > *").forEach((el) => el.addEventListener("click", (event) => event.stopPropagation()));
  }

  toggle(force) {
    this.element.classList.toggle("hidden", force != null ? !force : undefined);
    this.update();
    handleModalLayer(this.element)
  }

  update() {
    const hasItems = this.items.length > 0;
    this.itemsContainer.innerHTML = hasItems ? this.items.map((item) => this.createItemEl(itemDB.getItemData(item.id), { ...item })).join("") : `<span class="message">No items</span>`;
    this.itemsContainer.style.flex = hasItems ? null : "1";
  }

  createItemEl(itemData, { quantity = 1, discount = null, limit = null } = {}) {
    return `
      <div class="item" onclick="shop.buy(${itemData.id}, ${quantity})">
        <span class="name truncated">${itemData.name}</span>
        <div class="image">
          <img src="${itemData.image}" />
          ${quantity > 1 ? `<span class="quantity">x${quantity}</span>` : ""}
          ${discount ? `<div class="badge">${discount}%</div>` : ""}
          </div>
        <div class="bottom-part">
          ${limit ? `<span class="limit">Limit: 18/${limit}</span>` : ""}
          <button>$${itemData.price * quantity}</button>
        </div>
      </div>
    `;
  }

  async buy(itemId, quantity) {
    const itemData = itemDB.getItemData(itemId)
    if (!itemData) return
    const isAccepted = await itemModal.toggle(itemData.id, { quantity: quantity, mode: "shop" })

    if (!isAccepted) return

    const ispaid = pay(itemData.price * quantity)
    if (!ispaid) return

    inventory.addItem(itemId, quantity)
    rewardModal.toggle([{ ...itemData, quantity }])
  }
}

customElements.define("my-shop", Shop);
