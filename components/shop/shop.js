class Shop extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.element = null;
    this.itemsContainer = null;
    this.countdown = null;

    this.initialItems = [
      { itemId: 32, quantity: 5, discount: 50, dailyLimit: 10 },
      { itemId: 35, quantity: 5, discount: 50, dailyLimit: 5 },
      { itemId: 1, quantity: 5, discount: 50, dailyLimit: 2 },
    ];
    this.items = [];
    this.purchases = load("purchases", []);

    this.ready = this.render();
    globalThis.shop = this;
  }

  async render() {
    const styleEls = await createStyleEls(["utils.css", "components/shop/shop.css"]);
    const html = await fetchText("components/shop/shop.html");
    this.shadowRoot.innerHTML = `
      ${styleEls}
      ${html}
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
    const hasItems = this.items.length > 0;
    this.items = this.getDailyItems();

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
    itemsEl.innerHTML = hasItems ? items.map((item) => this.createItemEl({ ...itemDB.getItem(item.itemId), ...item })).join("") : `<span class="message">No items</span>`;
  }

  createItemEl(item) {
    const { quantity = 1, discount, dailyLimit } = item;
    const purchase = this.getPurchase(item.id);

    const normalPrice = item.price * quantity;
    let buttonContent = `$${normalPrice}`;
    if (discount) {
      const discountPrice = normalPrice - normalPrice * (discount / 100);
      buttonContent = `<span>$${discountPrice}</span> <span>${normalPrice}</span>`;
    }

    return `
      <div class="item${discount ? " discount" : ""}" onclick="shop.buy(${item.id}, ${quantity})">
        <span class="name truncated">${item.name}</span>
        <div class="image">
          <img src="${item.image}" />
          ${quantity > 1 ? `<span class="quantity">x${quantity}</span>` : ""}
          ${discount ? `<div class="badge">-${discount}%</div>` : ""}
          </div>
        <div class="footer">
          ${dailyLimit ? `<span class="limit">Daily: ${purchase.count}/${dailyLimit}</span>` : ""}
          <button>${buttonContent}</button>
        </div>
      </div>
    `;
  }

  getDailyItems() {
    const today = getTodayDate();
    let dailyItems = load("dailyItems", {});
    if (dailyItems.date !== today) {
      const items = this.initialItems.concat(this.getItems());
      dailyItems = { date: today, items: items };
      save("dailyItems", dailyItems);
    }
    return dailyItems.items;
  }

  async buy(itemId, quantity) {
    const itemData = itemDB.getItem(itemId);
    if (!itemData) return;
    
    const isAccepted = await itemModal.toggle(itemData.id, { quantity: quantity, mode: "shop" });
    if (!isAccepted) return;
    
    const ispaid = pay(itemData.price * quantity);
    if (!ispaid) return;
    
    const item = this.items.find((item) => item.itemId === itemId);
    const withinLimit = this.handleLimit(item);
    if (!withinLimit) return;

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

  async refresh() {
    const isAccepted = await dialog.toggle({ title: "Refresh", message: "Are you sure you want to refresh?" });
    if (!isAccepted) return;
    const isPaid = pay(100);
    if (!isPaid) return;

    save("dailyItems", {});
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

  getItems() {
    let items = [];
    const start = Math.floor(Math.random() * 10);
    const end = start + 20;
    for (let i = start; i < end; i++) {
      let item = { itemId: itemDB.items[i].id, quantity: 1 };
      items.push(item);
    }
    items = shuffle(items);

    for (let i = 0; i < 4; i++) {
      items[i].discount = i <= 2 ? 10 : 5;
    }

    return items;
  }
}

customElements.define("my-shop", Shop);
