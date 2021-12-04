const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = require('base-x')(alphabet);

const littleEndian = true;

function keyToMask(key) {
  return key | (key << 8) | (key << 16) | (key << 24);
}

function createKey() {
  return Math.floor(Math.random() * 0xff);
}

function encode(id, key) {
  // use a single byte key to make the encoded id look more random.
  const encoded = id ^ keyToMask(key);
  // prepend the key to the encoded id.
  const buffer = new ArrayBuffer(1 + 4);
  const view = new DataView(buffer);
  view.setUint8(0, key, littleEndian);
  view.setUint32(1, encoded, littleEndian);
  // encode the key to base62
  return base62.encode(Buffer.from(buffer));
}

function decode(encodedId) {
  let buffer = base62.decode(encodedId);
  buffer = new Uint8Array(buffer).buffer;
  if (buffer.byteLength !== 5) {
    throw Error('invalid encoding');
  }
  const view = new DataView(buffer);
  const key = view.getUint8(0, littleEndian);
  const encoded = view.getUint32(1, littleEndian);
  const id = encoded ^ keyToMask(key);
  return { id, key };
}

module.exports = {
  createKey,
  encode,
  decode
};
