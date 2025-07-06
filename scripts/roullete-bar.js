const RouletteBar = (() => {
  const element = document.querySelector(".roulette-bar");
  const panel = element.querySelector(".panel");
  const arrow = element.querySelector(".arrow");
  const segmentsEl = element.querySelector(".roulette-bar .segments");

  const boardHeight = 400;
  const items = shuffle([
    { multiplier: 0.05, size: 25 },
    { multiplier: 0.05, size: 15 },
    { multiplier: 0.1, size: 20 },
    { multiplier: 0.1, size: 10 },
    { multiplier: 0.2, size: 20 },
    { multiplier: 0.2, size: 10 },
    { multiplier: 2, size: 10 },
    { multiplier: 5, size: 10 },
  ]);

  const totalSize = items.reduce((sum, item) => sum + item.size, 0);

  let selectedItem = -1;

  function getSegmentHeight(itemIndex) {
    const height = boardHeight / (totalSize / items[itemIndex].size)
    return parseFloat(height.toFixed(4));
  }

  function getSegmentPrize(itemIndex) {
    return currentBet * items[itemIndex].multiplier
  }

  function update() {
    segmentsEl.style.height = `${boardHeight}px`;

    segmentsEl.innerHTML = items
      .map(
        (item, i) => `
          <div class="segment${i % 2 === 0 ? " light" : ""}" data-index="${i}" style="height: ${getSegmentHeight(i)}px;">
            <span>${item.multiplier}x</span>
          </div>
        `
      )
      .join("");

    messageEl.innerHTML = items[selectedItem] ? `YOU WON $${getSegmentPrize(selectedItem)}` : "GOOD LUCK";
    playBtn.disabled = isPlaying;
  }

  async function play() {
    if (isPlaying) return;

    if (currentBalance < currentBet) {
      Toast.show("Not enough balance. Please top up to continue");
      return;
    }

    isPlaying = true;

    increaseBalance(-currentBet);

    const targetHeight = Math.random() * boardHeight;

    selectedItem = -1;
    update();
    arrow.classList.remove("hidden");
    arrow.style.top = 0;
    arrow.style.transition = "none";

    const time = 5;
    let totalDistance = 0;

    for (let i = 0; i < items.length; i++) {
      totalDistance += getSegmentHeight(i);

      if (totalDistance >= targetHeight) {
        selectedItem = i;
        break;
      }
    }

    setTimeout(() => {
      arrow.style.transition = `${time}s ease-out`;
      arrow.style.top = `${targetHeight}px`;
    }, 100);

    await new Promise((resolve) => {
      setTimeout(() => {
        increaseBalance(getSegmentPrize(selectedItem));
        resolve();
      }, time * 1000);
    });

    isPlaying = false;
    update();
    launchConfetti();
  }

  function restart() {
    selectedItem = -1;
    update();
  }

  return { element, update, play, restart };
})();
