import { BaseEvent } from "@abstracts/event/event.abstract";
import { EventArg } from "@abstracts/event/event.types";
import { ClientEvent } from "@decorators/events.decorator";
import appConfig from "@app/app.config";
import { ChannelType } from "discord.js";
import { userService } from "@app/services/user.service";

@ClientEvent({ name: "messageCreate" })
export class MessageCreateEvent extends BaseEvent {
  public async execute([message]: EventArg<"messageCreate">) {
    const [cmdName] = message.content.trim().split(" ");

    const isBot = message.author.bot; // Good to filer bots, but it will create inaccuracy of bot's messages
    const isDM = message.channel.type === ChannelType.DM;

    if (isBot || isDM) {
      return;
    }

    const userDb = await userService.findOneByIdOrCreate(message.author.id);
    userDb.messages_sent += 1;
    // TODO: Add experience points to user
    await userDb.save();

    if (cmdName.startsWith(appConfig.prefix)) {
      this.client.commandManager.executeCommand(cmdName.slice(1), message);
    }
  }
}
