// Add commas to numbers
function addCommas(n: number) {
  return String(n).replace(/(\d)(?=(\d{3})+$)/g, "$1,")
}

async function jsonp(path: string) {
  let data
  try {
    const response = await fetch(path)
    data = await response.json()
    localStorage.setItem(`gh-btn:${path}`, JSON.stringify(data))
  } catch (_) {
    data = localStorage.getItem(`gh-btn:${path}`)
    if (data === null) return
    try {
      data = JSON.parse(data)
    } catch (_) {
      return
    }
  }
  onData(data)
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
const v = parameters.get("v")

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
const USER_REPO = `${user}/${repo}`

function onData(obj: any) {
  switch (type) {
    case "watch": {
      if (v === "2") {
        counter.textContent = obj.subscribers_count && addCommas(obj.subscribers_count)
        counter.setAttribute("aria-label", `${counter.textContent} watchers ${LABEL_SUFFIX}`)
      } else {
        counter.textContent = obj.stargazers_count && addCommas(obj.stargazers_count)
        counter.setAttribute("aria-label", `${counter.textContent} stargazers ${LABEL_SUFFIX}`)
      }

      break
    }

    case "star": {
      counter.textContent = obj.stargazers_count && addCommas(obj.stargazers_count)
      counter.setAttribute("aria-label", `${counter.textContent} stargazers ${LABEL_SUFFIX}`)
      break
    }

    case "fork": {
      counter.textContent = obj.network_count && addCommas(obj.network_count)
      counter.setAttribute("aria-label", `${counter.textContent} forks ${LABEL_SUFFIX}`)
      break
    }

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
  case "watch": {
    if (v === "2") {
      mainButton.classList.add("github-watchers")
      text.textContent = "Watch"
      counter.href = `${REPO_URL}/watchers`
    } else {
      mainButton.classList.add("github-stargazers")
      text.textContent = "Star"
      counter.href = `${REPO_URL}/stargazers`
    }

    title = `${text.textContent} ${USER_REPO}`
    break
  }

  case "star": {
    mainButton.classList.add("github-stargazers")
    text.textContent = "Star"
    counter.href = `${REPO_URL}/stargazers`
    title = `${text.textContent} ${USER_REPO}`
    break
  }

  case "fork": {
    mainButton.classList.add("github-forks")
    text.textContent = "Fork"
    button.href = `${REPO_URL}/fork`
    counter.href = `${REPO_URL}/network`
    title = `${text.textContent} ${USER_REPO}`
    break
  }

  case "follow": {
    mainButton.classList.add("github-me")
    text.textContent = `Follow @${user}`
    button.href = GITHUB_URL + user
    counter.href = `${GITHUB_URL + user}?tab=followers`
    title = text.textContent
    break
  }

  case "sponsor": {
    mainButton.classList.add("github-me")
    text.textContent = `Sponsor @${user}`
    button.href = `${GITHUB_URL}sponsors/${user}`
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
