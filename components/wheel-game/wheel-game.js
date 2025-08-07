const WheelGame = (() => {
  const name = "WHEEL";
  const image = "images/wheel-game.png";
  const element = document.querySelector(".wheel-game");
  let wheelEl = null;
  let itemsEl = null;

  const initialItems = [
    { type: "multiplier", value: 2 },
    { type: "multiplier", value: 5 },
    { type: "bonus", value: 32 },
  ];

  const segmentSize = 45;
  const time = 3;

  let currentItems = [];
  let isLoading = false;
  let isPlaying = false;
  let currentRotation = 0;

  function setupItems() {
    const bonusItems = Array.from({ length: 2 }, () => ({ type: "bonus", value: itemDB.getItemByRarity([50, 500]).id }));
    const items = initialItems.concat(bonusItems);

    currentItems = shuffle(items);
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
    itemsEl.innerHTML = currentItems.map((item, i) => createItemEl(item, i)).join("");
  }

  function createItemEl(item, index) {
    let content = "";

    if (item.type === "bonus") {
      const bonusItem = itemDB.getItem(item.value);
      content = `<img src="${bonusItem.image}" />`;
    } else {
      content = `<span>x${item.value}</span>`;
    }

    const rotation = segmentSize * index * -1;

    return `
        <div class="item" style="transform: translateX(-50%) rotate(${rotation}deg);">
          ${content}
        </div>
      `;
  }

  function restart() {
    setupItems();
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
    const reward = currentItems[index];

    let rewardName = "Nothing";
    if (reward) {
      if (reward.type === "bonus") {
        const bonusItem = itemDB.getItem(reward.value);
        rewardName = bonusItem.name;
      } else {
        rewardName = reward.value;
      }
    }

    controlBar.displayMessage(`YOU WON ${rewardName}`);
  }

  return {
    name,
    image,
    element,
    get isPlaying() {
      return isPlaying;
    },
    play,
    restart,
  };
})();
