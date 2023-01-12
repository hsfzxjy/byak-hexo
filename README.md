# Maupassant

[![Build Status](https://travis-ci.org/tufu9441/maupassant-hexo.svg?branch=master)](https://travis-ci.org/tufu9441/maupassant-hexo)   [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/tufu9441/maupassant-hexo/blob/master/LICENSE)

> 大道至简

[Preview](https://www.haomwei.com)｜[中文文档](https://www.haomwei.com/technology/maupassant-hexo.html)

A simple Hexo template with great performance on different devices, ported from a Typecho theme by [Cho](https://github.com/pagecho/maupassant/), forked and modified from [icylogic](https://github.com/icylogic/maupassant-hexo/).

![template preview](http://ooo.0o0.ooo/2015/10/24/562b5be12177e.jpg
 "Maupassant template preview")
 
## Installation
Install theme and renderers:

```
git clone https://github.com/tufu9441/maupassant-hexo.git themes/maupassant
npm install hexo-renderer-sass --save
npm install hexo-renderer-jade --save
```

Then change your `theme` setting in `_config.yml` to `maupassant`.

## Configuration
Default config:

```
fancybox: true
duoshuo: #duoshuo_shortname
disqus: #disqus_shortname
google_search: true
baidu_search: #baidu_search
swiftype: #swiftype_key
tinysou: #tinysou_key
menu:
  - page: home
    directory: /
    icon: icon-home
  - page: archive
    directory: archives/
    icon: icon-archive
  - page: about
    directory: about/
    icon: icon-about
  - page: rss
    directory: atom.xml
    icon: icon-rss
links:
  - title: site-name1
    url: http://www.example1.com/
  - title: site-name2
    url: http://www.example2.com/
  - title: site-name3
    url: http://www.example3.com/
```
- fancybox - Enable [Fancybox](http://fancyapps.com/fancybox/)
- duoshuo - [Duoshuo](http://duoshuo.com) shortname
- disqus - [Disqus](https://disqus.com) shortname
- google_search - Default search engine
- baidu_search - Search engine for users in China
- swiftype - [Swiftype Search](https://swiftype.com) key 
- tinysou - [Tiny Search](http://tinysou.com) key
- menu - Customize your menu of pages here, just follow the format of existied items. [IcoMoon](https://icomoon.io) icon fonts have been integrated, and you can choose other icons you like [here](https://icomoon.io/app/#/select) and use them according to the  [instruction](https://icomoon.io/#docs)
- links - Edit your blogroll here

##Features
#### Logo
You can set a **favicon.ico** for your website, please put it into  `source` folder of hexo directory, recommended size: 32px*32px.

You can add a website logo for apple devices, please put an image named **apple-touch-icon.png** into `source` folder of hexo directory, recommended size: 114px*114px.

#### Abstract
You can control the abstract of a post shown at index, by either filling a `description:` item in `front-matter` of the `post.md`, or just inserting a `<!--more-->` before your hidden content.

#### Table of Contents
TOC in a post can be enabled by adding a `toc: true` item in `front-matter`.

#### Syntax Highlighting
Highlighted code showcase is supported, please set the `highlight` option in `_config.yml` of hexo directory like this:

```
highlight:
  enable: true
  auto_detect: true
  line_number: true
  tab_replace:
```

#### Languages
Two languages are available for this theme currently, English (en) and Simplified Chinese (zh-CN). Contributions of translating to other languages will be highly appreciated.

## Solutions
- Check whether your Terminal's current directory is in hexo's root directory which contains `source/`, `themes/`, etc.

- If you have any trouble in using this theme, please feel free to open an [issue](https://github.com/tufu9441/maupassant-hexo/issues).

## Contributing
All kinds of contributions (enhancements, new features, documentation & code improvements, issues & bugs reporting) are welcome.

Looking forward to your pull request.

## Acknowledgements
Thank [JamesPan](http://blog.jamespan.me) for his help to improve this theme
. 
## Maupassant on other platforms:
+ Typecho：https://github.com/pagecho/maupassant/
+ Octopress：https://github.com/pagecho/mewpassant/
+ Farbox：https://github.com/pagecho/Maupassant-farbox/
+ Wordpress：https://github.com/iMuFeng/maupassant/
+ Ghost: https://github.com/LjxPrime/maupassant/