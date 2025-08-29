const ScratchGame = (parentEl) => {
  parentEl.insertAdjacentHTML("afterbegin", `<div class="scratch-game"></div>`);
  const element = parentEl.querySelector(".scratch-game");
  let slotsEl = null;
  let multiplierEl = null;

  const initialPrizes = [
    { name: "2", type: "multiplier", value: 2 },
    { name: "5", type: "multiplier", value: 5 },
    { name: "7", type: "multiplier", value: 7, image: "images/7.png" },
  ];
  let currentPrizes = [];
  let revealedSlots = [];
  let currentMatches = [];
  let isPlaying = false;
  let totalRewards = 0;
  let isFinished = false;
  let isLoading = false;
  const isLost = () => revealedSlots.some((prizeIndex) => currentPrizes[prizeIndex].type === "penalty");

  function setupPrizes() {
    let prizes = initialPrizes;
    prizes = Array.from({ length: 15 }, () => getArrayItem(prizes));

    prizes = prizes.concat([
      { type: "penalty", image: "images/bomb.png" },
      { type: "bonus", value: 32 },
      { type: "bonus", value: 35 },
      { type: "bonus", value: itemDB.getItemByRarity([50, 500]).id },
      { type: "bonus", value: itemDB.getItemByRarity([50, 500]).id },
    ]);

    currentPrizes = shuffle(prizes);
  }

  async function render() {
    const styleEls = await createStyleEls(["utils.css", "games/scratch-game/scratch-game.css"]);
    element.innerHTML = `
      ${styleEls}
      <div class="panel">
        <div class="title">
          <img src="images/scratch-logo.png" />
          <span>MATCH NUMBERS TO WIN</span>
        </div>
        <div class="brand sticker">
          <img src="images/logo.png" />
        </div>
        <div class="multiplier sticker flex-center"></div>
        <div class="scratchables"></div>
      </div>
    `;

    slotsEl = element.querySelector(".scratchables");
    slotsEl.style = "grid-template-columns: repeat(5, 50px);";
    multiplierEl = element.querySelector(".multiplier");
  }

  function displaySlots() {
    slotsEl.innerHTML = currentPrizes.map((prize, i) => createSlotEl(prize, i)).join("");
  }

  function update() {
    Array.from(slotsEl.children).forEach((el, i) => {
      const matched = currentMatches.some((match) => match.includes(i));
      const revealed = revealedSlots.includes(i);

      el.classList.toggle("revealed", revealed);
      el.classList.toggle("matched", matched);
    });

    controlBar.updatePlayBtn();
    multiplierEl.innerHTML = `${getTotalMultiplier()}x`;
  }

  function toggleCheat() {
    currentPrizes.forEach((prize, i) => toggleSlot(i, isCheatEnabled));
  }

  function createSlotEl(prize, index) {
    const shouldReveal = revealedSlots.includes(index);
    let content = "";

    if (prize.type === "bonus") {
      const bonusItem = itemDB.getItem(prize.value);
      content = `<img class="content center" src="${bonusItem.image}" />`;
    } else if (prize.image) {
      content = `<img class="content center" src="${prize.image}" />`;
    } else {
      content = `<span class="content flex-center center">${prize.name}</span>`;
    }

    return `
        <div class="scratchable ${shouldReveal ? "reveal" : ""}" onclick="currentGame.revealSlot(${index})">
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
    if (!isLost() && revealedSlots.length > 0) {
      const prizes = getPrizesByMatches();
      multiplier = prizes.reduce((sum, item) => sum + item.value, 0);
    }
    return multiplier;
  }

  function handleTotalRewards() {
    let rewards = 0;
    if (revealedSlots.length > 0 && !isLost()) {
      const multiplier = getTotalMultiplier();
      rewards = currentBet * multiplier;
    }

    totalRewards = rewards;
  }

  async function revealSlot(index) {
    if (isLoading) return;
    if (isFinished) {
      restart();
      return;
    }
    if (!isPlaying) play();

    if (revealedSlots.includes(index)) return;

    revealedSlots.push(index);

    handleMatches();
    handleTotalRewards();

    isFinished = revealedSlots.length >= currentPrizes.length;

    if (isLost() || isFinished) {
      finalize();
    } else {
      const prize = currentPrizes[index];
      if (prize.type === "bonus") giveReward(prize);
    }

    update();
  }

  async function revealAll() {
    isLoading = true;
    await sleep(3000);
    for (let i = 0; i < currentPrizes.length; i++) {
      if (revealedSlots.includes(i)) continue;

      toggleSlot(i, true);

      await sleep(250);
    }

    isLoading = false;
  }

  function toggleSlot(index, force) {
    force = force || revealedSlots.includes(index);

    const slotEl = slotsEl.children[index];
    slotEl.classList.toggle("revealed", force);
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
    update();
  }

  async function restart() {
    if (isPlaying || isLoading) return;

    setupPrizes();

    revealedSlots = [];
    currentMatches = [];
    isPlaying = false;
    totalRewards = 0;
    isFinished = false;

    await render();
    displaySlots();
    update();
  }

  function finalize() {
    isPlaying = false;
    isFinished = true;

    if (!isLost()) {
      increaseBalance(totalRewards);
      popupBanner.show(getTotalMultiplier());
      controlBar.displayMessage(`YOU WON $${totalRewards}`);
    } else {
      controlBar.displayMessage("GAME OVER");
    }

    update();
    revealAll();
  }

  function handleMatches() {
    const prizes = currentPrizes;
    const sizeX = 5;
    const sizeY = Math.floor(prizes.length / sizeX);
    const matchLength = 3;

    const directions = [
      [0, 1], // →
      [1, 0], // ↓
      [1, 1], // ↘
      [1, -1], // ↙
    ];

    const matches = []; // store groups of matching indexes

    function isMatchable(prize, slotIndex) {
      return prize?.type === "multiplier" && revealedSlots.includes(slotIndex);
    }

    for (let i = 0; i < prizes.length; i++) {
      const y = Math.floor(i / sizeX);
      const x = i % sizeX;
      const prize = prizes[i];
      if (!isMatchable(prize, i)) continue;

      for (let [dy, dx] of directions) {
        const chain = [[x, y]];
        let nx = x + dx;
        let ny = y + dy;

        while (nx >= 0 && nx < sizeX && ny >= 0 && ny < sizeY) {
          const nIndex = ny * sizeX + nx;
          const nPrize = prizes[nIndex];
          if (!isMatchable(nPrize, nIndex)) break;
          if (nPrize.name !== prize.name) break;

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

  function getPrizesByMatches() {
    const prizes = currentMatches.map((match) => currentPrizes[match[0]]); // One representative per match
    return prizes;
  }

  return {
    element,
    get isPlaying() {
      return isPlaying;
    },
    play,
    displaySlots,
    update,
    toggleCheat,
    revealSlot,
    restart,
  };
};
