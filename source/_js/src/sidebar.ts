import * as util from "./util"

util.docReady(() => {
  const $toggleButton = document.querySelector("span.toggle-menu")!
  const $rightPanel = document.getElementById("right-panel")!

  $toggleButton.addEventListener("click", () => {
    $rightPanel.classList.toggle("show")
  })
})
