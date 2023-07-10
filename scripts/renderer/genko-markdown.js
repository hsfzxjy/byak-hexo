const DIGEST_SEP = "\uFFFF\uFFFE"

function dotPlugin(genko) {
  const defaultHeading = `
graph [bgcolor="#ffffff00", minlen=2];
node [shape="egg", color="#444444", fillcolor="seashell", style="filled", fontcolor="#444444", height=0.1, margin="0.1,0.04"];
edge [color="#444444", fontcolor="#444444", constraint=false, fontsize=10];
`
  genko.codex.Executor.register("graphviz", {
    run: async (text) => {
      text = text
        .replace(/^([^{]*{)/, (_, $1) => $1 + defaultHeading)
        .replace(/@c/g, "constraint=true")
        .replace(/@i/g, "style=invis")
        .replace(/@t/g, 'fillcolor="#ffffff00"')
        .replace(/@p/g, 'shape="plaintext"')
      const result = await genko.util.exec(
        "/bin/bash",
        ["-c", "dot -Tsvg | svgo - -o -"],
        { stdin: text }
      )
      return result.isSuccess
        ? `<figure class="graphviz">${result.stdout}</figure>`
        : genko.util.render.asTextBlock(result.toString())
    },
  })

  genko.codex.Executor.register("d2", {
    run: async (text, options) => {
      let args = ["--pad", "0"]
      args.push("--bundle=false")
      if (options.args.theme) {
        args.push("--theme", options.args.theme)
      }
      if (options.args.sketch) {
        args.push("--sketch")
      }

      args = [
        "-c",
        `svgo -p 0 <(d2 ${args.join(" ")} {{input}} -) -o {{output}}`,
      ]
      const result = await genko.util.exec("/bin/bash", args, { stdin: text })

      return result.isSuccess
        ? `<figure class="gk-d2">${result.output}</figure>`
        : genko.util.render.asTextBlock(result.toString())
    },
  })
}

hexo.extend.renderer.register("md", "html", async (data) => {
  const genko = require("genko-markdown").default

  genko.registerPlugin(dotPlugin)

  let { html, digest } = await genko.parse(data.text, {
    digest: true,
    marked: { mangle: false },
  })
  if (digest) {
    html = html + DIGEST_SEP + digest
  }
  return html
})
