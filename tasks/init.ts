import escapeHTML from "escape-html"
import gulp from "gulp"
import fetch2 from "node-fetch"
import path from "path"
import * as unzipper from "unzipper"

import { BYAK_DEV_DIR, namedTask } from "./util"

export const initBasic = namedTask("init:basic", () =>
  gulp.src("_dev-scaffold/**/*").pipe(
    gulp.dest(BYAK_DEV_DIR, {
      overwrite: false,
    })
  )
)

const downloadFont = (fontname: string) => {
  const url = `https://fonts.google.com/download?family=${escapeHTML(fontname)}`
  const dirname = fontname.replace(" ", "_")
  const task = async () => {
    const resp = await fetch2(url)
    resp.body.pipe(
      unzipper.Extract({
        path: path.join(BYAK_DEV_DIR, "source", "_fonts", dirname),
      })
    )
  }
  task.displayName = `download:font:${dirname}`
  return task
}

const externalFontNames = ["Life Savers", "Open Sans", "Literata"]

export const initFonts = namedTask(
  "init:font",
  gulp.parallel(externalFontNames.map(downloadFont))
)

export const init = gulp.series(initBasic, initFonts)
