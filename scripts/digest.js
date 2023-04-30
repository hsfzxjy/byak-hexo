const DIGEST_SEP = "\uFFFF\uFFFE"

hexo.extend.filter.register("after_post_render", function (data) {
  const [content, digest] = data.content.split(DIGEST_SEP, 2)
  data.content = content
  if (digest) {
    data.digest = digest
    data.readmore = true
  } else {
    data.digest = data.content
  }
  return data
})
