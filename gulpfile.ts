import gulp from "gulp"

import { buildFont, watchFont } from "./tasks/font"
import { dist, src } from "./tasks/util"
import createWebCss from "./tasks/web-css"
import createWebJs from "./tasks/web-js"

export const [buildJs, watchJs] = createWebJs({
  entryPoints: ["main", "endec", "links"].map((name) =>
    src("_js", "src", `${name}.ts`),
  ),
  outDir: dist("js"),
  watchGlob: [
    src("_js", "**/*.ts"),
    "node_modules/genko-markdown/web/js/codex.ts",
  ],
})

export const [buildCss, watchCss] = createWebCss({
  entryPoints: [src("_css", "style.scss")],
  outDir: dist("css"),
  watchGlob: [
    src("_css", "**/*.scss"),
    "node_modules/genko-markdown/web/css/codex.scss",
  ],
})

export const build = gulp.parallel(buildJs, buildCss, buildFont)
export const watch = gulp.parallel(watchJs, watchCss, watchFont)

export { clean } from "./tasks/clean"
export { init } from "./tasks/init"
