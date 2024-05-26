import { docReady } from "./util"

enum State {
  encrypted,
  decrypting,
  cleartext,
}

namespace State {
  export type Terminal = State.encrypted | State.cleartext
}

type Kind = string

type Meta = {
  kind: Kind
  keySalt: Uint8Array
  ivSalt: Uint8Array
  content: Uint8Array
}

class Nodes<T extends { $el: HTMLElement }> {
  private store = new Map<Kind, T[]>()
  private el2node = new Map<HTMLElement, T>()
  get($el: HTMLElement): T | undefined {
    return this.el2node.get($el)
  }
  put(kind: Kind, node: T) {
    const arr = this.store.get(kind) ?? []
    arr.push(node)
    this.store.set(kind, arr)
    this.el2node.set(node.$el, node)
  }
  mapKind<R>(kind: Kind, f: (node: T) => R): R[] {
    return this.store.get(kind)!.map(f)
  }
  forEachAll(f: (node: T) => void): void {
    for (const node of this.el2node.values()) {
      f(node)
    }
  }
}

const nodes = new Nodes<EncryptedNode>()

class EncryptedNode {
  private state: State
  private promise?: Promise<State.Terminal>
  private meta: Meta
  private listeners: cleartext.ListenerFn[]

  static of($el: HTMLElement): EncryptedNode {
    return nodes.get($el) ?? new EncryptedNode($el)
  }

  private constructor(public readonly $el: HTMLElement) {
    if ($el.classList.contains("encrypted")) {
      this.state = State.encrypted
      this.promise = Promise.resolve(State.cleartext)
      this.meta = this.getMeta()
    } else {
      this.state = State.cleartext
      this.meta = { kind: "" } as Meta
    }
    nodes.put(this.meta.kind, this)
    this.listeners = cleartext.listeners.slice()
    this.emitListeners()
  }

  addListener(fn: cleartext.ListenerFn) {
    this.listeners.push(fn)
    this.emitListeners()
  }

  private emitListeners() {
    if (this.state !== State.cleartext) return
    this.listeners.forEach((fn) => fn(this.$el))
    this.listeners.length = 0
  }

  private getPassphase(kind?: string): string | null {
    return window.localStorage.getItem(`passphase-${kind}`)
  }

  decrypt(opts: { kind?: string; passphase?: string }): Promise<State.Terminal> {
    switch (this.state) {
      case State.decrypting:
        if (!this.promise) throw new Error("bad state")
        return this.promise.then((state) => {
          if (state !== State.cleartext) return this.decrypt(opts)
          return state
        })
      case State.cleartext:
        return Promise.resolve(State.cleartext)
    }
    this.state = State.decrypting
    const $cover = this.$el.querySelector(".cover")!
    $cover.classList.remove("hide")
    const passphase = opts.passphase ?? this.getPassphase(opts.kind) ?? ""
    this.promise = this._decrypt(passphase).then((state) => {
      this.promise = undefined
      this.state = state
      this.emitListeners()
      $cover.classList.add("hide")
      return state
    })
    return this.promise
  }

  private getMeta(): Meta {
    const meta: Array<string> = []
    for (const node of this.$el.childNodes) {
      if (node.nodeType !== Node.TEXT_NODE) break
      meta.push((node as Text).data)
    }
    const [kind, keySalt, ivSalt, content] = meta.join("").split(":")

    return {
      kind,
      keySalt: Base64.decode(keySalt),
      ivSalt: Base64.decode(ivSalt),
      content: Base64.decode(content),
    }
  }

  private async _decrypt(passphase: string): Promise<State.Terminal> {
    const { keySalt, ivSalt, content } = this.meta
    const { $el } = this

    const keyMaterial = await cryptoUtil.getKeyMaterial(passphase)
    const decryptKey = await cryptoUtil.getDecryptKey(keyMaterial, keySalt)
    const iv = await cryptoUtil.getIv(keyMaterial, ivSalt)

    let result: ArrayBuffer
    const algorithm = {
      name: "AES-CBC",
      iv: iv,
    }
    try {
      result = await cryptoUtil.subtle.decrypt(algorithm, decryptKey, content.buffer)
    } catch (e) {
      console.warn(e)
      return State.encrypted
    }

    const decoder = new TextDecoder()
    const decoded = decoder.decode(result)

    // check the prefix, if not then we can sure here is wrong password.
    if (!decoded.startsWith(cryptoUtil.KNOWN_PREFIX)) {
      return State.encrypted
    }

    $el.classList.remove("encrypted")
    $el.innerHTML = decoded.slice(cryptoUtil.KNOWN_PREFIX.length)
    return State.cleartext
  }

  initForm() {
    switch (this.state) {
      case State.encrypted:
        this._initForm()
        return
      case State.decrypting:
        if (!this.promise) throw new Error("bad state")
        this.promise.then(() => this.initForm())
        return
    }
  }

  private _initForm() {
    const { $el } = this
    const { kind } = this.meta
    const $input: HTMLInputElement = $el.querySelector("input[type=password]")!
    const handler = async (evt: Event) => {
      evt.preventDefault()
      const passphase = $input.value
      const state = await this.decrypt({ passphase })
      if (state === State.encrypted) {
        alert("Incorrect passphase!")
        return
      }
      await Promise.all(nodes.mapKind(kind, (node) => node.decrypt({ passphase })))
      window.localStorage.setItem(`passphase-${kind}`, passphase)
      return false
    }
    $el.querySelector("button")!.addEventListener("click", handler)
    $el.querySelector("form")!.addEventListener("submit", handler)

    const $lgHeader = $el.querySelector("legend.header")!
    const $lgHint = $el.querySelector("legend.hint")!
    const hintText = $lgHeader.getAttribute("data-hint")
    $lgHeader.addEventListener("click", () => {
      $lgHint.innerHTML = "HINT: " + hintText
    })
  }
}

namespace cleartext {
  export type ListenerFn = (node: HTMLElement) => any
  export const listeners: ListenerFn[] = []
}

window.ENDEC = {
  decryptEager($el: HTMLElement, kind: Kind) {
    EncryptedNode.of($el).decrypt({ kind })
  },
  onCleartext(fn: cleartext.ListenerFn) {
    cleartext.listeners.push(fn)
    nodes.forEachAll((node) => node.addListener(fn))
  },
}

docReady(() => {
  document
    .querySelectorAll("div.post__content")
    .forEach(($el) => EncryptedNode.of($el as HTMLElement).initForm())
})

namespace Base64 {
  const _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

  function removePaddingChars(input: string) {
    const lkey = _keyStr.indexOf(input.charAt(input.length - 1))
    if (lkey == 64) {
      return input.substring(0, input.length - 1)
    }
    return input
  }

  export function decode(input: string, arrayBuffer: ArrayBuffer | null = null): Uint8Array {
    //get last chars to see if are valid
    input = removePaddingChars(input)
    input = removePaddingChars(input)
    const bytes = Math.trunc((input.length / 4) * 3)

    let uarray: Uint8Array
    let chr1: number, chr2: number, chr3: number
    let enc1: number, enc2: number, enc3: number, enc4: number
    let i = 0
    let j = 0

    if (arrayBuffer) uarray = new Uint8Array(arrayBuffer)
    else uarray = new Uint8Array(bytes)

    input = input.replace(/[^A-Za-z0-9+/=]/g, "")
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
  }
}

namespace cryptoUtil {
  const cryptoObj: Crypto = window.crypto || window.msCrypto
  export const subtle = cryptoObj.subtle || cryptoObj.webkitSubtle
  export const KNOWN_PREFIX = "<hexo-enhanced-encrytion></hexo-enhanced-encrytion>"

  export function getKeyMaterial(passphase: string) {
    const encoder = new TextEncoder()
    return subtle.importKey(
      "raw",
      encoder.encode(passphase),
      {
        name: "PBKDF2",
      },
      false,
      ["deriveKey", "deriveBits"],
    )
  }

  export function getDecryptKey(keyMaterial: CryptoKey, keySalt: Uint8Array) {
    return subtle.deriveKey(
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
      ["decrypt"],
    )
  }

  export function getIv(keyMaterial: CryptoKey, ivSalt: Uint8Array) {
    return subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt: ivSalt.buffer,
        iterations: 512,
      },
      keyMaterial,
      16 * 8,
    )
  }
}
