hexo.extend.filter.register("before_post_render", (data) => {
  data.extra_classes = data.extra_classes || []
})
