declare global {
  interface Window {
    msCrypto: Crypto
    ENDEC: {
      decryptEager: ($el: HTMLElement, kind: string) => void
      onCleartext: (fn: ($el: HTMLElement) => any) => void
    }
    MathJax: any
  }

  interface Crypto {
    webkitSubtle: SubtleCrypto
  }
}

import "./gh-buttons"
import "./mathjax"
import "./littlefoot"
import "./sidebar"
import "./totop"
import "./weixin"
import "./toc"
import "./codex"
