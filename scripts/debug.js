const path = require("path")
const autoReload =
  require("../node_modules/hexo-script-reload/dist/node/index").default

const GENKO_DIR = path.resolve(
  __dirname,
  "..",
  "node_modules",
  "genko-markdown",
  "dist",
  "node"
)

autoReload(hexo, [
  {
    dir: GENKO_DIR,
    action: (ctx) => {
      ctx.removeCache("genko-markdown")
      ctx.removeCache("marked")
      ctx.removeCache("highlight.js")
      ctx.reload()
    },
  },
])
