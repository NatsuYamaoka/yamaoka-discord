import { ClientOptions } from "discord.js";

export type CustomClientOptions = {
  core: ClientOptions;
  token: string
};
