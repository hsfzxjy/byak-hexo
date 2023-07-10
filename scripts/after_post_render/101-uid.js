const { createHash } = require("node:crypto")

function makeUid(data) {
  if (data.layout !== "post") return
  const hasher = createHash("sha256")
  hasher.update(data.content)
  const uid = hasher.digest("hex")
  data.uid = uid
}

hexo.extend.filter.register("after_post_render", makeUid, 101)
