const balanceText = document.querySelector(".balance .text");
const gameMenu = document.querySelector(".game-menu");
const controlBar = document.querySelector(".control-bar");
const playBtn = controlBar.querySelector(".play");
const messageEl = controlBar.querySelector(".message");
const betDisplay = controlBar.querySelector(".bet span");

const games = [RouletteBar, CapsuleBar, DiceGame];
let currentBalance = load("currentBalance", 2000);
let currentGame = null;
let isPlaying = false;
let currentBet = load("currentBet", 500);
let isCheatEnabled = false;

document.addEventListener("DOMContentLoaded", function () {
  updateUI();
  openGame(2);
});

function play() {
  currentGame.play();
}

function increaseBalance(amount) {
  currentBalance += amount;
  currentBalance = clamp(currentBalance, 0, 99999);

  save("currentBalance", currentBalance);
  updateUI();
}

function updateUI() {
  balanceText.textContent = currentBalance;
  betDisplay.innerHTML = `Total bet<br />$${currentBet}`;

  controlBar.classList.toggle("hidden", !currentGame);
}

function openGame(gameIndex) {
  currentGame = games[gameIndex];

  gameMenu.classList.toggle("hidden", currentGame);

  document.querySelectorAll(".game").forEach((el) => {
    el.classList.add("hidden");
  });

  if (!currentGame) return;

  currentGame.element.classList.remove("hidden");
  currentGame.restart();
  updateUI();
}

function launchConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
  });
}

function increaseBet(amount) {
  if (currentGame?.isPlaying) return;

  let newBet = currentBet + amount;
  newBet = Math.round(newBet / 500) * 500;
  currentBet = clamp(newBet, 50, currentBalance);

  save("currentBet", currentBet);
  currentGame.restart();

  updateUI();
}

function toggleCheat() {
  isCheatEnabled = !isCheatEnabled;
  currentGame.update();
}

const keyActions = {
  Space: play,
  KeyC: toggleCheat,
};

document.addEventListener("keydown", (event) => {
  const action = keyActions[event.code];
  if (action) {
    event.preventDefault();
    action();
  }
});
