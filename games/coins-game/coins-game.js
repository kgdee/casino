const CoinsGame = (parentEl) => {
  parentEl.insertAdjacentHTML("afterbegin", `<div class="coins-game"></div>`)
  const element = parentEl.querySelector(".coins-game");
  let itemsEl = null;
  let multiplierEl = null;

  let currentItems = [];
  let openedItems = [];
  let isPlaying = false;
  let totalRewards = 0;
  let isFinished = false;
  let isLoading = false;
  const isLost = () => openedItems.some((itemIndex) => currentItems[itemIndex] <= 0);

  function getItems() {
    const items = shuffle([...Array.from({ length: 8 }, () => randomInt(1, 5)), 0]);
    return items;
  }

  async function render() {
    const styleEls = await createStyleEls(["utils.css", "games/coins-game/coins-game.css"]);
    element.innerHTML = `
      ${styleEls}
      <div class="panel">
        <div class="multiplier flex-center"></div>
        <div class="items"></div>
      </div>
    `;

    itemsEl = element.querySelector(".items");
    multiplierEl = element.querySelector(".multiplier");
  }

  function update() {
    itemsEl.innerHTML = currentItems
      .map((item, i) => {
        const shouldReveal = openedItems.includes(i) || isCheatEnabled;
        let icon = "chip-2.png";
        if (shouldReveal) icon = item === 0 ? "chip-skull.png" : "chip-dollar.png";

        return `
        <div data-index="${i}" class="item" onclick="currentGame.openItem(${i})">
          <img src="images/${icon}" />
        </div>
      `;
      })
      .join("");

    controlBar.playBtn.innerHTML = isPlaying ? "End" : "Play";
    multiplierEl.innerHTML = `${getMultiplier()}x`;
  }

  function animateItem(itemIndex) {
    const item = currentItems[itemIndex];
    if (item == null) return;
    const itemEl = itemsEl.querySelector(`.item[data-index="${itemIndex}"]`);
    let icon = `chip-${item === 0 ? "skull" : "dollar"}-animation.gif?t=${new Date().getTime()}`;

    itemEl.innerHTML = `<img src="images/${icon}" />`;
  }

  function getMultiplier() {
    let multiplier = 0;
    if (!isLost() && openedItems.length > 0) multiplier = 0.1 * 2 ** (openedItems.length - 1);
    return multiplier;
  }

  function handleTotalRewards() {
    if (openedItems.length <= 0 || isLost()) {
      totalRewards = 0;
      return;
    }
    totalRewards = currentBet * getMultiplier();
  }

  function openItem(index) {
    if (isLoading) return;
    if (isFinished) {
      restart();
      return;
    }
    if (!isPlaying) play();

    if (openedItems.includes(index)) return;

    openedItems.push(index);

    handleTotalRewards();

    const isWin = openedItems.length >= currentItems.length;

    if (isLost() || isWin) {
      finalize();
    } else {
      update();
      controlBar.displayMessage(`Total rewards<br />$${totalRewards}`);
    }

    animateItem(index);
  }

  async function reveal() {
    isLoading = true;
    await sleep(3000);
    for (let i = 0; i < currentItems.length; i++) {
      if (openedItems.includes(i)) continue;

      animateItem(i);

      await sleep(500);
    }

    isLoading = false;
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

    restart();
    isPlaying = true;

    update();
  }

  async function restart() {
    if (isPlaying || isLoading) return;
    currentItems = getItems();
    openedItems = [];
    isPlaying = false;
    totalRewards = 0;
    isFinished = false;
    await render()
    update();
  }

  function finalize() {
    isPlaying = false;
    isFinished = true;

    if (!isLost()) {
      increaseBalance(totalRewards);
      popupBanner.show(getMultiplier());
      controlBar.displayMessage(`YOU WON $${totalRewards}`);
    } else {
      controlBar.displayMessage("GAME OVER");
    }

    update();
    reveal();
  }

  return {
    element,
    get isPlaying() {
      return isPlaying;
    },
    play,
    update,
    openItem,
    restart,
  };
}
