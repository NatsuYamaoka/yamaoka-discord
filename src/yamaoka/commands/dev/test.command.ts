import { Message } from "discord.js";
import { YamaokaConfig } from "../../../configs";
import { BaseCommand } from "../../core/base/base.command";
import { CommandType } from "../../typings/base-command.types";

export default class TestCommand extends BaseCommand<CommandType.MESSAGE_COMMAND> {
  public options = {
    name: "test",
    allowedUsersOrRoles: [process.env.OWNER],
  };

  public async execute(argument: Message<boolean>): Promise<void> {}
}
