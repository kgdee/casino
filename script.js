const gameMenu = document.querySelector(".game-menu");

const itemDB = new ItemDB(gameItems);
const games = [LaserGame, CoinsGame, DiceGame];
const timeOuts = { message: null };
let currentBalance = load("currentBalance", 2000);
let currentGame = null;
let isPlaying = false;
let currentBet = load("currentBet", 500);
let isControlEnabled = true;
let isCheatEnabled = false;
let isDarkTheme = load("isDarkTheme", true);
let modalLayer = 0;

document.addEventListener("DOMContentLoaded", async function () {
  displayGameMenu();
  // openGame(2);
  Ticker.start();
  
  await navbar.ready
  await controlBar.ready
  toggleDarkTheme(isDarkTheme);
  updateUI();
});

function displayGameMenu() {
  gameMenu.innerHTML = games
    .map(
      (game, i) => `
      <button class="item" onclick="openGame(${i})" style="background-image: url(${game.image})">
        <span class="bottom">${game.name}</span>
      </button>
    `
    )
    .join("");
}

function play() {
  if (!currentGame) return
  currentGame.play();
}

function restart() {
  currentGame.restart();
}

function increaseBalance(amount) {
  amount = Math.floor(amount);
  currentBalance += amount;
  currentBalance = clamp(currentBalance, 0, 99999);

  save("currentBalance", currentBalance);
  updateUI();
  if (amount > 0) coinsPopup.show(amount);
}

function pay(amount) {
  if (currentBalance < amount) {
    toast.show("Not enough balance. Please top up to continue");
    return false;
  }

  increaseBalance(-amount);
  return true;
}

function updateUI() {
  navbar.update()
  controlBar.update()
  controlBar.toggle(currentGame);
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
  controlBar.displayMessage();
}

function displayGame() {
  document.querySelectorAll(".game").forEach((el) => {
    el.classList.add("hidden");
  });

  currentGame.element.classList.remove("hidden");
  currentGame.restart();
}

function launchConfetti() {
  const color = getRandomItem(confettiColors);
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: color,
  });
}

function increaseBet(amount) {
  if (currentGame.isPlaying) return;

  let newBet = currentBet + amount;
  newBet = Math.round(newBet / 500) * 500;
  newBet = Math.max(50, newBet);
  if (newBet === currentBet) return;
  currentBet = newBet;

  save("currentBet", currentBet);

  updateUI();
}

function toggleCheat() {
  isCheatEnabled = !isCheatEnabled;
  currentGame.update();
}

function toggleDarkTheme(force) {
  isDarkTheme = force != null ? force : !isDarkTheme;
  document.body.classList.toggle("dark-theme", isDarkTheme);
  navbar.update()
  save("isDarkTheme", isDarkTheme);
}

function handleModalLayer(element) {
  if (!element) return;

  modalLayer++;
  element.style.zIndex = modalLayer;
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
