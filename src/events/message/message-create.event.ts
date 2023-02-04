import { Message } from "discord.js";
import appConfig from "../../app.config.json";
import { CommandType } from "../../core/abstracts/command/command.types";
import { BaseEvent } from "../../core/abstracts/event/event.abstract";

export default class MessageCreate extends BaseEvent<"messageCreate"> {
  public eventName = "messageCreate" as const;

  public async execute(message: Message<boolean>) {
    const content = message.content.trim().split(" ");

    if (content[0].startsWith(appConfig.prefix)) {
      this.customClient.commandManager.executeCommand(
        content[0].slice(1),
        message,
        CommandType.MESSAGE_COMMAND
      );
    }
  }
}
