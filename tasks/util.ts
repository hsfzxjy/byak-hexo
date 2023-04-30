import * as cp from "node:child_process"
import { promisify } from "node:util"

import { glob as glob_ } from "glob"
import gulp from "gulp"
import * as p from "path"

export type Options<ExtraOptions> = {
  entryPoints: string[]
  outDir: string
  watchGlob: gulp.Globs
  extra?: ExtraOptions
}

export type BuildAndWatchTasks = [
  buildTask: gulp.TaskFunction,
  watchTask: gulp.TaskFunction
]

export const glob = promisify(glob_)
export function execFile(bin: string, args: string[]): Promise<void> {
  return new Promise((resolve) => {
    cp.spawn(bin, args, { stdio: "inherit" }).on("exit", () => resolve())
  })
}

const ROOT_DIR = p.resolve(__dirname, "..")
export const BYAK_DIR = ROOT_DIR
export const BYAK_DEV_DIR = p.resolve(ROOT_DIR, "..", "_byak-dev")
export const dist = (...parts: string[]) =>
  p.resolve(ROOT_DIR, "source", "dist", ...parts)
export const src = (...parts: string[]) =>
  p.resolve(ROOT_DIR, "source", ...parts)

export function resolve(path: string): string {
  if (p.isAbsolute(path)) return path
  return p.resolve(ROOT_DIR, path)
}

export function resolveOptions<T>(options: Options<T>): Options<T> {
  return {
    entryPoints: options.entryPoints.map(resolve),
    outDir: resolve(options.outDir),
    watchGlob:
      typeof options.watchGlob === "string"
        ? resolve(options.watchGlob)
        : options.watchGlob.map(resolve),
    extra: options.extra,
  }
}

export function namedTask<T>(name: string, task: T & { displayName?: string }) {
  task.displayName = name
  return task
}
