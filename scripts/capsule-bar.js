const CapsuleBar = (() => {
  const element = document.querySelector(".capsule-bar");
  const panel = element.querySelector(".panel");

  let currentItems = [];

  let openedItems = [];
  let isPlaying = false;
  let totalRewards = 0;
  let isFinished = false;
  const isLost = () => openedItems.some((itemIndex) => currentItems[itemIndex] <= 0);

  function getItems() {
    const items = shuffle([...Array.from({ length: 8 }, () => getRandomNumber(1, 5)), 0]);
    return items;
  }

  function update() {
    panel.innerHTML = currentItems
      .map((item, i) => {
        const shouldDisplayLabel = (!isFinished || isLost()) && openedItems[openedItems.length - 1] === i;

        return `
        <div class="item" onclick="CapsuleBar.openItem(${i})" style="${!isPlaying ? "opacity: 0.5;" : ""}">
          ${
            openedItems.includes(i)
              ? `
            <img src="images/${item > 0 ? `gem-${item}.png` : "bomb.png"}" />
            <img src="images/capsule-opened.png" />
            ${shouldDisplayLabel ? `<span class="popup">x${item > 0 ? `${getMultiplier()}` : "0"}</span>` : ""}
            `
              : `
            <img src="images/capsule.png" />
            ${isFinished || isCheatEnabled ? `<img src="images/${item > 0 ? `gem-${item}.png` : "bomb.png"}" />` : ""}
            `
          }
        </div>
      `;
      })
      .join("");

    displayMessage();
    playBtn.innerHTML = isPlaying ? "End" : "Play";
  }

  function getMultiplier() {
    return 0.1 * 2 ** (openedItems.length - 1);
  }

  function handleTotalRewards() {
    if (openedItems.length <= 0 || isLost()) {
      totalRewards = 0;
      return;
    }
    totalRewards = currentBet * getMultiplier();
  }

  function openItem(index) {
    if (!isPlaying || openedItems.includes(index) || isFinished) return;

    openedItems.push(index);

    handleTotalRewards();

    if (currentItems[index] <= 0) {
      finalize();
      return;
    }

    if (openedItems.length >= currentItems.length) {
      finalize();
      return;
    }

    update();
  }

  function openRandomItem() {
    const unopenedItems = currentItems.map((item, i) => i).filter((item, i) => !openedItems.includes(i));
    const itemIndex = unopenedItems[Math.floor(Math.random() * unopenedItems.length)];

    openItem(itemIndex);
  }

  function play() {
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
    currentItems = getItems();
    openedItems = [];
    isPlaying = false;
    totalRewards = 0;
    isFinished = false;
    update();
  }

  function displayMessage() {
    let message = "GOOD LUCK";

    if (isLost()) {
      message = "GAME OVER";
    } else if (isPlaying && totalRewards > 0) {
      message = `Total rewards<br />$${totalRewards}`;
    } else if (isFinished) {
      message = `YOU WON $${totalRewards}`;
    }
    messageEl.innerHTML = message;
  }

  function finalize() {
    isPlaying = false;
    isFinished = true;

    if (!isLost()) {
      increaseBalance(totalRewards);
      launchConfetti();
    }

    update();
  }

  return { element, play, update, openItem, restart };
})();
