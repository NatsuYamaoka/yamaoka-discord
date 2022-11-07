import { Message } from "discord.js";
import appConfig from "../../app.config";
import { BaseEvent } from "../../core";
import { CommandType } from "../../typings/enums";

export default class MessageCreate extends BaseEvent<"messageCreate"> {
  public eventName: "messageCreate" = "messageCreate";

  public async execute(message: Message<boolean>) {
    const content = message.content.trim().split(" ");

    if (content[0].startsWith(appConfig.prefix)) {
      this.yamaokaClient.commandManager.executeCommand(
        content[0].slice(1),
        message,
        CommandType.MESSAGE_COMMAND
      );
    }
  }
}
