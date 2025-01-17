const DIGEST_SEP = "\uFFFF\uFFFE"
const { spawn } = require("child_process")

function waitEnd(child) {
  return new Promise((resolve) => {
    child.on("exit", resolve)
  })
}

async function collectOutput(stream) {
  const output = []
  for await (const chunk of stream) {
    output.push(chunk)
  }
  return Buffer.concat(output).toString()
}

function fixEntities(text) {
  return text.replace(/&quot;/g, "'")
  // .replace(/(<style[^>]*>)([^<]*?)(<\/style>)/g, (_, $1, $2, $3) => {
  //   return $1 + $2.replace(/&quot;/g, '"').replace(/&apos;/g, "'") + $3
  // })
  // .replace(/&quot;/g, "'")
}

async function runSVGRenderer(cmd, args, text) {
  const pdot = spawn(cmd, args, {
    stdio: ["pipe", "pipe", "pipe"],
    shell: true,
  })

  const psvgo = spawn("svgo", ["-i", "-", "-o", "-"], {
    stdio: [pdot.stdout, "pipe", "pipe"],
    shell: true,
  })

  pdot.stdin.write(text)
  pdot.stdin.end()

  const [svgOutput, dotError, svgoError] = await Promise.all([
    collectOutput(psvgo.stdout),
    collectOutput(pdot.stderr),
    collectOutput(psvgo.stderr),
  ])

  // const svgOutput = await collectOutput(psvgo.stdout)
  // const dotError = await collectOutput(pdot.stderr)
  // const svgoError = await collectOutput(psvgo.stderr)

  await Promise.allSettled([waitEnd(psvgo)])

  if (pdot.exitCode === 0 && psvgo.exitCode === 0) {
    return { success: true, content: fixEntities(svgOutput) }
  }

  const output = []
  if (pdot.exitCode !== 0) {
    output.push(`===> ${cmd} error <===`)
    output.push(dotError)
  }
  if (psvgo.exitCode !== 0) {
    output.push("===> svgo error <===")
    output.push(svgoError)
  }

  return { success: false, content: output.join("\n") }
}

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

      const { success, content } = await runSVGRenderer("dot", ["-Tsvg"], text)
      return success
        ? `<figure class="graphviz">${content}</figure>`
        : genko.util.render.asTextBlock(content)
    },
  })
}

function d2Plugin(genko) {
  genko.codex.Executor.register("d2", {
    run: async (text) => {
      let theme = "0"
      const regex = /#\s*theme=(\w+)/gm
      text = text.replace(regex, (_, $1) => {
        theme = $1
        return ""
      })
      let engine = "elk"
      text = text.replace(/#\s*layout=(\w+)/gm, (_, $1) => {
        engine = $1
        return ""
      })
      console.log(engine)
      const { success, content } = await runSVGRenderer(
        "d2",
        ["--pad", "0", "--scale", "0.7", "--layout", engine, "--theme", theme, "-", "-"],
        text,
      )
      return success
        ? `<figure class="d2">${content}</figure>`
        : genko.util.render.asTextBlock(content)
    },
  })
}

hexo.extend.renderer.register("md", "html", async (data) => {
  const genko = require("genko-markdown").default
  genko.registerPlugin(dotPlugin)
  genko.registerPlugin(d2Plugin)

  let { html, digest } = await genko.parse(data.text, {
    digest: true,
    marked: { mangle: false },
  })
  if (digest) {
    html = html + DIGEST_SEP + digest
  }
  return html
})
