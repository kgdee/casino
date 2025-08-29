const gameScreen = document.querySelector(".game-screen")

const itemDB = new ItemDB(gameItems);
const games = [ SlotGame, WheelGame, ScratchGame, DiceGame, LaserGame, CoinsGame];
const gameDetails = [
  {
    name: "SLOT",
    image: "images/slot-game.png",
  },
  {
    name: "WHEEL",
    image: "images/wheel-game.png",
  },
  {
    name: "SCRATCH",
    image: "images/scratch-game.png",
  },
  {
    name: "DICE",
    image: "images/dice-game.png",
  },
  {
    name: "LASER",
    image: "images/laser-game.png",
  },
  {
    name: "COINS",
    image: "images/coins-game.png",
  },
];

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
  toggleDarkTheme(isDarkTheme);
});

function play() {
  if (!currentGame) return;
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
  navbar.update();
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
  navbar.update();
  controlBar.update();
  controlBar.toggle(currentGame);
}

function launchConfetti() {
  const color = getArrayItem(confettiColors);
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
  currentGame?.toggleCheat?.();
}

function toggleDarkTheme(force) {
  isDarkTheme = force != null ? force : !isDarkTheme;
  document.body.classList.toggle("dark-theme", isDarkTheme);
  save("isDarkTheme", isDarkTheme);
}

function handleModalLayer(element) {
  if (!element) return;

  modalLayer++;
  element.style.zIndex = modalLayer;
}

async function giveReward(reward) {
  switch (reward.type) {
    case "multiplier":
      const multiplier = reward.value;
      const rewards = currentBet * multiplier;
      increaseBalance(rewards);

      controlBar.displayMessage(`YOU WON $${rewards}`);
      popupBanner.show(multiplier);
      break;
    case "bonus":
      const itemId = reward.value;
      const item = itemDB.getItem(itemId);
      inventory.addItem(item.id);

      controlBar.displayMessage(`You got ${item.name}`);
      await sleep(500);
      rewardModal.toggle([item]);
      break;

    default:
      break;
  }
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
