import fancy_log from "fancy-log"
import rimraf from "rimraf"

import { dist, glob, namedTask, src } from "./util"

export const clean = namedTask("clean", async () => {
  for (const path of await glob(dist())) {
    fancy_log.warn("Removing", path)
    await rimraf(path)
  }
  for (const path of await glob(src("_fonts", "**", "slim.*"))) {
    fancy_log.warn("Removing", path)
    await rimraf(path)
  }
})
