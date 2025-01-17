const rHLLabelCode = /<code>@#([^`]*?)<\/code>/g
const rHTag = /<code>@!(i?)((#[0-9a-fA-Z]{6}|%[a-z]+|hsl\(.+\))\s+)?([^`]*?)<\/code>/g

function highlightHLLabel(data) {
  data.content = data.content
    .replace(rHLLabelCode, (_, $1) => {
      return `<code class="_hl-label">${$1}</code>`
    })
    .replace(rHTag, (_, inline, $color, _2, $content) => {
      if ($color !== undefined) {
        $color = $color.trim()
        if ($color.startsWith("%")) {
          $color = $color.replace(/^%/, "")
          $color = `var(--${$color}-color)`
        }
      } else {
        $color = ""
      }
      const inlineCss = inline ? "display: inline;" : ""
      return `<code class="_hl-tag" style="--color: ${$color}; ${inlineCss}">${$content}</code>`
    })
}

hexo.extend.filter.register("after_post_render", highlightHLLabel, 11)
