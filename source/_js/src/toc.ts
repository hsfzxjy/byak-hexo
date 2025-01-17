import { docReady } from "./util"

function getHrefTargetId(link: Element): string {
  return decodeURIComponent(link.getAttribute("href")!.slice(1))
}

docReady(() => {
  const tocLinks = document.querySelectorAll("#toc a")
  if (!tocLinks.length) return
  const ids = new Set<string>()
  for (const link of tocLinks) {
    const targetId = getHrefTargetId(link)
    ids.add(targetId)
  }

  // Map section IDs to TOC links for easy access
  const target2link = new Map<Element, Element>()
  for (const link of tocLinks) {
    const targetId = getHrefTargetId(link)
    const targetElem = document.getElementById(targetId)
    if (!targetElem) continue
    let node: Element | null = targetElem
    while (node) {
      target2link.set(node, link)
      node = node.nextElementSibling
      if (ids.has(node?.getAttribute("id") ?? "")) {
        break
      }
    }
  }

  const active = new Map<Element, Set<Element>>()

  // Intersection Observer callbac
  const observerCallback: IntersectionObserverCallback = (entries) => {
    const changed = new Set<Element>()
    entries.forEach((entry) => {
      const link = target2link.get(entry.target)
      if (!link) return
      if (!active.has(link)) {
        active.set(link, new Set())
      }
      if (entry.isIntersecting) {
        active.get(link)?.add(entry.target)
      } else {
        active.get(link)?.delete(entry.target)
      }
      changed.add(link)
    })
    changed.forEach((link) => {
      if (active.get(link)?.size) {
        link.classList.add("active")
      } else {
        link.classList.remove("active")
      }
    })
  }

  // Intersection Observer options
  const observerOptions = {
    root: null, // Use the viewport as the root
    rootMargin: "0px 0px -50% 0px", // Trigger when section crosses 50% of viewport
  }

  // Create the Intersection Observer
  const observer = new IntersectionObserver(observerCallback, observerOptions)

  // Observe each section
  target2link.forEach((_link, target) => observer.observe(target))
})
