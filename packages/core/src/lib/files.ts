import path from "path";
import fs from "fs";

/**
 * Maybe create a directory
 */
 function mkdir(dirname: string): void {
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, {recursive: true});
}

/**
 * Write a JSON serializable object to a file
 *
 * Serialize to json
 */
function writeFile(filepath: string, obj: unknown): void {
  mkdir(path.dirname(filepath));
  fs.writeFileSync(filepath, JSON.stringify(obj, null, 2));
}

/**
 * Create a file with `600 (-rw-------)` permissions
 * *Note*: 600: Owner has full read and write access to the file,
 * while no other user can access the file
 */
export function writeFile600Perm(filepath: string, obj: unknown): void {
  writeFile(filepath, obj);
  fs.chmodSync(filepath, "0600");
}

export function readFile (path: string): string {
  return fs.readFileSync(path, 'utf-8');
}