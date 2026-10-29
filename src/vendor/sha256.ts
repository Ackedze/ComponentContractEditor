// Figma's main plugin sandbox has no constructible TextEncoder. Keep the same
// UTF-8 bytes as TextEncoder/Node, including replacement of unpaired surrogates,
// without adding a global polyfill or relying on browser-only APIs.
function utf8Bytes(input: string): Uint8Array {
  const bytes = new Uint8Array(input.length * 3);
  let length = 0;
  for (let index = 0; index < input.length; index += 1) {
    let codePoint = input.charCodeAt(index);
    if (codePoint >= 0xd800 && codePoint <= 0xdbff) {
      const low = input.charCodeAt(index + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        codePoint = 0x10000 + ((codePoint - 0xd800) << 10) + (low - 0xdc00);
        index += 1;
      } else codePoint = 0xfffd;
    } else if (codePoint >= 0xdc00 && codePoint <= 0xdfff) codePoint = 0xfffd;

    if (codePoint <= 0x7f) {
      bytes[length++] = codePoint;
    } else if (codePoint <= 0x7ff) {
      bytes[length++] = 0xc0 | (codePoint >>> 6);
      bytes[length++] = 0x80 | (codePoint & 0x3f);
    } else if (codePoint <= 0xffff) {
      bytes[length++] = 0xe0 | (codePoint >>> 12);
      bytes[length++] = 0x80 | ((codePoint >>> 6) & 0x3f);
      bytes[length++] = 0x80 | (codePoint & 0x3f);
    } else {
      bytes[length++] = 0xf0 | (codePoint >>> 18);
      bytes[length++] = 0x80 | ((codePoint >>> 12) & 0x3f);
      bytes[length++] = 0x80 | ((codePoint >>> 6) & 0x3f);
      bytes[length++] = 0x80 | (codePoint & 0x3f);
    }
  }
  return bytes.subarray(0, length);
}

// Synchronous SHA-256 shared by baseline capture and deterministic Predicate
// Engine identifiers in both the main Figma sandbox and the UI browser runtime.
export function sha256Hex(input: string): string {
  const rightRotate = (value: number, amount: number) =>
    (value >>> amount) | (value << (32 - amount));
  const maxWord = Math.pow(2, 32);
  const words: number[] = [];
  const hash: number[] = [];
  const constants: number[] = [];
  let primeCounter = 0;
  const isComposite: Record<number, boolean> = {};

  for (let candidate = 2; primeCounter < 64; candidate += 1) {
    if (isComposite[candidate]) continue;
    for (let multiple = candidate * candidate; multiple < 313; multiple += candidate) {
      isComposite[multiple] = true;
    }
    hash[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
    constants[primeCounter] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
    primeCounter += 1;
  }

  const bytes = utf8Bytes(input);
  const bitLength = bytes.length * 8;
  const paddedLength = (((bytes.length + 9 + 63) >> 6) << 6);
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, bitLength >>> 0, false);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / maxWord), false);

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      words[index] = view.getUint32(offset + index * 4, false);
    }
    for (let index = 16; index < 64; index += 1) {
      const w15 = words[index - 15];
      const w2 = words[index - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      words[index] = (words[index - 16] + s0 + words[index - 7] + s1) | 0;
    }

    const working = hash.slice(0, 8);
    for (let index = 0; index < 64; index += 1) {
      const s1 = rightRotate(working[4], 6) ^ rightRotate(working[4], 11) ^ rightRotate(working[4], 25);
      const choice = (working[4] & working[5]) ^ (~working[4] & working[6]);
      const temp1 = (working[7] + s1 + choice + constants[index] + words[index]) | 0;
      const s0 = rightRotate(working[0], 2) ^ rightRotate(working[0], 13) ^ rightRotate(working[0], 22);
      const majority = (working[0] & working[1]) ^ (working[0] & working[2]) ^ (working[1] & working[2]);
      const temp2 = (s0 + majority) | 0;
      working.unshift((temp1 + temp2) | 0);
      working[4] = (working[4] + temp1) | 0;
      working.pop();
    }
    for (let index = 0; index < 8; index += 1) {
      hash[index] = (hash[index] + working[index]) | 0;
    }
  }

  return hash
    .slice(0, 8)
    .map((value) => (value >>> 0).toString(16).padStart(8, '0'))
    .join('');
}
