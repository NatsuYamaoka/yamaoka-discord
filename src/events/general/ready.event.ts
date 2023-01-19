import { Client } from "discord.js";
import { BaseEvent } from "../../core/abstracts/event/event.abstract";

export default class ReadyEvent extends BaseEvent<"ready"> {
  eventName = "ready" as const;

  async execute(client: Client<true>) {
    console.log(`${client.user.username} is ready!`);
  }
}
