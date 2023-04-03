import { Base } from "@abstracts/client/client.abstract";
import { Awaitable, ClientEvents } from "discord.js";

export class BaseEvent extends Base {
  name?: keyof ClientEvents;
  once?: boolean;

  execute(args: ClientEvents[keyof ClientEvents]): Awaitable<unknown> {
    throw new Error("Cannot be invoked in parent class");
  }
}
