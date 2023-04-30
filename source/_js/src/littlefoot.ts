// eslint-disable-next-line import/no-named-as-default
import littlefoot from "littlefoot"

window.ENDEC.onCleartext(($el) => {
  const id = Math.random().toString()
  $el.setAttribute("data-xxid", id)
  littlefoot({
    scope: `[data-xxid="${id}"]`,
  })
})
