import gulp from "gulp"
import { createGulpEsbuild, Options as GulpEsbuildOptions } from "gulp-esbuild"

import { BuildAndWatchTasks, namedTask, Options, resolveOptions } from "./util"

type WebJSOptions = Options<GulpEsbuildOptions>

function esbuildTask(
  options: WebJSOptions,
  watchMode: boolean
): gulp.TaskFunction {
  return () =>
    gulp
      .src(options.entryPoints)
      .pipe(
        createGulpEsbuild({ incremental: watchMode })({
          bundle: true,
          sourcemap: true,
          minify: true,
          minifyIdentifiers: true,
          ...options.extra,
        })
      )
      .pipe(gulp.dest(options.outDir))
}

export default function (options: WebJSOptions): BuildAndWatchTasks {
  options = resolveOptions(options)
  return [
    namedTask("build:js", esbuildTask(options, false)),
    namedTask("watch:js", () =>
      gulp.watch(
        options.watchGlob,
        { ignoreInitial: false },
        namedTask("watch:js:once", esbuildTask(options, true))
      )
    ),
  ]
}
