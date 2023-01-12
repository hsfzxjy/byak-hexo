export function docReady(body: () => void) {
  document.addEventListener("DOMContentLoaded", body)
}

export function throttle(f: () => void, time: number) {
  let lastTime = null
  return function (...args) {
    let current = Date.now()
    if (lastTime !== null && current - lastTime < time) {
      return
    }
    lastTime = current
    return f.bind(this)(...args)
  }
}
