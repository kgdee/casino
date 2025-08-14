const ScratchGame = () => {
  const element = document.querySelector(".scratch-game");
  let itemsEl = null;
  let multiplierEl = null;

  const initialItems = [
    { name: "2", type: "multiplier", value: 2 },
    { name: "5", type: "multiplier", value: 5 },
    { name: "7", type: "multiplier", value: 7, image: "images/7.png" },
  ];
  let currentItems = [];
  let openedItems = [];
  let currentMatches = [];
  let isPlaying = false;
  let totalRewards = 0;
  let isFinished = false;
  let isLoading = false;
  const isLost = () => openedItems.some((itemIndex) => currentItems[itemIndex].type === "penalty");

  function setupItems() {
    let items = initialItems;
    items = Array.from({ length: 15 }, () => getArrayItem(items));

    items = items.concat([
      { type: "penalty", image: "images/bomb.png" },
      { type: "bonus", value: 32 },
      { type: "bonus", value: 35 },
      { type: "bonus", value: itemDB.getItemByRarity([50, 500]).id },
      { type: "bonus", value: itemDB.getItemByRarity([50, 500]).id },
    ]);

    currentItems = shuffle(items);
  }

  function render() {
    element.innerHTML = `
      <div class="panel">
        <div class="title">
          <img src="images/scratch-logo.png" />
          <span>MATCH NUMBERS TO WIN</span>
        </div>
        <div class="brand sticker">
          <img src="images/logo.png" />
        </div>
        <div class="multiplier sticker flex-center"></div>
        <div class="items"></div>
      </div>
    `;

    itemsEl = element.querySelector(".items");
    itemsEl.style = "grid-template-columns: repeat(5, 50px);";
    multiplierEl = element.querySelector(".multiplier");
  }

  function displayItems() {
    itemsEl.innerHTML = currentItems.map((item, i) => createItemEl(item, i)).join("");
  }

  function update() {
    Array.from(itemsEl.children).forEach((el, i) => {
      const matched = currentMatches.some((match) => match.includes(i));
      const revealed = openedItems.includes(i);

      el.classList.toggle("revealed", revealed);
      el.classList.toggle("matched", matched);
    });

    controlBar.playBtn.innerHTML = isPlaying ? "End" : "Play";
    multiplierEl.innerHTML = `${getTotalMultiplier()}x`;
  }

  function toggleCheat() {
    currentItems.forEach((item, i) => revealItem(i, isCheatEnabled));
  }

  function createItemEl(item, index) {
    const shouldReveal = openedItems.includes(index);
    let content = "";

    if (item.type === "bonus") {
      const bonusItem = itemDB.getItem(item.value);
      content = `<img class="content center" src="${bonusItem.image}" />`;
    } else if (item.image) {
      content = `<img class="content center" src="${item.image}" />`;
    } else {
      content = `<span class="content flex-center center">${item.name}</span>`;
    }

    return `
        <div class="item ${shouldReveal ? "reveal" : ""}" onclick="ScratchGame.openItem(${index})">
        ${content}
        <div class="coat flex-center">
          <img src="images/scratch-coat.png" />
        </div>
        <div class="mark"></div>
        </div>
      `;
  }

  function getTotalMultiplier() {
    let multiplier = 0;
    if (!isLost() && openedItems.length > 0) {
      const items = getItemsByMatches();
      multiplier = items.reduce((sum, item) => sum + item.value, 0);
    }
    return multiplier;
  }

  function handleTotalRewards() {
    let rewards = 0;
    if (openedItems.length > 0 && !isLost()) {
      const multiplier = getTotalMultiplier();
      rewards = currentBet * multiplier;
    }

    totalRewards = rewards;
  }

  async function openItem(index) {
    if (isLoading) return;
    if (isFinished) {
      restart();
      return;
    }
    if (!isPlaying) play();

    if (openedItems.includes(index)) return;

    openedItems.push(index);

    handleMatches();
    handleTotalRewards();

    isFinished = openedItems.length >= currentItems.length;

    if (isLost() || isFinished) {
      finalize();
    } else {
      const item = currentItems[index]
      if (item.type === "bonus") getBonus(item.value)
      controlBar.displayMessage(`Total rewards<br />$${totalRewards}`);
    }

    update();
  }

  async function reveal() {
    isLoading = true;
    await sleep(3000);
    for (let i = 0; i < currentItems.length; i++) {
      if (openedItems.includes(i)) continue;

      revealItem(i, true);

      await sleep(250);
    }

    isLoading = false;
  }

  function revealItem(itemIndex, force) {
    force = force || openedItems.includes(itemIndex);

    const itemEl = itemsEl.children[itemIndex];
    itemEl.classList.toggle("revealed", force);
  }

  function play() {
    if (isLoading) return;

    if (isPlaying) {
      finalize();
      return;
    }

    if (isFinished) {
      restart();
      return;
    }

    const isPaid = pay(currentBet);
    if (!isPaid) return;

    isPlaying = true;
    update()
  }

  function restart() {
    if (isPlaying || isLoading) return;

    setupItems();

    openedItems = [];
    currentMatches = [];
    isPlaying = false;
    totalRewards = 0;
    isFinished = false;
    
    render();
    displayItems();
    update()
  }

  function finalize() {
    isPlaying = false;
    isFinished = true;

    if (!isLost()) {
      increaseBalance(totalRewards);
      Popup.show(getTotalMultiplier());
      controlBar.displayMessage(`YOU WON $${totalRewards}`);
    } else {
      controlBar.displayMessage("GAME OVER");
    }

    update();
    reveal();
  }

  function handleMatches() {
    const items = currentItems;
    const sizeX = 5;
    const sizeY = Math.floor(items.length / sizeX);
    const matchLength = 3;

    const directions = [
      [0, 1], // →
      [1, 0], // ↓
      [1, 1], // ↘
      [1, -1], // ↙
    ];

    const matches = []; // store groups of matching indexes

    function isMatchable(item, index) {
      return item?.type === "multiplier" && openedItems.includes(index);
    }

    for (let i = 0; i < items.length; i++) {
      const y = Math.floor(i / sizeX);
      const x = i % sizeX;
      const item = items[i];
      if (!isMatchable(item, i)) continue;

      for (let [dy, dx] of directions) {
        const chain = [[x, y]];
        let nx = x + dx;
        let ny = y + dy;

        while (nx >= 0 && nx < sizeX && ny >= 0 && ny < sizeY) {
          const nIndex = ny * sizeX + nx;
          const nItem = items[nIndex];
          if (!isMatchable(nItem, nIndex)) break;
          if (nItem.name !== item.name) break;

          chain.push([nx, ny]);
          nx += dx;
          ny += dy;
        }

        if (chain.length >= matchLength) {
          const match = chain.map(([cx, cy]) => cy * sizeX + cx);
          matches.push(match); // collect group of matching indexes
        }
      }
    }

    currentMatches = matches;
  }

  function getItemsByMatches() {
    const items = currentMatches.map((match) => currentItems[match[0]]); // One representative per match
    return items;
  }

  return {
    element,
    get isPlaying() {
      return isPlaying;
    },
    play,
    displayItems,
    update,
    toggleCheat,
    openItem,
    restart,
  };
}
