declare global {
  interface Window {
    msCrypto: Crypto
  }

  interface Crypto {
    webkitSubtle: SubtleCrypto
  }
}

import "./totop"
import "./gh-buttons"
import "./mathjax"
import "./fancybox"
import "./littlefoot"
import "./sidebar"
import "./totop"
import "./weixin"
