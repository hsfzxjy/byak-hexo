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

async function runDot(text) {
  const pdot = spawn("dot", ["-Tsvg"], {
    stdio: ["pipe", "pipe", "pipe"],
    shell: true,
  })

  const psvgo = spawn("svgo", ["-i", "-", "-o", "-"], {
    stdio: [pdot.stdout, "pipe", "pipe"],
    shell: true,
  })

  pdot.stdin.write(text)
  pdot.stdin.end()

  const svgOutput = await collectOutput(psvgo.stdout)
  const dotError = await collectOutput(pdot.stderr)
  const svgoError = await collectOutput(psvgo.stderr)

  await Promise.allSettled([waitEnd(psvgo)])

  if (pdot.exitCode === 0 && psvgo.exitCode === 0) {
    return { success: true, content: svgOutput }
  }

  const output = []
  if (pdot.exitCode !== 0) {
    output.push("===> dot error <===")
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

      const { success, content } = await runDot(text)
      return success
        ? `<figure class="graphviz">${content}</figure>`
        : genko.util.render.asTextBlock(content)
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
