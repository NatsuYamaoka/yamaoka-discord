import { codeBlock, Message } from "discord.js";
import { inspect } from "util";
import { YamaokaConfig } from "../../../configs";
import { BaseCommand } from "../../core/base/base.command";
import { CommandType } from "../../typings/base-command.types";

export default class EvalCommand extends BaseCommand<CommandType.MESSAGE_COMMAND> {
  public options = {
    name: "eval",
    allowedUsersOrRoles: [YamaokaConfig.owner],
  };

  public async execute(argument: Message<boolean>): Promise<void> {
    const toEval = argument.content.slice(6);
    let executed = await eval(toEval);

    if (typeof executed != "string") executed = inspect(executed);

    argument.reply({
      content: codeBlock("xl", `${executed}`),
    });
  }
}
