function lodashFilter(locals) {
  locals._ = require("lodash")
  return locals
}

hexo.extend.filter.register("template_locals", lodashFilter)
