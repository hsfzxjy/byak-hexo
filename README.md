# Byak

Byak is a Hexo theme with opinionated default and yet flexible customizability. It was a redesign and adaptation from Hexo theme [maupassant](https://github.com/tufu9441/maupassant-hexo) developed by [tufu9441](https://github.com/tufu9441), which was further a port of a Typecho theme by [Cho](https://github.com/pagecho/maupassant/).

[maupassant](https://github.com/tufu9441/maupassant-hexo) was a fabulous theme I started to use for [my blog site](https://i.hsfzxjy.site) many years ago. Throughout the time I have added numerous improvement and accessory to it, and gradually it evolved into a heavy divergence against the original codebase. I spent some time to clean up those additions, which are finally re-assembled as this new theme Byak.

Byak comes with a highly opinionated default setting, since it is priortized to compose my own site. Beyond the fact, however, it features a strenuous separation between the theme implementation and customizable accessories, so you should easily modify the fonts, CSS and other components.

## Installation

Install theme and renderers:

```bash
git clone https://github.com/hsfzxjy/byak-hexo.git themes/byak
npm install hexo-renderer-jade --save
```

Then change your `theme` setting in `_config.yml` to `byak`.

Initially, the JS and CSS source code are not built in the cloned codebase, and you compile with the following commands

```bash
cd themes/byak
npm install
gulp init
gulp build
```

## Customization

(TODO)

## License

Byak is licensed under [Apache 2.0 License](./LICENSE). The original repository maupassant is licensed under MIT License, which is also included at [LICENSE.ORIGINAL](./LICENSE.ORIGINAL).
