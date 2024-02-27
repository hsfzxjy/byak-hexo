import { docReady } from "./util"

docReady(() => {
  const $toc = document.querySelector("#toc")
  if (!$toc) return
  const $tocButton = $toc.querySelector(".toc-toggler")!
  $tocButton.addEventListener("click", () => {
    $toc.classList.toggle("expanded")
  })
  $toc
    .querySelectorAll("a")
    .forEach(($el) => $el.addEventListener("click", () => $toc.classList.remove("expanded")))
})
