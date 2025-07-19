window.addEventListener("error", (event) => {
  const error = `${event.type}: ${event.message}`;
  console.error(error);
  alert(error);
});

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function blink(element) {
  element.classList.add("hidden");

  setTimeout(() => element.classList.remove("hidden"), 100);
}

function save(key, value) {
  localStorage.setItem(`${projectName}_${key}`, JSON.stringify(value));
}

function load(key, defaultValue) {
  const savedValue = localStorage.getItem(`${projectName}_${key}`);
  if (savedValue == null) return defaultValue;
  return JSON.parse(savedValue);
}

function removeSaveData(key) {
  localStorage.removeItem(`${projectName}_${key}`);
}

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function getFileName(file) {
  const encoded = file.name;
  const decoded = decodeURIComponent(encoded);
  const fileName = decoded.split("/").pop();

  return fileName;
}

function getFileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function cycle(n, range) {
  return ((n % range) + range) % range;
}

function changeScreen(screenName) {
  document.querySelectorAll(".screen").forEach((element) => {
    element.classList.add("hidden");
  });

  document.querySelector(`.screen.${screenName}`).classList.remove("hidden");
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function formatTime(ms) {
  const hours = String(Math.floor(ms / (1000 * 60 * 60))).padStart(2, "0");
  const minutes = String(Math.floor((ms / (1000 * 60)) % 60)).padStart(2, "0");
  const seconds = String(Math.floor((ms / 1000) % 60)).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function globalThisPut(instance, name) {
  globalThis[name] = globalThis[name] ? [...globalThis[name], instance] : [instance];
  const index = globalThis[name].length - 1;
  const instanceKey = `${name}[${index}]`;
  return instanceKey;
}

async function fetchText(url) {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

async function fetchTexts(urls) {
  return Promise.all(urls.map((url) => fetch(url).then((res) => res.text())));
}

async function createStyleEls(urls) {
  const cssTexts = await fetchTexts(urls);
  const styleEls = cssTexts.map((cssText) => `<style>${cssText}</style>`).join("\n");
  return styleEls;
}
