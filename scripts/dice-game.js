const DiceGame = (() => {
  const element = document.querySelector(".dice-game");
  const panel = element.querySelector(".panel");
  const board = element.querySelector(".board");

  let isRolling = false;

  function displayBoard() {
    const size = 5;
    const tiles = size ** 2;
    let boardTiles = [];

    board.style.gridTemplateColumns = `repeat(${size}, 50px)`;
    board.innerHTML = "";
    for (let i = 1; i <= tiles; i++) {
      const isBorder = i % size <= 1 || i <= size || i > tiles - size;
      if (isBorder) {
        boardTiles.push(i);
      }
      const label = i;

      board.innerHTML += `<div class="item${!isBorder ? " hole" : ""}">${label}</div>`;
    }
    console.log(boardTiles.length);
  }

  displayBoard();

  function displayBoardT() {
    const size = 3;
    board.style.gridTemplateColumns = `repeat(${size}, 40px)`;
    board.innerHTML = "";

    const total = size * size;

    for (let i = 0; i < total; i++) {
      const row = Math.floor(i / size);
      const col = i % size;
      const isBorder = row === 0 || row === size - 1 || col === 0 || col === size - 1;

      const cell = document.createElement("div");
      if (isBorder) {
        cell.className = "cell";
        cell.textContent = `${row},${col}`;
      } else {
        cell.style.visibility = "hidden"; // keeps structure, hides content
      }

      board.appendChild(cell);
    }
  }

  function displayDice() {
    panel.innerHTML = `<img class="dice" src="images/dice-animation.gif">`;
    isRolling = true;
  }

  function stopDice() {
    panel.innerHTML = `<img class="dice" src="images/dice-${Math.floor(Math.random() * 6) + 1}.png" style="animation: dice 0.2s ease-out forwards;">`;
    isRolling = false;
  }

  function play() {
    isRolling ? stopDice() : displayDice();
  }

  function restart() {}

  return { element, play, restart };
})();
