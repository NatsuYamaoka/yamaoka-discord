import { promisify } from "util";
import { join } from "path";
import glob from "glob";

export const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

export const searchCmdsOrEventsByPath = async <T>(
  path: string
): Promise<T[] | undefined> => {
  try {
    const globAsync = promisify(glob);
    const finalPath = join(path, "/*.{js,ts}").replace(/\\/g, "/");

    const foundFilePaths = await globAsync(finalPath);

    const importedFiles = await Promise.all(
      foundFilePaths.map((path) => import(path))
    );

    return importedFiles.map((file) => file.default);
  } catch (err) {
    console.log(err);

    throw new Error(`Can't import files for path: ${path}`);
  }
};
