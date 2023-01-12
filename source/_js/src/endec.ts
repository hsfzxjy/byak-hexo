const cryptoObj: Crypto = window.crypto || window.msCrypto
const cryptoSubtle = cryptoObj.subtle || cryptoObj.webkitSubtle
const KNOWN_PREFIX = "<hexo-enhanced-encrytion></hexo-enhanced-encrytion>"

const promises: Array<Promise<any>> = []

export const ENDEC = {
  tryDecryptNode($el: Element, kind: string) {
    const passphase = window.localStorage.getItem(`passphase-${kind}`)
    if (passphase === null) return
    const $cover = $el.querySelector(".cover")!
    $cover.classList.remove("hide")
    promises.push(
      ENDEC.decryptNode($el, passphase).then((ret) => {
        if (!ret) $cover.classList.add("hide")
      })
    )
  },
  async decryptNode($el: Element, passphase: string) {
    if (!$el.classList.contains("encrypted")) return true

    let meta: Array<string> = []
    for (let node of $el.childNodes) {
      if (node.nodeType !== Node.TEXT_NODE) break
      meta.push((node as Text).data)
    }
    const metaStr = meta.join("")
    let [keySalt, ivSalt, encryptedText] = metaStr
      .split(":")
      .slice(1)
      .map((x) => Base64Binary.decode(x))

    const keyMaterial = await getKeyMaterial(passphase)
    const decryptKey = await getDecryptKey(keyMaterial, keySalt)
    const iv = await getIv(keyMaterial, ivSalt)

    let result: ArrayBuffer
    try {
      result = await cryptoSubtle.decrypt(
        {
          name: "AES-CBC",
          iv: iv,
        },
        decryptKey,
        encryptedText.buffer
      )
    } catch (e) {
      console.warn(e)
      return false
    }

    const decoder = new TextDecoder()
    const decoded = decoder.decode(result)

    // check the prefix, if not then we can sure here is wrong password.
    if (!decoded.startsWith(KNOWN_PREFIX)) {
      return false
    }

    $el.classList.remove("encrypted")
    $el.innerHTML = decoded.slice(KNOWN_PREFIX.length)
    return true
  },
}
;(window as any).ENDEC = ENDEC

Promise.all(promises).then(() => {
  const cache = new Map<string, string>()
  const passphases = {
    get(name: string): string {
      if (cache.has(name)) return cache.get(name)!
      const value = window.localStorage.getItem(`passphase-${name}`)
      this.cache.set(name, value)
      return value as string
    },
    set(name: string, value: string) {
      cache.set(name, value)
      window.localStorage.setItem(`passphase-${name}`, value)
    },
    remove(name: string) {
      cache.delete(name)
      window.localStorage.removeItem(`passphase-${name}`)
    },
  }
  type DecryptMeFn = (passphase: string) => void
  const decryptUs = new Map<string, Array<DecryptMeFn>>()
  const addToDecryptUs = (kind: string, f: DecryptMeFn) => {
    if (decryptUs.has(kind)) {
      decryptUs.get(kind)!.push(f)
    } else {
      decryptUs.set(kind, [f])
    }
  }
  const getKind = ($el: Element) =>
    ($el.childNodes[0] as Text).data.split(":")[0]

  document.querySelectorAll("div.post-content.encrypted").forEach(($el) => {
    const kind = getKind($el)
    const decryptMe = (passphase: string) => ENDEC.decryptNode($el, passphase)
    addToDecryptUs(kind, decryptMe)
    const $input: HTMLInputElement = $el.querySelector("input[type=password]")!
    const handler = (evt: Event) => {
      const passphase = $input.value
      decryptMe(passphase)
        .then(async (ret) => {
          if (!ret) {
            alert("Incorrect passphase!")
            return
          }
          await Promise.all(decryptUs.get(kind)!.map((f) => f(passphase)))
          passphases.set(kind, passphase)
        })
        .catch((x) => alert(x))
      evt.preventDefault()
      return false
    }
    $el.querySelector("button")!.addEventListener("click", handler)
    $el.querySelector("form")!.addEventListener("submit", handler)

    const $lgHeader = $el.querySelector("legend.header")!
    const $lgHint = $el.querySelector("legend.hint")!
    const hintText = $lgHeader.getAttribute("data-hint")
    $lgHeader.addEventListener(
      "click",
      () => ($lgHint.innerHTML = "HINT: " + hintText)
    )
  })
})

const _keyStr =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
const Base64Binary = {
  /* will return a Uint8Array type */
  decodeArrayBuffer(input: string) {
    const nbytes = Math.trunc((input.length / 4) * 3)
    const ab = new ArrayBuffer(nbytes)
    Base64Binary.decode(input, ab)

    return ab
  },

  removePaddingChars(input: string) {
    const lkey = _keyStr.indexOf(input.charAt(input.length - 1))
    if (lkey == 64) {
      return input.substring(0, input.length - 1)
    }
    return input
  },

  decode(input: string, arrayBuffer: ArrayBuffer | null = null) {
    //get last chars to see if are valid
    input = Base64Binary.removePaddingChars(input)
    input = Base64Binary.removePaddingChars(input)
    var bytes = Math.trunc((input.length / 4) * 3)

    let uarray: Uint8Array
    let chr1: number, chr2: number, chr3: number
    let enc1: number, enc2: number, enc3: number, enc4: number
    let i = 0
    let j = 0

    if (arrayBuffer) uarray = new Uint8Array(arrayBuffer)
    else uarray = new Uint8Array(bytes)

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "")
    for (i = 0; i < bytes; i += 3) {
      // get the 3 octects in 4 ascii chars
      enc1 = _keyStr.indexOf(input.charAt(j++))
      enc2 = _keyStr.indexOf(input.charAt(j++))
      enc3 = _keyStr.indexOf(input.charAt(j++))
      enc4 = _keyStr.indexOf(input.charAt(j++))

      chr1 = (enc1 << 2) | (enc2 >> 4)
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
      chr3 = ((enc3 & 3) << 6) | enc4

      uarray[i] = chr1
      if (enc3 != 64) uarray[i + 1] = chr2
      if (enc4 != 64) uarray[i + 2] = chr3
    }

    return uarray
  },
}

function getKeyMaterial(passphase: string) {
  let encoder = new TextEncoder()
  return cryptoSubtle.importKey(
    "raw",
    encoder.encode(passphase),
    {
      name: "PBKDF2",
    },
    false,
    ["deriveKey", "deriveBits"]
  )
}

function getDecryptKey(keyMaterial: CryptoKey, keySalt: Uint8Array) {
  return cryptoSubtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: keySalt.buffer,
      iterations: 1024,
    },
    keyMaterial,
    {
      name: "AES-CBC",
      length: 256,
    },
    true,
    ["decrypt"]
  )
}

function getIv(keyMaterial: CryptoKey, ivSalt: Uint8Array) {
  return cryptoSubtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: ivSalt.buffer,
      iterations: 512,
    },
    keyMaterial,
    16 * 8
  )
}

// const Base64Binary = new _Base64Binary()
