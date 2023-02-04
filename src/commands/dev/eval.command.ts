import { codeBlock, Message } from "discord.js";
import { inspect } from "util";
import { BaseCommand } from "../../core/abstracts/command/command.abstract";
import { CommandType } from "../../core/abstracts/command/command.types";

export default class EvalCommand extends BaseCommand<CommandType.MESSAGE_COMMAND> {
  public options = {
    name: "eval",
    allowedUsersOrRoles: [process.env.OWNER],
  };

  public async execute(argument: Message<boolean>): Promise<void> {
    const toEval = argument.content.slice(6);
    let executed = await eval(toEval);

    if (typeof executed != "string") {
      executed = inspect(executed);
    }

    argument.reply({ content: codeBlock("xl", `${executed}`) });
  }
}
