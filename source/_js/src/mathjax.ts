window.MathJax = {
  tex: {
    inlineMath: [["$", "$"]],
    autoload: {
      color: [],
      colorV2: ["color"],
    },
    packages: { "[+]": ["noerrors"] },
  },
  "HTML-CSS": {
    linebreaks: {
      automatic: true,
      width: "container",
    },
  },
  SVG: {
    fontCache: "global",
    linebreaks: { automatic: true },
  },
  options: {
    ignoreHtmlClass: "tex2jax_ignore",
    processHtmlClass: "tex2jax_process",
  },
  loader: {
    load: ["[tex]/noerrors"],
  },
}
document.addEventListener("DOMContentLoaded", function () {
  const script = document.createElement("script")
  script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-svg.js"
  script.async = true
  script.defer = true
  document.body.appendChild(script)
})
