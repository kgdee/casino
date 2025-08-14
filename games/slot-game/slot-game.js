const SlotGame = () => {
  let element = document.querySelector(".slot-game");
  let reelsEl = null;

  const totalReels = 3;
  const stepSize = 50;
  const rate = 0.1;
  const max = 7;
  const offsetY = 1;

  const prizes = [
    { type: "multiplier", value: 5 },
    { type: "multiplier", value: 10 },
    { type: "bonus", value: 32 },
    { type: "bonus", value: itemDB.getItemByRarity([50, 500]).id },
    { type: "bonus", value: itemDB.getItemByRarity([50, 500]).id },
  ];

  // reels[i].items[i] is prize index
  let reels = [];

  let isPlaying = false;

  function render() {
    element.innerHTML = `
      <div class="panel">
        <img src="images/slot-game-title.png" class="title-img">
        <div class="reels"></div>
      </div>
    `;

    reelsEl = element.querySelector(".reels");
  }

  function generateReels() {
    const reels = Array.from({ length: totalReels }, (_, i) => ({ items: Array.from({ length: max }, (_, i) => getRandomIndex(prizes)) }));
    return reels;
  }

  function displayReels() {
    reelsEl.innerHTML = reels
      .map(
        (reel, i) => `
      <div class="reel">
        <div class="items"></div>
      </div>
    `
      )
      .join("");

    Array.from(reelsEl.children).forEach((el, i) => displayReelItems(i));
  }

  function displayReelItems(index) {
    const reelEl = reelsEl.children[index];
    const itemsEl = reelEl.children[0];
    const reel = reels[index];

    itemsEl.innerHTML = reel.items.map((item, i) => {
      const posY = stepSize * i - offsetY * stepSize
      return createReelItemEl(prizes[item], posY)
    }).join("");
  }

  function createReelItemEl(prize, posY) {
    let content = "";

    if (prize.type === "bonus") {
      const bonusItem = itemDB.getItem(prize.value);
      content = `<img src="${bonusItem.image}" />`;
    } else {
      content = `<span>x${prize.value}</span>`;
    }

    return `
        <div class="item" style="top: ${posY}px;">
          ${content}
        </div>
      `;
  }

  async function spinReel(index) {
    const reelEl = reelsEl.children[index];
    const itemsEl = reelEl.children[0];
    const reel = reels[index];

    const step = 10 + 5 * index;

    itemsEl.style.transition = null;
    itemsEl.style.transform = null;

    displayReelItems(index);

    const resultItems = Array.from({ length: step }, (_, i) => getRandomIndex(prizes));
    reel.items = [...reel.items, ...resultItems].slice(-max);

    await sleep(200);

    itemsEl.style.transition = `transform ${rate * step}s ease-out`;

    const initialY = itemsEl.children.length * stepSize;
    for (let i = 0; i < step; i++) {
      setTimeout(() => {
        const item = resultItems[i];
        const posY = initialY + stepSize * i - offsetY * stepSize
        itemsEl.insertAdjacentHTML(
          "beforeend",
          createReelItemEl(prizes[item], posY) 
        );

        if (itemsEl.children.length > max) itemsEl.children[0].remove();
      }, 1000 * rate * i);
    }

    itemsEl.style.transform = `translateY(${step * stepSize * -1}px)`;

    await sleep(1000 * rate * step);
  }

  async function play() {
    if (isPlaying) return;

    const isPaid = pay(currentBet);
    if (!isPaid) return;

    isPlaying = true;

    // Create a master promise for ALL reels
    const spinReelsTask = (async () => {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(spinReel(i));
        await sleep(250); // stagger start times
      }
      await Promise.all(promises);
    })();

    animate(spinReelsTask);
    controlBar.displayMessage();

    // Wait until all reels finish before continuing
    await spinReelsTask;

    finalize();

    isPlaying = false;
  }

  async function animate(spinReelsTask) {
    element.classList.toggle("playing", isPlaying);

    await spinReelsTask;

    const indexToMatch = reels[0].items[1 + offsetY];
    const isWin = reels.every((reel) => reel.items[1 + offsetY] === indexToMatch);

    await sleep(200);
    element.classList.toggle("playing", false);
    element.classList.toggle("win", isWin);

    await sleep(1000);
    element.classList.toggle("win", false);
  }

  function finalize() {
    const indexToMatch = reels[0].items[1 + offsetY];
    const isWin = reels.every((reel) => reel.items[1 + offsetY] === indexToMatch);
    if (isWin) {
      const reward = prizes[indexToMatch]
      if (reward) giveReward(reward);
    }
  }

  function restart() {
    if (isPlaying) return

    render();
    reels = generateReels()
    displayReels();
  }

  return {
    element,
    get isPlaying() {
      return isPlaying;
    },
    play,
    restart,
  };
};
