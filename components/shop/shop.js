class Shop extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.element = null;
    this.itemsContainer = null;
    this.countdown = null;

    this.items = [
      { itemId: 32, quantity: 5, discount: 50, dailyLimit: 10 },
      { itemId: 35, quantity: 5, discount: 50, dailyLimit: 5 },
      { itemId: 1, quantity: 5, discount: 50, dailyLimit: 2 },
    ];

    this.dailyData = load("shopDailyData", {});
    this.purchases = load("purchases", []);

    this.render();
    globalThis.shop = this;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="utils.css" />
      <link rel="stylesheet" href="components/shop/shop.css" />
      <div class="shop-modal modal hidden" onclick="shop.toggle()">
        <div class="modal-content container">
          <span class="title">Shop <span class="countdown"></span></span>
          <div class="content">
            <my-slideshow images="banner-4.jpg banner-5.jpg banner-6.jpg"></my-slideshow>
            <div data-menu="1" class="menu">
              <span class="title">Today’s Top Deals</span>
              <div class="items-container"></div>
            </div>
            <div data-menu="2" class="menu">
              <span class="title">Daily Picks</span>
              <div class="items-container"></div>
            </div>
          </div>
          <div class="actions">
            <button onclick="shop.resetLimit()">Force refresh</button>
            <button onclick="inventory.toggle(true)">Inventory</button>
          </div>
          <button class="close-btn" onclick="shop.toggle()"><i class="bi bi-x-lg"></i></button>
        </div>
      </div>
    `;

    this.element = this.shadowRoot.querySelector(".shop-modal");
    this.itemsContainers = this.element.querySelectorAll(".items-container");
    this.countdown = this.element.querySelector(".countdown");
    this.shadowRoot.querySelectorAll(".modal > *").forEach((el) => el.addEventListener("click", (event) => event.stopPropagation()));
    this.updateCountdown();
  }

  toggle(force) {
    this.element.classList.toggle("hidden", force != null ? !force : undefined);
    this.update();
    handleModalLayer(this.element);
  }

  update() {
    this.items = this.getTodayItems();
    const hasItems = this.items.length > 0;
    this.displayItems(
      this.itemsContainers[0],
      this.items.filter((item) => item.discount != null).sort((a, b) => b.discount - a.discount)
    );
    this.displayItems(
      this.itemsContainers[1],
      this.items.filter((item) => item.discount == null)
    );
    this.itemsContainers[0].style.flex = hasItems ? null : "1";
  }

  displayItems(itemsEl, items) {
    const hasItems = this.items.length > 0;
    itemsEl.innerHTML = hasItems ? items.map((item) => this.createItemEl(itemDB.getItemData(item.itemId), { ...item })).join("") : `<span class="message">No items</span>`;
  }

  createItemEl(itemData, { quantity = 1, discount, dailyLimit } = {}) {
    const purchase = this.purchases.find((p) => p.itemId === itemData.id);
    const purchasedCount = purchase?.count || 0;
    
    const normalPrice = itemData.price * quantity;
    let buttonContent = `$${normalPrice}`;
    if (discount) {
      const discountPrice = normalPrice - normalPrice * (discount / 100);
      buttonContent = `<span>$${discountPrice}</span> <span>${normalPrice}</span>`;
    }

    return `
      <div class="item${discount ? " discount" : ""}" onclick="shop.buy(${itemData.id}, ${quantity})">
        <span class="name truncated">${itemData.name}</span>
        <div class="image">
          <img src="${itemData.image}" />
          ${quantity > 1 ? `<span class="quantity">x${quantity}</span>` : ""}
          ${discount ? `<div class="badge">${discount}%</div>` : ""}
          </div>
        <div class="footer">
          ${dailyLimit ? `<span class="limit">Daily: ${purchasedCount}/${dailyLimit}</span>` : ""}
          <button>${buttonContent}</button>
        </div>
      </div>
    `;
  }

  getTodayItems() {
    const today = getTodayDate();
    if (this.dailyData.date !== today) {
      this.addMoreItems();
      this.dailyData = { date: today, items: this.items };
      save("shopDailyData", this.dailyData);
    }
    return this.dailyData.items;
  }

  async buy(itemId, quantity) {
    const itemData = itemDB.getItemData(itemId);
    if (!itemData) return;
    const isAccepted = await itemModal.toggle(itemData.id, { quantity: quantity, mode: "shop" });
    if (!isAccepted) return;
    const item = this.items.find((item) => item.itemId === itemId);

    const withinLimit = this.handleLimit(item);
    if (!withinLimit) return;

    const ispaid = pay(itemData.price * quantity);
    if (!ispaid) return;

    inventory.addItem(itemId, quantity);

    this.update();
    rewardModal.toggle([{ ...itemData, quantity }]);
  }

  handleLimit(item) {
    let purchase = this.getPurchase(item.itemId);
    if (purchase.count >= item.dailyLimit) {
      toast.show("You've reached the purchase limit for this item.");
      return false;
    }

    purchase.count++;
    this.savePurchase(purchase);

    return true;
  }

  getPurchase(itemId) {
    const today = getTodayDate();
    let purchase = this.purchases.find((p) => p.itemId === itemId);
    if (!purchase || purchase.date !== today) purchase = { itemId: itemId, date: today, count: 0 };
    return purchase;
  }

  savePurchase(purchase) {
    const index = this.purchases.findIndex((p) => p.itemId === purchase.itemId);
    index !== -1 ? (this.purchases[index] = purchase) : this.purchases.push(purchase);
    save("purchases", this.purchases);
  }

  async resetLimit() {
    const isAccepted = await dialog.toggle({ title: "Force refresh", message: "Are you sure you want to force refresh?" });
    if (!isAccepted) return;
    save("purchases", []);
    this.purchases = [];
    this.update();
  }

  async updateCountdown() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0); // midnight of next day
    const diff = tomorrow - now;
    this.countdown.innerHTML = `<span class="countdown">Refresh in (${formatTime(diff)})</span>`;

    await sleep(1000);
    this.updateCountdown();
  }

  addMoreItems() {
    let items = [];
    const start = Math.floor(Math.random() * 10);
    const end = start + 20;
    for (let i = start; i < end; i++) {
      let item = { itemId: itemDB.items[i].id, quantity: 1 };
      if (i < start + 2) item.discount = 10;
      else if (i < start + 4) item.discount = 5;
      items.push(item);
    }
    items = shuffle(items);

    this.items = this.items.concat(items);
  }
}

customElements.define("my-shop", Shop);
