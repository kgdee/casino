const ScratchGame = (() => {
  const name = "SCRATCH";
  const image = "images/game-2.png";
  const element = document.querySelector(".scratch-game");
  let itemsEl = null;
  let multiplierEl = null;

  const effects = [{ name: "2", type: "multiplier", value: 2 }];

  let currentItems = [];
  let openedItems = [];
  let currentMatches = [];
  let isPlaying = false;
  let totalRewards = 0;
  let isFinished = false;
  let isLoading = false;
  const isLost = () => openedItems.some((itemIndex) => currentItems[itemIndex].type === "penalty");

  function getItems() {
    const items = shuffle([...Array.from({ length: 15 }, () => ({ type: "prize", effect: getEffect() })), { type: "penalty", effect: { name: "P" } }]);
    return items;
  }

  function getEffect() {
    const index = Math.floor(Math.random() * effects.length);
    const effect = effects[index];
    return effect;
  }

  function render() {
    element.innerHTML = `
      <div class="panel">
        <div class="multiplier flex-center"></div>
        <div class="items"></div>
      </div>
    `;

    itemsEl = element.querySelector(".items");
    multiplierEl = element.querySelector(".multiplier");
  }

  function displayItems() {
    itemsEl.innerHTML = currentItems.map((item) => createItemEl(item)).join("");
  }

  function update() {
    controlBar.playBtn.innerHTML = isPlaying ? "End" : "Play";
    multiplierEl.innerHTML = `${getTotalMultiplier()}x`;
  }

  function toggleCheat() {
    currentItems.forEach((item, i) => revealItem(i))
  }

  function createItemEl(item) {
    const index = currentItems.indexOf(item);
    const bonusItem = item.effect.type === "bonus" ? itemDB.getItem(item.effect.value) : null;
    const shouldReveal = openedItems.includes(index) ? "reveal" : ""

    return `
        <div class="item ${shouldReveal}" onclick="ScratchGame.openItem(${index})">
          ${bonusItem ? `<img src="${bonusItem.image}" />` : `<span class="flex-center">${item.effect.name}</span>`}
          <img class="tile-img" src="images/scratch-tile.png" />
          <img class="mark-img" src="images/scratch-mark.png" />
          <img class="anim-img" src="images/scratch.gif?id=${Math.random()}" />
        </div>
      `;
  }

  function getTotalMultiplier() {
    let multiplier = 0;
    if (!isLost() && openedItems.length > 0) {
      multiplier = currentMatches.reduce((sum, item) => (sum + item.effect.value), 0)
    }
    return multiplier;
  }

  function handleTotalRewards() {
    let rewards = 0
    if (openedItems.length > 0 && !isLost()) {
      const multiplier = getTotalMultiplier()
      rewards = currentBet * multiplier
    }

    totalRewards = rewards
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

    currentMatches = getMatches();
    console.log("matches: ", currentMatches);

    handleTotalRewards();

    isFinished = openedItems.length >= currentItems.length;

    if (isLost() || isFinished) {
      finalize();
    } else {
      controlBar.displayMessage(`Total rewards<br />$${totalRewards}`);
    }

    revealItem(index);
    update()
  }

  async function reveal() {
    isLoading = true;
    await sleep(3000);
    for (let i = 0; i < currentItems.length; i++) {
      if (openedItems.includes(i)) continue;

      revealItem(i, true);

      await sleep(500);
    }

    isLoading = false;
  }

  function revealItem(itemIndex, force) {
    const itemEl = itemsEl.children[itemIndex]
    itemEl.classList.toggle("reveal", force)
  }

  function play() {
    if (isLoading) return;

    if (isPlaying) {
      finalize();
      return;
    }

    if (isFinished) {
      restart();
      play();
      return;
    }

    const isPaid = pay(currentBet);
    if (!isPaid) return;

    isPlaying = true;
  }

  function restart() {
    if (isPlaying || isLoading) return;

    currentItems = getItems();

    openedItems = [];
    isPlaying = false;
    totalRewards = 0;
    isFinished = false;
    render();
    displayItems();
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

    reveal();
  }

  function getMatches() {
    const items = currentItems;
    const sizeX = 4;
    const sizeY = Math.floor(items.length / sizeX);
    const matchLength = 3;

    const directions = [
      [0, 1], // →
      [1, 0], // ↓
      [1, 1], // ↘
      [1, -1], // ↙
    ];

    const matches = [];

    function isMatchable(item, index) {
      return item?.effect?.type === "multiplier" && openedItems.includes(index);
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
          if (nItem.effect.name !== item.effect.name) break;

          chain.push([nx, ny]);
          nx += dx;
          ny += dy;
        }

        if (chain.length >= matchLength) {
          matches.push(item); // One representative per match
        }
      }
    }

    return matches;
  }

  return {
    name,
    image,
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
})();
