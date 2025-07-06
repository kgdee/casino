const DiceGame = (() => {
  const element = document.querySelector(".dice-game");
  const panel = element.querySelector(".panel");
  const board = element.querySelector(".board");
  const tilemap = element.querySelector(".tilemap");
  const diceContainer = element.querySelector(".dice-container");

  const size = 5;
  const tiles = size ** 2;
  const borderTiles = (size - 1) * 4

  let isRolling = false;
  let currentTile = 0;

  function displayTilemap() {
    tilemap.style.gridTemplateColumns = `repeat(${size}, 50px)`;
    tilemap.innerHTML = "";
    for (let i = 0; i < tiles; i++) {
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

      tilemap.innerHTML += number != null ? `<div data-number="${number}" class="item${currentTile === number ? " active" : ""}">${number}</div>` : "<div></div>";
    }
  }

  function displayDice(die) {
    if (!die) die = Math.floor(Math.random() * 6) + 1;
    diceContainer.innerHTML = `<img class="dice" src="images/dice-${die}.png" style="animation: dice 0.2s ease-out forwards;">`;
  }

  function roll() {
    diceContainer.innerHTML = `<img class="dice" src="images/dice-animation.gif">`;
    isRolling = true;

    setTimeout(stop, 1000);
  }

  function stop() {
    const die = Math.floor(Math.random() * 6) + 1;
    displayDice(die)

    currentTile = (currentTile + die) % borderTiles;
    displayTilemap();
    isRolling = false;
  }

  function play() {
    if (isRolling) return
    roll()
  }

  function restart() {
    displayTilemap();
    displayDice()
  }

  return { element, play, restart };
})();
