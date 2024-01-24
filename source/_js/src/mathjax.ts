window.MathJax = {
  tex: {
    inlineMath: [["$", "$"]],
    autoload: {
      color: [],
      colorV2: ["color"],
    },
    packages: { "[+]": ["noerrors"] },
  },

  // See https://github.com/mathjax/MathJax-src/releases/tag/4.0.0-alpha.1#linebreaking
  output: {
    displayOverflow: "linebreak",
    linebreaks: {
      // options for when overflow is linebreak
      inline: true, // true for browser-based breaking of inline equations
      width: "100%", // a fixed size or a percentage of the container width
      lineleading: 0, // the default lineleading in em units
      LinebreakVisitor: null, // The LinebreakVisitor to use
    },
  },

  SVG: {
    fontCache: "global",
  },
  chtml: {
    matchFontHeight: false,
  },
  options: {
    ignoreHtmlClass: "tex2jax_ignore",
    processHtmlClass: "tex2jax_process",
  },
  loader: { load: ["input/tex", "output/chtml"] },
}
if ((window as any).__ams) window.MathJax.tex.tags = (window as any).__ams

document.addEventListener("DOMContentLoaded", function () {
  const script = document.createElement("script")
  script.src = "https://cdn.jsdelivr.net/npm/mathjax@4.0.0-beta.4/tex-chtml.js"
  script.async = true
  script.defer = true
  document.body.appendChild(script)
})
