hexo.extend.filter.register("before_post_render", (data) => {
  data.lang = data.lang || hexo.config.default_lang || ""
})
