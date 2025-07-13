const DiceGame = (() => {
  const name = "DICE"
  const image = "images/game-3.png"
  const element = document.querySelector(".dice-game");
  const panel = element.querySelector(".panel");
  const board = element.querySelector(".board");
  const tilemap = element.querySelector(".tilemap");
  const diceContainer = element.querySelector(".dice-container");

  const size = 3;
  const gridItems = size ** 2;
  const tiles = (size - 1) * 4;

  let prizes = [
    { multiplier: 2, tile: 0 },
    { multiplier: 5, tile: 1 },
  ];

  let isPlaying = false;
  let isLoading = false;
  let currentTile = 0;
  let diceNumber = Math.floor(Math.random() * 6) + 1;

  function updateTilemap() {
    tilemap.style.gridTemplateColumns = `repeat(${size}, 50px)`;
    tilemap.innerHTML = "";
    for (let i = 0; i < gridItems; i++) {
      const row = Math.floor(i / size);
      const col = i % size;

      const border = {
        top: row === 0,
        right: col === size - 1,
        bottom: row === size - 1,
        left: col === 0,
      };

      let tile = null;

      if (border.top) tile = col;
      else if (border.right) tile = size - 1 + row;
      else if (border.bottom) tile = (size - 1) * 3 - col;
      else if (border.left) tile = (size - 1) * 4 - row;

      const prize = prizes.find((prize) => prize.tile === tile);
      const label = prize != null ? `${prize.multiplier}x` : "";

      tilemap.innerHTML += tile != null ? `<div data-tile="${tile}" class="item${prize != null ? " prize" : ""}">${label}</div>` : "<div></div>";
    }

    if (isPlaying) move();
    else {
      const tileEl = tilemap.querySelector(`.item[data-tile="${0}"]`);
      tileEl.classList.add("active");
    }
  }

  async function move() {
    const start = currentTile - diceNumber;
    const end = currentTile;

    for (let i = start; i <= end; i++) {
      // true modulo to always get a positive tile number
      const tile = ((i % tiles) + tiles) % tiles;

      const tileEl = tilemap.querySelector(`.item[data-tile="${tile}"]`);

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
    displayMessage("Rolling...");

    diceNumber = Math.floor(Math.random() * 6) + 1;

    await sleep(1000)
    stop()
  }

  function stop() {
    currentTile = (currentTile + diceNumber) % tiles;
    displayMessage();
    displayDice();
    updateTilemap();
  }

  function setupPrizes() {
    let slots = Array.from({ length: tiles }, (_, i) => i);
    slots.shift();

    prizes = prizes.map((prize) => {
      const [tile] = slots.splice(Math.floor(Math.random() * slots.length), 1);
      return { ...prize, tile: tile };
    });
  }

  function play() {
    if (isLoading) return;

    if (currentBalance < currentBet) {
      Toast.show("Not enough balance. Please top up to continue");
      return;
    }

    isPlaying = true;
    increaseBalance(-currentBet);
    roll();
  }

  function restart() {
    if (isLoading) return;
    isPlaying = false;
    setupPrizes();
    updateTilemap();
    displayDice();
  }

  function finalize() {
    const multiplier = prizes.find((prize) => prize.tile === currentTile).multiplier;
    const rewards = currentBet * multiplier;
    increaseBalance(rewards);
    Popup.show(multiplier);
    displayMessage(`YOU WON $${rewards}`);
  }

  return { name, image, element, play, restart };
})();
