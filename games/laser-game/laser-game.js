const LaserGame = (parentEl) => {
  parentEl.insertAdjacentHTML("afterbegin", `<div class="laser-game"></div>`)
  const element = parentEl.querySelector(".laser-game");
  let arrow = null;
  let segmentsEl = null;

  const boardHeight = 300;
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

  async function render() {
    const styleEls = await createStyleEls(["utils.css", "games/laser-game/laser-game.css"]);
    element.innerHTML = `
      ${styleEls}
      <div class="panel">
        <div class="arrow flexbox">
          <div class="line"></div>
          <img src="images/diamond-2.png" class="left" />
          <img src="images/diamond-2.png" class="right" />
        </div>
        <div class="segments"></div>
      </div>
    `;
    arrow = element.querySelector(".arrow");
    segmentsEl = element.querySelector(".segments");
  }

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

    const isPaid = pay(currentBet);
    if (!isPaid) return;

    isPlaying = true;

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
    popupBanner.show(items[selectedItem].multiplier);
    controlBar.displayMessage(`YOU WON $${getSegmentPrize(selectedItem)}`);
  }

  async function restart() {
    if (isPlaying) return;
    selectedItem = -1;
    shuffleItems();
    await render()
    update();
  }

  return {
    element,
    get isPlaying() {
      return isPlaying;
    },
    update,
    play,
    restart,
  };
}
