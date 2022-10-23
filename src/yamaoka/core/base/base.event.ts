import { Base } from "./base";
import { ClientEvents } from "discord.js";

export class BaseEvent<T extends keyof ClientEvents> extends Base {
  public eventName: T;
  public execute(...args: ClientEvents[T]) {
    throw new Error("Not implemented");
  }
}
