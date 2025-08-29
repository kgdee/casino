class Game extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open"})

    this.element = null
    this.gameIndex = -1
  }
  
  static get observedAttributes() {
    return ["game-index"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name ===  "game-index") {
      this.gameIndex = newValue
      this.render()
    }
  }
  
  async render() {
    const styleEls = await createStyleEls(["utils.css", "pages/game/game.css"]);
    this.shadowRoot.innerHTML = `
      ${styleEls}
      <div class="game">
        <my-control-bar />
      </div>
    `
    
    this.element = this.shadowRoot.querySelector(".game")

    currentGame = games[this.gameIndex](this.element)

    const controlBar = this.element.querySelector("my-control-bar")
    await controlBar.ready
    currentGame.restart()
  }
}

customElements.define("my-game", Game)