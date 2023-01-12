import * as util from "./util"

util.docReady(() => {
  const isWX = () => {
    const ua = navigator.userAgent.toLowerCase()
    return /micromessenger/.test(ua)
  }

  if (isWX()) {
    document.querySelectorAll(".categories a, .tags a").forEach((el) => {
      el.addEventListener("click", function (e) {
        e.preventDefault()
      })
    })
  } else {
    autoResizeNav()
  }
})

function autoResizeNav() {
  const $navMenuContainer = document.querySelector("#nav-menu > div")!
  const $navMenu = document.getElementById("nav-menu")!

  function process() {
    const threshold = 2
    $navMenu.classList.toggle("left", $navMenuContainer.scrollLeft > threshold)
    $navMenu.classList.toggle(
      "right",
      $navMenuContainer.scrollLeft + $navMenuContainer.clientWidth + threshold <
        $navMenuContainer.scrollWidth
    )
  }

  new ResizeObserver(util.throttle(process, 100)).observe($navMenuContainer)
  $navMenuContainer.addEventListener("scroll", util.throttle(process, 10))
}
