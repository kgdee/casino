const WheelGame = () => {
  const element = document.querySelector(".wheel-game");
  let wheelEl = null;
  let itemsEl = null;

  const initialPrizes = [
    { type: "multiplier", value: 2 },
    { type: "multiplier", value: 5 },
    { type: "bonus", value: 32 },
  ];

  const segmentSize = 45;
  const time = 3;

  let currentPrizes = [];
  let isLoading = false;
  let isPlaying = false;
  let currentRotation = 0;

  function setupPrizes() {
    const bonusItems = Array.from({ length: 5 }, () => ({ type: "bonus", value: itemDB.getItemByRarity([50, 500]).id }));
    const prizes = initialPrizes.concat(bonusItems);

    currentPrizes = shuffle(prizes);
  }

  function render() {
    element.innerHTML = `
      <div class="wrapper">
        <img class="arrow" src="images/arrow.png" />
        <div class="wheel">
          <img class="wheel-img" src="images/wheel.png" />
          <div class="items"></div>
        </div>
      </div>
    `;

    wheelEl = element.querySelector(".wheel");
    itemsEl = element.querySelector(".items");
  }

  function update() {
    itemsEl.innerHTML = currentPrizes.map((prize, i) => createItemEl(prize, i)).join("");
  }

  function createItemEl(prize, index) {
    let content = "";

    if (prize.type === "bonus") {
      const bonusItem = itemDB.getItem(prize.value);
      content = `<img src="${bonusItem.image}" />`;
    } else {
      content = `<span>x${prize.value}</span>`;
    }

    const rotation = segmentSize * index * -1;

    return `
        <div class="item" style="transform: translateX(-50%) rotate(${rotation}deg);">
          ${content}
        </div>
      `;
  }

  function restart() {
    if (isPlaying || isLoading) return

    setupPrizes();
    render();
    update();
  }

  async function play() {
    if (isLoading || isPlaying) return;

    const isPaid = pay(currentBet);
    if (!isPaid) return;

    isPlaying = true;

    wheelEl.style.transition = `${time}s ease-out`;
    let rotation = currentRotation + Math.floor(200 + Math.random() * 1000);
    wheelEl.style.transform = `rotate(${rotation}deg)`;

    await sleep(time * 1000);

    currentRotation = rotation % 360;
    wheelEl.style.transition = null;
    wheelEl.style.transform = `rotate(${currentRotation}deg)`;
    finalize();
    isPlaying = false;
  }

  function finalize() {
    const rotation = currentRotation + segmentSize / 2;
    const index = Math.max(0, Math.floor(rotation / segmentSize));
    const reward = currentPrizes[index];
    if (reward) giveReward(reward)
  }

  return {
    element,
    get isPlaying() {
      return isPlaying;
    },
    play,
    restart,
  };
}
