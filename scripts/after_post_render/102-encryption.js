const crypto = require("node:crypto")
const seedrandom = require("seedrandom")

// DONOT FIX the misspelled "encrytion"
const KNOWN_PREFIX = "<hexo-enhanced-encrytion></hexo-enhanced-encrytion>"

function getSalt(seed, nbytes = 16) {
  const seedPrefix = hexo.config.encryption.seed_prefix || "BYAK_RNG"
  const rng = seedrandom(seedPrefix + seed)
  return Buffer.from(new Uint8Array(Array.from({ length: nbytes }, () => rng.int32())))
}

function encryptPost(data) {
  if (data.layout !== "post") return

  const encryptionKind = data.encryption
  if (encryptionKind === undefined) return

  const pwdCfg = hexo.config.encryption.keys[encryptionKind]
  if (pwdCfg === undefined) throw Error(`unknown encrytion kind ${encryptionKind}`)

  const encrypted = (data.encrypted = {
    kind: encryptionKind,
    compose: function (text) {
      const ret = [this.kind, this.keySalt, this.ivSalt, text].join(":")
      return ret
    },
  })

  const { password, hint } = pwdCfg
  encrypted.hint = hint

  const keySalt = getSalt(data.uid + "key", 16)
  const ivSalt = getSalt(data.uid + "iv", 16)
  const key = crypto.pbkdf2Sync(password, keySalt, 1024, 32, "sha256")
  const iv = crypto.pbkdf2Sync(password, ivSalt, 512, 16, "sha256")
  encrypted.keySalt = keySalt.toString("base64")
  encrypted.ivSalt = ivSalt.toString("base64")

  let cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
  let encryptedData = cipher.update(KNOWN_PREFIX + data.content, "utf8")
  encryptedData = Buffer.concat([encryptedData, cipher.final()])
  encrypted.composedContent = encrypted.compose(encryptedData.toString("base64"))

  cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
  let encryptedDigest = cipher.update(KNOWN_PREFIX + data.digest, "utf8")
  encryptedDigest = Buffer.concat([encryptedDigest, cipher.final()])
  encrypted.composedDigest = encrypted.compose(encryptedDigest.toString("base64"))

  data.extra_classes.push("encrypted")
}

hexo.extend.filter.register("after_post_render", encryptPost, 102)
