const Slideshow = (() => {
  const element = document.querySelector(".slideshow");
  const imagesEl = element.querySelector(".images");
  const images = ["banner-1.jpg", "banner-2.jpg", "banner-3.jpg"];

  const interval = 4;
  let currentIndex = 0;
  let intervalId;

  async function slide(direction = 1) {
    const image = images[currentIndex];
    currentIndex = cycle(currentIndex + direction, images.length)

    const nextImage = images[currentIndex];

    const moveX = direction >= 0 ? 100 : -100;

    imagesEl.innerHTML = `
      <img src="images/${image}" />
      <img src="images/${nextImage}" style="left: ${moveX}%;" />
    `;

    await sleep(100);

    imagesEl.children[0].style.left = `${-moveX}%`;
    imagesEl.children[1].style.left = "0";

    clearInterval(intervalId)
    intervalId = setInterval(() => {
      slide();
    }, 1000 * interval);
  }

  return { slide };
})();
