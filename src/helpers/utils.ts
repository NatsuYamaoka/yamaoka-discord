import {
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import { promisify } from "util";
import { join } from "path";
import glob from "glob";

export const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

export const loadSlashCommands = async (
  body: RESTPostAPIApplicationCommandsJSONBody[]
) => {
  if (!process.env.TOKEN)
    throw new Error("Cannot load ( / ) commands, no TOKEN in env");

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  await rest.put(Routes.applicationCommands(process.env.CLIENTID as string), {
    body,
  });
};

export const importFiles = async <T>(
  path: string,
  totalLoaded = 0
): Promise<ImportFilesReturn<T> | undefined> => {
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

interface ImportFilesReturn<T> {
  totalLoaded: number;
  files: T[];
}
