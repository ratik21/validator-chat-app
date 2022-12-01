
/**
 * 0x prefix a string if not prefixed already
 */
export function ensure0xPrefix(hex: string): string {
  if (!hex.startsWith("0x")) hex = `0x${hex}`;
  return hex;
}

export function isValidatePubkeyHex(pubkeyHex: string): boolean {
  return /^0x[0-9a-fA-F]{96}$/.test(pubkeyHex);
}

export function getPubkeyHexFromKeystore(keystore: {pubkey?: string}): string {
  if (!keystore.pubkey) {
    throw Error("Invalid keystore, must contain .pubkey property");
  }

  const pubkeyHex = ensure0xPrefix(keystore.pubkey);
  if (!isValidatePubkeyHex(pubkeyHex)) {
    throw Error(`Invalid keystore pubkey format ${pubkeyHex}`);
  }

  return pubkeyHex;
}