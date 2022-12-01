//import {PubkeyHex, SignerDefinition} from "@lodestar/api/keymanager";

export type LocalKeystoreDefinition = {
  keystorePath: string;
  password: string;
};

export interface IPersistedKeysBackend {
  //readAllKeystores(): LocalKeystoreDefinition[];

  /** Returns true some item is written to disk */
  writeKeystore(args: {
    keystoreStr: string;
    password: string;
    lockBeforeWrite: boolean;
    persistIfDuplicate: boolean;
  }): boolean;

  // /** Returns true some item is deleted from disk */
  // deleteKeystore(pubkey: PubkeyHex): boolean;
}
