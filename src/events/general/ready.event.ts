import { Client } from "discord.js";
import { BaseEvent } from "../../core";

export default class ReadyEvent extends BaseEvent<"ready"> {
  eventName: "ready" = "ready";

  async execute(client: Client<true>) {
    console.log(`${client.user.username} is ready!`);
  }
}
