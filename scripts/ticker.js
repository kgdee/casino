const Ticker = (() => {
  const element = document.querySelector(".ticker");

  const items = [
    { game: 0, amount: "$32", user: "Rui***" },
    { game: 1, amount: "$10", user: "Rui***" },
    { game: 2, amount: "$201", user: "Ene***" },
    { game: 0, amount: "$50", user: "Sto***" },
    { game: 1, amount: "$100", user: "Mos***" },
    { game: 2, amount: "$29", user: "Kii***" },
  ];

  const max = 7;

  let currentItem = -1;

  async function start() {
    items.forEach(item => addItemEl(item))

    update();
  }

  async function update() {
    if (element.children.length >= max) {
      element.children[0].remove();
    }

    currentItem = (currentItem + 1) % items.length;
    const item = items[currentItem];

    addItemEl(item)

    await sleep(5000);

    update();
  }

  function addItemEl(item) {
    element.innerHTML += `
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
