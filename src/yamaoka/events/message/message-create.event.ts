import { Message } from "discord.js";
import { YamaokaConfig } from "../../../configs";
import { BaseEvent } from "../../core/base/base.event";
import { CommandType } from "../../typings/base-command.types";

export default class MessageCreate extends BaseEvent<"messageCreate"> {
  public eventName: "messageCreate" = "messageCreate";

  public async execute(message: Message<boolean>) {
    const content = message.content.trim().split(" ");

    if (content[0].startsWith(YamaokaConfig.prefix)) {
      this.yamaokaClient.commandManager.executeCommand(
        content[0].slice(1),
        message,
        CommandType.MESSAGE_COMMAND
      );
    }
  }
}
