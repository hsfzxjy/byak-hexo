import gulp from "gulp"

import { buildFont, cnFont, watchFont } from "./tasks/font"
import { dist, src } from "./tasks/util"
import createWebCss from "./tasks/web-css"
import createWebJs from "./tasks/web-js"

export const [buildJs, watchJs] = createWebJs({
  entryPoints: ["main", "endec", "links"].map((name) => src("_js", "src", `${name}.ts`)),
  outDir: dist("js"),
  watchGlob: [
    "source/_js/**/*.ts",
    "source/_js/**/*.js",
    "node_modules/genko-markdown/web/js/codex.ts",
  ],
})

export const [buildCss, watchCss] = createWebCss({
  entryPoints: [src("_css", "style.scss")],
  outDir: dist("css"),
  watchGlob: [
    "source/_css/**/*.scss",
    "node_modules/genko-markdown/web/css/codex.scss",
    "../_byak-dev/**/*.scss",
  ],
})

export { cnFont } from "./tasks/font"

export const build = gulp.parallel(buildCss, buildFont, gulp.series(cnFont, buildJs))
export const watch = gulp.parallel(watchJs, watchCss, watchFont)

export { clean, cleanSlim } from "./tasks/clean"
export { init } from "./tasks/init"
