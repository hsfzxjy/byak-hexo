import fancy_log from "fancy-log"
import rimraf from "rimraf"

import { glob, namedTask } from "./util"

export const clean = namedTask("clean", async () => {
  for (const path of await glob("source/dist")) {
    fancy_log.warn("Removing", path)
    await rimraf(path)
  }
  for (const path of await glob("source/_fonts/**/slim.*")) {
    fancy_log.warn("Removing", path)
    await rimraf(path)
  }
})
