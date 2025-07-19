const DiceGame = (() => {
  const name = "DICE";
  const image = "images/game-3.png";
  const element = document.querySelector(".dice-game");
  let tilemap = null;
  let diceContainer = null;

  const size = 4;
  const allTileCount = size ** 2;
  const tileCount = (size - 1) * 4;

  const initialPrizes = [{ multiplier: 2 }, { multiplier: 5 }, { itemBonus: 32 }, { itemBonus: 35 }];
  let prizes = initialPrizes;

  let isPlaying = false;
  let isLoading = false;
  let currentTile = 0;
  let diceNumber = Math.floor(Math.random() * 6) + 1;

  function render() {
    element.innerHTML = `
      <div class="panel">
        <div class="board">
          <div class="tilemap"></div>
          <div class="dice-container center"></div>
        </div>
      </div>
    `;
    tilemap = element.querySelector(".tilemap");
    diceContainer = element.querySelector(".dice-container");
  }

  function updateTilemap() {
    tilemap.style.gridTemplateColumns = `repeat(${size}, 50px)`;
    tilemap.innerHTML = "";
    for (let i = 0; i < allTileCount; i++) {
      const row = Math.floor(i / size);
      const col = i % size;

      const border = {
        top: row === 0,
        right: col === size - 1,
        bottom: row === size - 1,
        left: col === 0,
      };

      let number = null;

      if (border.top) number = col;
      else if (border.right) number = size - 1 + row;
      else if (border.bottom) number = (size - 1) * 3 - col;
      else if (border.left) number = (size - 1) * 4 - row;

      const prize = prizes.find((prize) => prize.tile === number);

      tilemap.innerHTML += number != null ? createTileEl(number, prize) : "<div></div>";
    }

    if (isPlaying) move();
    else {
      const tileEl = tilemap.querySelector(`.item[data-id="${0}"]`);
      tileEl.classList.add("active");
    }
  }

  function createTileEl(number, prize) {
    const label = prize?.multiplier ? `${prize.multiplier}x` : "";
    const item = prize?.itemBonus ? itemDB.getItem(prize.itemBonus) : null;
    return `
      <div data-id="${number}" class="item${prize ? " prize" : ""}">
        <img class="floor" src="images/${prize?.multiplier ? "tile-4.png" : "tile-3.png"}" />
        <img class="mark" src="images/tile-mark.png" />
        ${item ? `<img class="prize" src="${item.image}" />` : ""}
        ${label ? `<span class="prize">${label}</span>` : ""}
      </div>`;
  }

  async function move() {
    const start = currentTile - diceNumber;
    const end = currentTile;

    for (let i = start; i <= end; i++) {
      // true modulo to always get a positive tile number
      const tile = ((i % tileCount) + tileCount) % tileCount;

      const tileEl = tilemap.querySelector(`.item[data-id="${tile}"]`);

      if (i < end) tileEl.style.animation = `tile 0.5s ease-out forwards`;
      else {
        if (prizes.some((prize) => prize.tile === i)) finalize();
        tileEl.classList.add("active");
        isLoading = false;
      }
      await sleep(250);
    }
  }

  function displayDice() {
    diceContainer.innerHTML = `<img class="dice" src="images/dice-${diceNumber}.png" style="animation: dice 0.2s ease-out forwards;">`;
  }

  async function roll() {
    isLoading = true;
    diceContainer.innerHTML = `<img class="dice" src="images/dice-animation-2.gif">`;
    controlBar.displayMessage("Rolling...");

    diceNumber = Math.floor(Math.random() * 6) + 1;

    await sleep(1000);
    stop();
  }

  function stop() {
    currentTile = (currentTile + diceNumber) % tileCount;
    controlBar.displayMessage();
    displayDice();
    updateTilemap();
  }

  function setupPrizes() {
    const extraPrizes = Array.from({ length: 2 }, () => ({ itemBonus: itemDB.getItemByRarity([50, 500]).id }));
    prizes = initialPrizes.concat(extraPrizes);

    let availableTiles = Array.from({ length: tileCount }, (_, i) => i);
    availableTiles.shift();

    prizes = prizes.map((prize) => {
      const index = Math.floor(Math.random() * availableTiles.length);
      const [tile] = availableTiles.splice(index, 1);
      return { ...prize, tile: tile };
    });
  }

  function play() {
    if (isLoading) return;

    const isPaid = pay(currentBet);
    if (!isPaid) return;

    isPlaying = true;

    roll();
  }

  function restart() {
    if (isLoading) return;
    isPlaying = false;
    setupPrizes();
    render()
    updateTilemap();
    displayDice();
  }

  function finalize() {
    isPlaying = false
    const prize = prizes.find((prize) => prize.tile === currentTile);
    if (prize.multiplier) {
      const multiplier = prize.multiplier;
      const rewards = currentBet * multiplier;
      increaseBalance(rewards);
      Popup.show(multiplier);
      controlBar.displayMessage(`YOU WON $${rewards}`);
    } else if (prize.itemBonus) {
      const item = itemDB.getItem(prize.itemBonus);
      inventory.addItem(item.id);
      controlBar.displayMessage(`You got ${item.name}`);
      rewardModal.toggle([item]);
    }
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
