const routes = {
  "/": `<my-home />`,
  "/slot": "<my-game game-index='0' />",
  "/wheel": "<my-game game-index='1' />",
  "/scratch": "<my-game game-index='2' />",
  "/dice": "<my-game game-index='3' />",
  "/laser": "<my-game game-index='4' />",
  "/coins": "<my-game game-index='5' />",
};

function router() {
  const path = location.hash.slice(1) || "/";
  document.querySelector(".app").innerHTML = `<my-layout>${routes[path]}</my-layout>` || "<h1>404</h1>";
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);