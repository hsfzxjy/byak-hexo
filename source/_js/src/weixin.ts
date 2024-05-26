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
  }
})
