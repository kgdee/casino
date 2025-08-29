class Home extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open"})

    this.element = null
    this.gameMenu = null

    this.render()
  }

  async render() {
    const styleEls = await createStyleEls(["utils.css", "pages/home/home.css"]);
    this.shadowRoot.innerHTML = `
      ${styleEls}
      <div class="home">
        <my-slideshow></my-slideshow>
        <my-ticker></my-ticker>
        <div class="game-menu">
          <h2><i class="bi bi-fire" style="color: red"></i> Top Games</h2>
          <div class="items"></div>
        </div>

        <img src="images/background-3.jpg" class="cta" />
      </div>
    `
    
    this.element = this.shadowRoot.querySelector(".home")
    this.gameMenu = this.element.querySelector(".game-menu");
    this.displayGameMenu()
    ticker.start();
    navbar.update()
  }

  displayGameMenu() {
    this.gameMenu.querySelector(".items").innerHTML = gameDetails
    .map(
      (gameDetail, i) => `
      <div class="item" onclick="openGame(${i})" style="background-image: url(${gameDetail.image})">
        <span class="bottom">${gameDetail.name}</span>
      </div>
    `
    )
    .join("");
  }
}

customElements.define("my-home", Home)