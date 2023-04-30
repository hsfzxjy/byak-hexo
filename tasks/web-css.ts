import gulp from "gulp"
import gulpSass from "gulp-sass"

import { BuildAndWatchTasks, namedTask, Options, resolveOptions } from "./util"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sass = gulpSass(require("sass"))

type WebCssOptions = Options<
  typeof sass extends (opts: infer O) => any ? O : never
>

function sassTask(options: WebCssOptions): gulp.TaskFunction {
  return () =>
    gulp
      .src(options.entryPoints)
      .pipe(
        sass({
          outputStyle: "compressed",
          ...options.extra,
        }).on("error", sass.logError)
      )
      .pipe(gulp.dest(options.outDir))
}

export default function (options: WebCssOptions): BuildAndWatchTasks {
  options = resolveOptions(options)
  return [
    namedTask("build:css", sassTask(options)),
    namedTask("watch:css", () =>
      gulp.watch(
        options.watchGlob,
        { ignoreInitial: false },
        namedTask("watch:css:once", sassTask(options))
      )
    ),
  ]
}
