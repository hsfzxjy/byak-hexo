function discussionText(discussion, lang) {
  if (lang === undefined) {
    lang = "zh"
  }
  if (discussion.length === 0) return ""
  const asLink = (obj) => `<a href="${obj.url}">${obj.title}</a>`
  if (lang === "zh") {
    if (discussion.length === 1) {
      return `查看本文在 ${asLink(discussion[0])} 上的讨论。`
    } else {
      return `查看本文在 ${discussion
        .slice(0, -1)
        .map(asLink)
        .join("、")} 和 ${asLink(discussion.slice(-1)[0])} 上的讨论。`
    }
  } else if (lang === "en") {
    if (discussion.length === 1) {
      return `See the discussion of this article on ${asLink(discussion[0])}.`
    } else {
      return `See the discussion of this article on ${discussion
        .slice(0, -1)
        .map(asLink)
        .join(", ")} and ${asLink(discussion.slice(-1)[0])}.`
    }
  }
  return ""
}

hexo.extend.helper.register("discussion_text", discussionText)
