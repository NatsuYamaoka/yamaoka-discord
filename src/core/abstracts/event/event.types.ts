import { ClientEvents } from "discord.js";

export type EventArg<T extends keyof ClientEvents> = ClientEvents[T];
