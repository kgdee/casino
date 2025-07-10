const gameMenu = document.querySelector(".game-menu");
const balanceText = document.querySelector(".balance span");
const controlBar = document.querySelector(".control-bar");
const playBtn = controlBar.querySelector(".play");
const messageEl = controlBar.querySelector(".message p");
const betDisplay = controlBar.querySelector(".bet span");
const navbarMenu = document.querySelector(".navbar .menu");

const games = [LaserGame, CoinsGame, DiceGame];
const timeOuts = { message: null };
let currentBalance = load("currentBalance", 2000);
let currentGame = null;
let isPlaying = false;
let currentBet = load("currentBet", 500);
let isControlEnabled = true;
let isCheatEnabled = false;

document.addEventListener("DOMContentLoaded", function () {
  displayGameMenu()
  updateUI();
  // openGame(0);
  Slideshow.slide();
  Ticker.start();
});

function displayGameMenu() {
  gameMenu.innerHTML = games.map(
    (game, i) => `
      <button class="item" onclick="openGame(${i})" style="background-image: url(${game.image})">
        <span class="bottom">${game.name}</span>
      </button>
    `
  ).join("");
}

function play() {
  currentGame.play();
}

function restart() {
  currentGame.restart();
}

function increaseBalance(amount) {
  currentBalance += Math.floor(amount);
  currentBalance = clamp(currentBalance, 0, 99999);

  save("currentBalance", currentBalance);
  updateUI();
}

function updateUI() {
  balanceText.textContent = currentBalance;
  betDisplay.innerHTML = `Total bet<br />$${currentBet}`;

  controlBar.classList.toggle("hidden", !currentGame);
}

function changeScreen(screenName) {
  document.querySelectorAll(".screen").forEach((element) => {
    element.classList.add("hidden");
  });

  document.querySelector(`.screen.${screenName}`).classList.remove("hidden");
  toggleNavbarMenu(false);
}

function goHome() {
  changeScreen("home-screen");
}

function openGame(gameIndex) {
  currentGame = games[gameIndex];

  if (!currentGame) return;

  changeScreen("game-screen");
  displayGame();
  updateUI();
  displayMessage();
}

function displayGame() {
  document.querySelectorAll(".game").forEach((el) => {
    el.classList.add("hidden");
  });

  currentGame.element.classList.remove("hidden");
  currentGame.restart();
}

function launchConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#FFD700", "#FFC700", "#FFB300"],
  });
}

function increaseBet(amount) {
  if (currentGame?.isPlaying) return;

  let newBet = currentBet + amount;
  newBet = Math.round(newBet / 500) * 500;
  newBet = Math.max(50, newBet);
  if (newBet === currentBet) return;
  currentBet = newBet;

  save("currentBet", currentBet);

  updateUI();
}

function toggleControlBar(force) {
  isControlEnabled = force != null ? force : !isControlEnabled;
  controlBar.querySelectorAll("button").forEach((btn) => (btn.disabled = !isControlEnabled));
}

async function displayMessage(message) {
  if (!message) message = "GOOD LUCK";
  messageEl.innerHTML = message;

  messageEl.style.animation = "message 0.5s ease-out infinite";
  clearTimeout(timeOuts.message);
  timeOuts.message = setTimeout(() => {
    messageEl.style.animation = null;
  }, 1000);
}

function toggleNavbarMenu(force) {
  navbarMenu.classList.toggle("m-hidden", force != null ? !force : undefined);
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
