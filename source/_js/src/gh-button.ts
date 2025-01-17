// Add commas to numbers
function addCommas(n: number) {
  return String(n).replace(/(\d)(?=(\d{3})+$)/g, "$1,")
}

async function jsonp(path: string) {
  const cacheKey = `gh-btn:${path}`
  const cacheDuration = 3600_000 // 1 hour in milliseconds

  // Try to get cached data
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    try {
      const parsedCache = JSON.parse(cached)
      if (parsedCache.data && parsedCache.timestamp + cacheDuration > Date.now()) {
        onData(parsedCache.data)
        return
      }
    } catch (error) {
      console.error("Error parsing cached data:", error)
    }
  }

  // Fetch new data
  try {
    const response = await fetch(path)
    const data = await response.json()
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }))
    onData(data)
  } catch (error) {
    console.error("Error fetching data:", error)

    // Fallback to cached data if available
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached)
        if (parsedCache.data) {
          onData(parsedCache.data)
        }
      } catch (error) {
        console.error("Error parsing fallback cached data:", error)
      }
    }
  }
}

const GH_BUTTON: { username: string } = (window as any).GH_BUTTON

// Parameters
const parameters = new Map([
  ["user", GH_BUTTON.username],
  ["count", "true"],
  ["type", "follow"],
])
const user = parameters.get("user")
const repo = parameters.get("repo")
const type = parameters.get("type")
const count = parameters.get("count")
const size = parameters.get("size")
const noText = parameters.get("text")

// Elements
const button = document.querySelector(".gh-btn") as HTMLLinkElement
const mainButton = document.querySelector(".github-btn") as HTMLElement
const text = document.querySelector(".gh-text") as HTMLElement
const counter = document.querySelector(".gh-count") as HTMLLinkElement

// Constants
const LABEL_SUFFIX = "on GitHub"
const GITHUB_URL = "https://github.com/"
const API_URL = "https://api.github.com/"
const REPO_URL = `${GITHUB_URL + user}/${repo}`

function onData(obj: any) {
  switch (type) {
    case "follow": {
      counter.textContent = obj.followers && addCommas(obj.followers)
      counter.setAttribute("aria-label", `${counter.textContent} followers ${LABEL_SUFFIX}`)
      break
    }
  }

  // Show the count if asked and if it's not empty
  if (count === "true" && counter.textContent !== "") {
    counter.style.display = "block"
    counter.removeAttribute("aria-hidden")
  }
}

// Set href to be URL for repo
button.href = REPO_URL

let title

// Add the class, change the text label, set count link href
switch (type) {
  case "follow": {
    mainButton.classList.add("github-me")
    // text.textContent = `FOLLOW ME`
    button.href = GITHUB_URL + user
    counter.href = `${GITHUB_URL + user}?tab=followers`
    title = text.textContent
    break
  }
}

if (noText === "false") {
  button.classList.add("no-text")
  text.setAttribute("aria-hidden", "true")
  text.style.display = "none"
  text.textContent = ""
}

button.setAttribute("aria-label", `${title} ${LABEL_SUFFIX}`)

// Change the size if requested
if (size === "large") {
  mainButton.classList.add("github-btn-large")
}

if (type === "follow") {
  jsonp(`${API_URL}users/${user}`)
} else {
  jsonp(`${API_URL}repos/${user}/${repo}`)
}
