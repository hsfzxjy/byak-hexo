import * as util from "./util"

util.docReady(() => {
  const $rocket = document.getElementById("rocket")!
  const $html = document.querySelector("html")!

  window.addEventListener("scroll", function () {
    $html.scrollTop > 100
      ? $rocket.classList.add("show")
      : $rocket.classList.remove("show")
  })

  $rocket.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" })
    return false
  })
})
