// token-hash.js - Generates a random 32-byte delete token and its SHA-256 hex digest

function toHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createDeleteTokenPair() {
  const rawBytes = new Uint8Array(32);
  crypto.getRandomValues(rawBytes);
  const token = toHex(rawBytes);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return { token, tokenHash: toHex(new Uint8Array(digest)) };
}
