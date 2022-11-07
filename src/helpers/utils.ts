import { promisify } from "util";
import { join } from "path";
import glob from "glob";
import { SearchedFiles } from "../typings/helpers";

export const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

export const searchCmdsOrEventsByPath = async <T>(
  path: string,
  totalLoaded = 0
): Promise<SearchedFiles<T> | undefined> => {
  try {
    const loadedFiles = [];
    const globAsync = promisify(glob);
    const finalPath = join(path, "/*.{js,ts}").replace(/\\/g, "/");

    const files = await globAsync(finalPath);

    for (const file of files) {
      const _file = (await import(file)).default;

      loadedFiles.push(_file);
      totalLoaded += 1;
    }

    return {
      files: loadedFiles,
      totalLoaded,
    };
  } catch (err) {
    console.log(err);

    throw new Error("⚠️ ERROR WHEN IMPORTING FILES");
  }
};
