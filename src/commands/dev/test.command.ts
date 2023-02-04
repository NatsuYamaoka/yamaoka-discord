import { Message } from "discord.js";
import { BaseCommand } from "../../core/abstracts/command/command.abstract";
import { CommandType } from "../../core/abstracts/command/command.types";
import { Quiz } from "../../entities";

export default class TestCommand extends BaseCommand<CommandType.MESSAGE_COMMAND> {
  public options = {
    name: "test",
    allowedUsersOrRoles: [process.env.OWNER],
  };

  public async execute(argument: Message<boolean>): Promise<any> {}
}
