import { Message } from "discord.js";
import { BaseCommand } from "../../core";
import { CommandType } from "../../typings/enums";

export default class TestCommand extends BaseCommand<CommandType.MESSAGE_COMMAND> {
  public options = {
    name: "test",
    allowedUsersOrRoles: [process.env.OWNER],
  };

  public async execute(argument: Message<boolean>): Promise<void> {}
}
