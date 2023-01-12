const gulp = require("gulp")
const path = require("path")
const fs = require("fs")
const fancy_log = require("fancy-log")
const fetch = require("node-fetch")
const unzipper = require("unzipper")

/* Scaffold Tasks */

const BYAK_DIR = process.env["PWD"] || __dirname
const THEMES_DIR = path.dirname(BYAK_DIR)
const BYAK_DEV_DIR = path.join(THEMES_DIR, "_byak-dev")
console.log(BYAK_DIR, THEMES_DIR, BYAK_DEV_DIR)

function initDev() {
  return gulp.src("_dev-scaffold/**/*").pipe(
    gulp.dest(BYAK_DEV_DIR, {
      overwrite: false,
    })
  )
}
initDev.displayName = "init:dev-directory"

const downloadFont = (fontname) => {
  const url = `https://fonts.google.com/download?family=${escape(fontname)}`
  const dirname = fontname.replace(" ", "_")
  const task = async () => {
    const resp = await fetch(url)
    await resp.body.pipe(
      unzipper.Extract({
        path: path.join(BYAK_DEV_DIR, "source", "_fonts", dirname),
      })
    )
  }
  task.displayName = `download:font:${dirname}`
  return task
}

const externalFontNames = ["Life Savers", "Open Sans", "Literata"]

exports.initFonts = gulp.parallel(externalFontNames.map(downloadFont))
exports.initFonts.displayName = "init:font"

exports.initBasic = initDev
exports.initBasic.displayName = "init:basic"

exports.init = gulp.series(exports.initBasic, exports.initFonts)

/* Javascript Bundle Tasks */

const browserify = require("browserify")
const source = require("vinyl-source-stream")
const watchify = require("watchify")
const terser = require("gulp-terser")
const tsify = require("tsify")
const sourcemaps = require("gulp-sourcemaps")
const buffer = require("vinyl-buffer")

const src = (...paths) => path.join(BYAK_DIR, "source", ...paths)
const dist = (...paths) => src("dist", ...paths)

function bundleJS(entry, watch) {
  const browserifyObj = browserify({
    basedir: src("_js"),
    debug: true,
    entries: [src("_js", "src", `${entry}.ts`)],
    cache: {},
    packageCache: {},
  }).plugin(tsify)

  const runBrowserify = (obj) =>
    obj
      .bundle()
      .on("error", fancy_log)
      .pipe(source(`${entry}.js`))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(terser())
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest(dist("js")))

  const task = () => {
    let obj = browserifyObj
    if (watch) {
      obj = watchify(obj)
      obj.on("update", () => runBrowserify(browserifyObj))
      obj.on("log", fancy_log)
    }
    return runBrowserify(obj)
  }
  task.displayName = `bundle:${entry}:${watch ? "watched" : "once"}`
  return task
}

const javascriptEntries = ["main", "endec"]
const bundleJSAll = (watch) =>
  gulp.parallel(javascriptEntries.map((entry) => bundleJS(entry, watch)))

exports.buildJS = bundleJSAll(false)
exports.buildJS.displayName = "build:js"

/* CSS Bundle Task */

const sass = require("gulp-sass")(require("sass"))

function bundleCSS(watch) {
  const runTask = () =>
    gulp
      .src(src("_css", "style.scss"))
      .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
      .pipe(gulp.dest(dist("css")))
  runTask.displayName = "bundle:css:once"

  let task = runTask
  if (watch) {
    task = () => gulp.watch(src("_css", "**", "*.scss"), runTask)
    task.displayName = `bundle:css:watched`
  }

  return task
}
exports.buildCSS = bundleCSS(false)
exports.buildCSS.displayName = "build:css"

/* Font Task */

const cp = require("child_process")
const util = require("util")
const glob = require("glob")
const rimraf = util.promisify(require("rimraf"))
const rename = require("gulp-rename")
const stat = util.promisify(fs.stat)

const earlierThan = async (a, b) => {
  if (!fs.existsSync(a)) return true
  if (!fs.existsSync(b)) return false
  const sa = await stat(a)
  const sb = await stat(b)
  return sa.isFile() && sb.isFile() && sa.ctime <= sb.ctime
}

const prefixBaseName = (fn, prefix) => {
  const d = path.dirname(fn)
  const b = path.basename(fn)
  return path.join(d, `${prefix}${b}`)
}

const pyftsubsetAvailable = (() => {
  const p = cp.spawnSync("pyftsubset", ["--help"])
  return p.status == 0
})()

async function subsetSingleFont(
  fontPath,
  force,
  unicodeRanges = [[0x20, 0x7f]]
) {
  const fontDestPath = prefixBaseName(fontPath, "slim.")

  if (!force && (await earlierThan(fontPath, fontDestPath))) return
  fancy_log.info("Subsetting", fontPath)

  const tmpdir = await util.promisify(fs.mkdtemp)(
    path.join(BYAK_DIR, ".font-cache-")
  )

  try {
    const unicodesPath = path.join(tmpdir, "unicodes")
    const unicodeSpec = unicodeRanges
      .flatMap(([start, end]) =>
        Array.from({ length: end - start + 1 }, (_, k) => {
          const code = k + start
          const hex = code.toString(16).padStart(4, "0")
          return `U+${hex}`
        })
      )
      .join("\n")
    await util.promisify(fs.writeFile)(unicodesPath, unicodeSpec)
    await util.promisify(cp.execFile)("pyftsubset", [
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
const subsetFontGlobIgnored = ["**/icomoon*", "**/*slim.*", "**/*Variable*"]

async function subsetFonts(force = true) {
  if (!pyftsubsetAvailable) {
    fancy_log.info(
      "pyftsubset not available, will copy fonts instead of slimming"
    )
    return gulp
      .src(subsetFontGlob, { ignore: subsetFontGlobIgnored })
      .pipe(
        rename((path) => {
          path.basename = "slim." + path.basename
        })
      )
      .pipe(gulp.dest(src("_fonts")))
  }
  const files = await util.promisify(glob)(subsetFontGlob, {
    ignore: subsetFontGlobIgnored,
  })
  return Promise.all(files.map((file) => subsetSingleFont(file, force)))
}
subsetFonts.displayName = "build:font:subset"

function watchSubsetFonts() {
  let first = false
  return gulp.watch(
    subsetFontGlob,
    { ignored: subsetFontGlobIgnored, ignoreInitial: false },
    function subsetFontsWatched() {
      const force = !first
      first = true
      return subsetFonts(force)
    }
  )
}

const copyFontGlob = [src("_fonts/**/icomoon*"), src("_fonts/**/slim.*")]

async function copyFonts() {
  // await rimraf(dist("fonts/**/*"))
  return gulp.src(copyFontGlob).pipe(gulp.dest(dist("fonts")))
}
copyFonts.displayName = "build:font:copy"

function watchCopyFonts() {
  return gulp.watch(copyFontGlob, { ignoreInitial: false }, copyFonts)
}

const watchFonts = gulp.parallel(watchCopyFonts, watchSubsetFonts)
watchFonts.displayName = "build:font:watch"

exports.buildFont = gulp.series(subsetFonts, copyFonts)
exports.buildFont.displayName = "build:font"

exports.build = gulp.parallel(
  exports.buildCSS,
  exports.buildJS,
  exports.buildFont
)
exports.watch = gulp.parallel(bundleJSAll(true), bundleCSS(true), watchFonts)
