import { encrypt, decrypt } from 'sjcl'

// I honestly know nothing about security and encryption so...

const params = { // default parameters, taken out to save space on DB.
  v: 1,
  iter: 10000,
  ks: 128,
  ts: 64,
  mode: 'ccm',
  cipher: 'aes'
}

export function customEncrypt (message: string): Encrypted {
  const key = process.env.ENCRYPTION_KEY
  const encrypted = encrypt(key!, message)
  const encryptedObject = JSON.parse(encrypted as unknown as string)
  return {
    cipherText: encryptedObject.ct,
    initializeVector: encryptedObject.iv,
    salt: encryptedObject.salt
  }
}

export function customDecrypt (crypted: Encrypted): string {
  const key = process.env.ENCRYPTION_KEY
  const encryptedObject = {
    ct: crypted.cipherText,
    iv: crypted.initializeVector,
    salt: crypted.salt,
    ...params
  }
  const encrypted = JSON.stringify(encryptedObject)
  const decrypted = decrypt(key!, encrypted)
  return decrypted
}

interface Encrypted {
  cipherText: string,
  initializeVector: string,
  salt: string
}
