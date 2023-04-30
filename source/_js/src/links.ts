import { a, docReady, h } from "./util"

const URL = "feeds.opml.xml"
// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
const $container = document.currentScript?.parentElement!

docReady(async () => {
  const xmlContent = await (await fetch(URL)).text()
  const parser = new DOMParser()
  const feeds = parser
    .parseFromString(xmlContent, "text/xml")
    .querySelector('outline[text="Uncategorized"]')!
  const nodesToAdd = <HTMLElement[]>[]
  let prevTitle = ""
  for (const feed of feeds.children) {
    const title = feed.getAttribute("text")
    if (!title || title === prevTitle) continue
    prevTitle = title
    const rssURL = feed.getAttribute("xmlUrl")
    const siteURL = feed.getAttribute("htmlUrl")
    const description = feed.getAttribute("description")
    const node = h(
      "div",
      ["links-item"],
      h("b", ["links-title"], title),
      siteURL && h("span", ["links-url"], "[", a("Site", siteURL), "]"),
      rssURL && h("span", ["links-url"], "[", a("Feed", rssURL), "]"),
      description && h("div", ["links-description"], description)
    )
    nodesToAdd.push(node)
  }
  const $wrapper = h("div", ["links-wrapper"], ...nodesToAdd)
  $container.append($wrapper)
})
