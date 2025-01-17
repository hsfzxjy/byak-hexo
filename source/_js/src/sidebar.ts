import * as util from "./util"

util.docReady(() => {
  const toggleAside = () => {
    document.body.classList.toggle("aside-shown")
  }

  for (const selector of [".nav__toggler", ".nav__logo", ".nav__togglerClose"]) {
    document.querySelector(selector)!.addEventListener("click", toggleAside)
  }

  document.querySelector(".mainContainer")?.addEventListener("click", (e) => {
    const classList = document.body.classList
    if (classList.contains("aside-shown")) {
      classList.remove("aside-shown")
    }
  })
})
