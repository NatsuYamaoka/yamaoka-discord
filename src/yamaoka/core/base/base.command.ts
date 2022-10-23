import {
  CommandArguments,
  CommandOptions,
  CommandType,
} from "../../typings/base-command.types";
import { Base } from "./base";

export class BaseCommand<K extends CommandType> extends Base {
  public options: CommandOptions<K>;

  public async execute(argument: CommandArguments<K>) {
    throw new Error("Not implemented");
  }
}
