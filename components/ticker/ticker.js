const Ticker = (() => {
  const element = document.querySelector(".ticker");
  const itemsEl = element.querySelector(".items")

  const items = [
    { game: 0, amount: "$32", user: "Ste***" },
    { game: 1, amount: "$10", user: "Mar***" },
    { game: 2, amount: "$201", user: "Arc***" },
    { game: 3, amount: "$50", user: "Wel***" },
    { game: 0, amount: "$100", user: "Cla***" },
    { game: 1, amount: "$29", user: "Fir***" },
    { game: 2, amount: "$12", user: "Gep***" },
    { game: 3, amount: "$85", user: "Bla***" },
  ];

  const max = 7;
  const interval = 5;

  let currentItem = -1;

  async function start() {
    items.forEach(item => addItemEl(item))

    update();
  }

  async function update() {
    if (itemsEl.children.length >= max) {
      itemsEl.children[0].remove();
    }

    currentItem = (currentItem + 1) % items.length;
    const item = items[currentItem];

    addItemEl(item)

    await sleep(1000 * interval);

    update();
  }

  function addItemEl(item) {
    itemsEl.innerHTML += `
      <div class="item">
        <img src="${games[item.game].image}" />
        <div class="details">
          <span class="amount">${item.amount}</span>
          <span class="user">${item.user}</span>
          <span class="game">${games[item.game].name}</span>
        </div>
      </div>
      `;
  }

  return { start };
})();
