import {Keystore} from "@chainsafe/bls-keystore";
import bls from "@chainsafe/bls";
import {SecretKey} from "@chainsafe/bls/types";
import path from "path";

import { ROOT_DIR_PATH } from "./constants.js";
import { readFileSync } from "fs";

/**
 * asserts public key is valid
 * @param pubkeyHex pubkey to validate
 */
function _assertValidPubkeysHex(pubkeyHex: string): void {
  const isValidPubKey = /^0x[0-9a-fA-F]{96}$/.test(pubkeyHex);
  if (!isValidPubKey) {
    throw Error(`Invalid keystore pubkey format ${pubkeyHex}`);
  }
}

/**
 * Returns bls secret key using the imported keystores (from the `ringer import ..` command)
 * @param pubKey public key hex
 */
export async function getBLSSecretKey(pubKey: string): Promise<SecretKey> {
  _assertValidPubkeysHex(pubKey);

  // read imported keystores (using the lodestar cli validator import)
  const keyStorePath = path.join(ROOT_DIR_PATH, "keystores", pubKey, "voting-keystore.json");
  const secretsPath = path.join(ROOT_DIR_PATH, "secrets", pubKey);

  // parse keystore
  const keyStoreStr = readFileSync(keyStorePath, "utf8");
  const keystore = Keystore.parse(keyStoreStr);

  // decrypt using password & get sK
  const password = readFileSync(secretsPath);
  const secretKeyBytes = await keystore.decrypt(password);
  return bls.SecretKey.fromBytes(secretKeyBytes);
}