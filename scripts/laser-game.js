const LaserGame = (() => {
  const name = "LASER"
  const image = "images/game-1.png"
  const element = document.querySelector(".laser-game");
  const panel = element.querySelector(".panel");
  const arrow = element.querySelector(".arrow");
  const segmentsEl = element.querySelector(".segments");

  const boardHeight = 400;
  let items = shuffle([
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
  const animationTime = 5;

  let selectedItem = -1;

  function shuffleItems() {
    items = shuffle(items);
  }

  function getSegmentHeight(itemIndex) {
    const height = boardHeight / (totalSize / items[itemIndex].size);
    return parseFloat(height.toFixed(4));
  }

  function getSegmentPrize(itemIndex) {
    let prize = currentBet * items[itemIndex].multiplier;
    prize = Math.floor(prize);
    return prize;
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
  }

  async function play() {
    if (isPlaying) return;

    if (currentBalance < currentBet) {
      Toast.show("Not enough balance. Please top up to continue");
      return;
    }

    isPlaying = true;
    increaseBalance(-currentBet);
    const distance = Math.random() * boardHeight;

    selectedItem = selectItem(distance);
    moveArrow(distance);

    await sleep(1000 * animationTime);
    finalize();
  }

  function selectItem(distance) {
    let itemIndex = -1;
    let totalMove = 0;

    for (let i = 0; i < items.length; i++) {
      totalMove += getSegmentHeight(i);

      if (totalMove >= distance) {
        itemIndex = i;
        break;
      }
    }

    return itemIndex;
  }

  async function moveArrow(distance) {
    arrow.classList.remove("hidden");
    arrow.style.top = 0;
    arrow.style.transition = "none";

    await sleep(100);
    arrow.style.transition = `${animationTime}s ease-out`;
    arrow.style.top = `${distance}px`;
  }

  function finalize() {
    increaseBalance(getSegmentPrize(selectedItem));
    isPlaying = false;
    update();
    Popup.show(items[selectedItem].multiplier);
    displayMessage(`YOU WON $${getSegmentPrize(selectedItem)}`);
  }

  function restart() {
    if (isPlaying) return;
    selectedItem = -1;
    shuffleItems();
    update();
  }

  return { name, image, element, update, play, restart };
})();
