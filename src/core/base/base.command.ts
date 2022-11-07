import { CommandArguments, CommandOptions } from "../../typings/core";
import { CommandType } from "../../typings/enums";
import { Base } from "./base";

export class BaseCommand<K extends CommandType> extends Base {
  public options: CommandOptions<K>;

  public async execute(argument: CommandArguments<K>): Promise<any> {
    throw new Error("Not implemented");
  }
}
