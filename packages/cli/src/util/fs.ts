import fs from "node:fs";
import path from "node:path";

/**
 * Find all files recursively in `dirPath`
 */
 export function recursiveLookup(dirPath: string, filepaths: string[] = []): string[] {
  if (fs.statSync(dirPath).isDirectory()) {
    for (const filename of fs.readdirSync(dirPath)) {
      recursiveLookup(path.join(dirPath, filename), filepaths);
    }
  } else {
    filepaths.push(dirPath);
  }

  return filepaths;
}