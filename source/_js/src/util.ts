export function docReady(body: () => void) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", body)
  } else {
    body()
  }
}

export function throttle(f: (...args: any[]) => void, time: number) {
  let lastTime: null | number = null
  return function (this: any) {
    const current = Date.now()
    if (lastTime !== null && current - lastTime < time) return
    lastTime = current
    // eslint-disable-next-line prefer-rest-params
    return f.call(this, arguments)
  }
}

type _HTMLElement = HTMLElement & {
  on: (eventName: string, callback: (...args: any[]) => any) => _HTMLElement
  attr: (name: string, value: string) => _HTMLElement
}

export function h(
  tagName: string,
  classes?: string[],
  ...children: (HTMLElement | string | null | false | undefined)[]
): _HTMLElement {
  const $el = document.createElement(tagName) as ReturnType<typeof h>
  if (classes) $el.classList.add(...classes)
  for (const child of children) {
    if (!child) continue
    let $child: Node
    if (typeof child === "string") $child = document.createTextNode(child)
    else $child = child
    $el.appendChild($child)
  }
  $el.on = (eventName, callback) => {
    $el.addEventListener(eventName, callback)
    return $el
  }
  $el.attr = (name, value) => {
    $el.setAttribute(name, value)
    return $el
  }
  return $el
}

export function a(text: string, url: string): HTMLElement {
  return h("a", [], text).attr("target", "_blank").attr("href", url)
}
