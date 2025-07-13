const CoinsGame = (() => {
  const name = "COINS"
  const image = "images/game-2.png"
  const element = document.querySelector(".coins-game");
  const panel = element.querySelector(".panel");
  const itemsEl = element.querySelector(".items");
  const multiplierEl = element.querySelector(".multiplier");

  let currentItems = [];
  let openedItems = [];
  let isPlaying = false;
  let totalRewards = 0;
  let isFinished = false;
  let isLoading = false;
  const isLost = () => openedItems.some((itemIndex) => currentItems[itemIndex] <= 0);

  function getItems() {
    const items = shuffle([...Array.from({ length: 8 }, () => getRandomNumber(1, 5)), 0]);
    return items;
  }

  function update() {
    itemsEl.innerHTML = currentItems
      .map((item, i) => {
        const shouldReveal = openedItems.includes(i) || isCheatEnabled;
        let icon = "chip-2.png";
        if (shouldReveal) icon = item === 0 ? "chip-skull.png" : "chip-dollar.png";

        return `
        <div data-index="${i}" class="item" onclick="CoinsGame.openItem(${i})">
          <img src="images/${icon}" />
        </div>
      `;
      })
      .join("");

    playBtn.innerHTML = isPlaying ? "End" : "Play";

    handleAnimation(openedItems[openedItems.length - 1]);
    multiplierEl.innerHTML = `${getMultiplier()}x`;
  }

  function handleAnimation(itemIndex) {
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
    if (!isPlaying) play();
    if (openedItems.includes(index) || isFinished) return;

    openedItems.push(index);

    handleTotalRewards();

    const isWin = openedItems.length >= currentItems.length;

    if (isLost() || isWin) {
      finalize();
    } else {
      update();
      displayMessage(`Total rewards<br />$${totalRewards}`);
    }
  }

  async function reveal() {
    isLoading = true;
    await sleep(3000)
    for (let i = 0; i < currentItems.length; i++) {
      if (openedItems.includes(i)) continue

      handleAnimation(i);

      await sleep(500)
    }

    isLoading = false
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

    if (currentBalance < currentBet) {
      Toast.show("Not enough balance. Please top up to continue");
      return;
    }

    restart();
    isPlaying = true;
    increaseBalance(-currentBet);
    update();
  }

  function restart() {
    if (isPlaying || isLoading) return;
    currentItems = getItems();
    openedItems = [];
    isPlaying = false;
    totalRewards = 0;
    isFinished = false;
    update();
  }

  function finalize() {
    isPlaying = false;
    isFinished = true;

    if (!isLost()) {
      increaseBalance(totalRewards);
      Popup.show(getMultiplier());
      displayMessage(`YOU WON $${totalRewards}`);
    } else {
      displayMessage("GAME OVER");
    }

    update();
    reveal();
  }

  return { name, image, element, play, update, openItem, restart };
})();
