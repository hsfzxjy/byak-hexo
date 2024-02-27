import { spawnSync } from "child_process"
import fancy_log from "fancy-log"
import fs from "fs/promises"
import gulp from "gulp"
import rename from "gulp-rename"
import path from "path"
import rimraf from "rimraf"

import { BYAK_DIR, dist, execFile, glob, namedTask, src } from "./util"

const pyftsubsetAvailable = (() => {
  const p = spawnSync("pyftsubset", ["--help"])
  return p.status == 0
})()

const prefixBaseName = (fn: string, prefix: string) => {
  const d = path.dirname(fn)
  const b = path.basename(fn)
  return path.join(d, `${prefix}${b}`)
}

const stat = async (path: string) => {
  try {
    return await fs.stat(path)
  } catch (e) {
    return false
  }
}

const earlierThan = async (a: string, b: string) => {
  const sa = await stat(a)
  if (!sa) return true
  const sb = await stat(b)
  if (!sb) return false
  return sa.isFile() && sb.isFile() && sa.ctime <= sb.ctime
}

async function subsetSingleFont(
  fontPath: string,
  force: boolean,
  unicodeRanges: [start: number, end: number][],
) {
  const fontDestPath = prefixBaseName(fontPath, "slim.")

  if (!force && (await earlierThan(fontPath, fontDestPath))) return
  fancy_log.info("Subsetting", fontPath)

  const tmpdir = await fs.mkdtemp(path.join(BYAK_DIR, ".font-cache-"))

  try {
    const unicodesPath = path.join(tmpdir, "unicodes")
    const unicodeSpec = unicodeRanges
      .flatMap(([start, end]) =>
        Array.from({ length: end - start + 1 }, (_, k) => {
          const code = k + start
          const hex = code.toString(16).padStart(4, "0")
          return `U+${hex}`
        }),
      )
      .join("\n")
    await fs.writeFile(unicodesPath, unicodeSpec)
    await execFile("pyftsubset", [
      `--unicodes-file=${unicodesPath}`,
      fontPath,
      `--output-file=${fontDestPath}`,
    ])
  } finally {
    await rimraf(tmpdir)
    fancy_log.info("Finish subsetting", fontPath)
  }
}

const subsetFontGlob = src("_fonts/**/*.ttf")
const subsetFontGlobIgnored = ["**/icomoon*", "**/*slim.*"]

async function runSubsetFonts(force = true) {
  if (!pyftsubsetAvailable) {
    fancy_log.info("pyftsubset not available, will copy fonts instead of slimming")
    return gulp
      .src(subsetFontGlob, { ignore: subsetFontGlobIgnored })
      .pipe(
        rename((path: any) => {
          path.basename = "slim." + path.basename
        }),
      )
      .pipe(gulp.dest(src("_fonts")))
  }
  const files = await glob(subsetFontGlob, {
    ignore: subsetFontGlobIgnored,
  })
  return Promise.all(
    files.map((file: string) =>
      subsetSingleFont(file, force, [
        [0x20, 0x7f],
        [0x2018, 0x201d],
      ]),
    ),
  )
}
const subsetFonts = namedTask("build:font:subset", () => runSubsetFonts(false))

function watchSubsetFonts() {
  return gulp.watch(subsetFontGlob, { ignored: subsetFontGlobIgnored, ignoreInitial: false }, () =>
    runSubsetFonts(false),
  )
}

const copyFontGlob = [src("_fonts/**/icomoon*"), src("_fonts/**/slim.*")]

const copyFonts = namedTask("build:font:copy", () =>
  gulp.src(copyFontGlob).pipe(gulp.dest(dist("fonts"))),
)

function watchCopyFonts() {
  return gulp.watch(copyFontGlob, { ignoreInitial: false }, copyFonts)
}

export const watchFont = namedTask("watch:font", gulp.parallel(watchCopyFonts, watchSubsetFonts))

export const buildFont = namedTask("build:font", gulp.series(subsetFonts, copyFonts))
