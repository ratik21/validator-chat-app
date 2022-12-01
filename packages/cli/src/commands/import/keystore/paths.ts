import path from "node:path";
import { ROOT_DIR_PATH } from 'core';

export type IValidatorPaths = {
  validatorsDbDir: string;
};

export type AccountPaths = {
  keystoresDir: string;
  secretsDir: string;
};



/**
 * Defines the path structure of the account files
 *
 * ```bash
 * $~/.ringer/
 * ├── secrets
 * |   ├── 0x8e41b969493454318c27ec6fac90645769331c07ebc8db5037...
 * |   └── 0xa329f988c16993768299643d918a2694892c012765d896a16f...
 * ├── keystores
 *     ├── 0x8e41b969493454318c27ec6fac90645769331c07ebc8db5037...
 *     |   ├── eth1-deposit-data.rlp
 *     |   ├── eth1-deposit-gwei.txt
 *     |   └── voting-keystore.json
 *     └── 0xa329f988c16993768299643d918a2694892c012765d896a16f...
 *        ├── eth1-deposit-data.rlp
 *        ├── eth1-deposit-gwei.txt
 *        └── voting-keystore.json
 * ```
 */
export function getAccountPaths(
): AccountPaths {
  const keystoresDir = path.join(ROOT_DIR_PATH, "keystores");
  const secretsDir = path.join(ROOT_DIR_PATH, "secrets");
  return {
    keystoresDir,
    secretsDir,
  };
}

