import fs from "node:fs";
import {Keystore} from "@chainsafe/bls-keystore";
import { getPubkeyHexFromKeystore } from "../../../util/format.js";
import {getAccountPaths} from "./paths.js";
import {importKeystoreDefinitionsFromExternalDir, readPassphraseOrPrompt} from "./importExternalKeystores.js";
import {PersistedKeysBackend} from "./persistedKeys.js";


export async function importKeyStores(keyStorePath: string, importKeystoresPassword?: string) {
  // This command takes: importKeystores, importKeystoresPassword
  //
  // - recursively finds keystores in importKeystores
  // - validates keystores can decrypt
  // - writes them in persisted form - do not lock

  // Collect same password for all keystores
  // If importKeystoresPassword is not provided, interactive prompt for it

  const keystoreDefinitions = importKeystoreDefinitionsFromExternalDir({
    keystoresPath: [keyStorePath],
    password: await readPassphraseOrPrompt({ importKeystoresPassword }),
  });

  if (keystoreDefinitions.length === 0) {
    throw new Error("No keystores found");
  }

  console.log(
    `Importing ${keystoreDefinitions.length} keystores:\n ${keystoreDefinitions
      .map((def: any) => def.keystorePath)
      .join("\n")}`
  );

  const accountPaths = getAccountPaths();
  const persistedKeystoresBackend = new PersistedKeysBackend(accountPaths);
  let importedCount = 0;

  for (const {keystorePath, password} of keystoreDefinitions) {
    const keystoreStr = fs.readFileSync(keystorePath, "utf8");
    const keystore = Keystore.parse(keystoreStr);
    const pubkeyHex = getPubkeyHexFromKeystore(keystore);

    // Check if keystore can decrypt
    if (!(await keystore.verifyPassword(password))) {
      throw Error(`Invalid password for keystore ${keystorePath}`);
    }

    const didImportKey = persistedKeystoresBackend.writeKeystore({
      keystoreStr,
      password,
      // Not used immediately
      lockBeforeWrite: false,
      // Return duplicate status if already found
      persistIfDuplicate: false,
    });

    if (didImportKey) {
      console.log(`Imported keystore ${pubkeyHex} ${keystorePath}`);
      importedCount++;
    } else {
      console.log(`Duplicate keystore ${pubkeyHex} ${keystorePath}`);
    }
  }

  console.log(`\nSuccessfully imported ${importedCount}/${keystoreDefinitions.length} keystores`);

    console.log(`
  DO NOT USE THE ORIGINAL KEYSTORES TO VALIDATE WITH
  ANOTHER CLIENT, OR YOU WILL GET SLASHED.
  `);
}





