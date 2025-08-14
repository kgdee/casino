const Ticker = (() => {
  const element = document.querySelector(".ticker");
  let itemsEl = null;

  const items = [
    { game: 0, amount: "$32", user: "James" },
    { game: 1, amount: "$10", user: "Mary" },
    { game: 2, amount: "$201", user: "John" },
    { game: 3, amount: "$50", user: "Sarah" },
    { game: 0, amount: "$100", user: "Michael" },
    { game: 1, amount: "$29", user: "Emily" },
    { game: 2, amount: "$12", user: "David" },
    { game: 3, amount: "$85", user: "Jessica" },
  ];

  const max = 7;
  const rate = 1;
  const interval = 2;
  const itemWidth = 150;
  const gap = 10

  let currentItem = -1;

  function render() {
    element.innerHTML = `
      <div class="title flex-center">
        <span>NEWS</span>
      </div>
      <div class="items-outer">
        <div class="items"></div>
      </div>
    `;

    itemsEl = element.querySelector(".items");
    itemsEl.style.gap = `${gap}px`
  }

  async function start() {
    render();
    items.forEach((item) => addItemEl(item));

    update();
  }

  async function update() {
    currentItem = (currentItem + 1) % items.length;
    const item = items[currentItem];

    addItemEl(item);

    itemsEl.style.transition = `transform ${rate}s linear`;
    itemsEl.style.transform = `translateX(-${itemWidth + gap}px)`;

    await sleep(1000 * rate);

    itemsEl.style.transition = null;
    itemsEl.style.transform = null;

    if (itemsEl.children.length >= max) {
      itemsEl.children[0].remove();
    }

    await sleep(1000 * interval);
    update();
  }

  function addItemEl(item) {
    itemsEl.insertAdjacentHTML(
      "beforeend",
      `
      <div class="item" style="width: ${itemWidth}px;">
        <img src="${gameDetails[item.game].image}" />
        <div class="details">
          <span class="amount">${item.amount}</span>
          <span class="user">${item.user}</span>
          <span class="game">${gameDetails[item.game].name}</span>
        </div>
      </div>
    `
    );
  }

  return { start };
})();
