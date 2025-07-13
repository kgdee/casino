const Popup = (() => {
  const element = document.querySelector(".popup");

  let duration = 2;
  let timeOut = null;

  function show(multiplier) {
    let index = 0;

    if (multiplier >= 5) index = 2;
    else if (multiplier >= 2) index = 1;

    launchConfetti();
    if (index > 0) showBanner(index)
  }

  function showBanner(index) {
    element.classList.remove("hidden");
    element.innerHTML = `
      <img class="center" src="images/popup-${index}.png" style="animation: popup ${duration}s ease-out forwards;">
    `;

    clearTimeout(timeOut);
    timeOut = setTimeout(() => {
      element.classList.add("hidden");
    }, 1000 * duration);
  }

  return { show };
})();
