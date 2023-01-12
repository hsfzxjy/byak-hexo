import littlefoot from "../../../node_modules/littlefoot"
import * as util from "./util"

util.docReady(() => {
  littlefoot({
    footnoteSelector: "span",
  })
  document
    .querySelectorAll(".footnote-print-only")
    .forEach((el) => el.classList.remove("footnote-print-only"))
})
