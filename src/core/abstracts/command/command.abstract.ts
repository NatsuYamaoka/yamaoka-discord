import { Base } from "../client/client.abstract";
import {
  CommandArguments,
  CommandOptions,
  CommandType,
} from "./types/command.types";

export class BaseCommand<K extends CommandType> extends Base {
  public options: CommandOptions<K>;

  public async execute(argument: CommandArguments<K>): Promise<any> {
    throw new Error("Not implemented");
  }
}
