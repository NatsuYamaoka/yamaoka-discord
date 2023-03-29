import { Base } from "@abstracts/client/client.abstract";
import { CmdArg, CmdOpt, CmdType } from "@abstracts/command/command.types";
import { CustomClient } from "@client/custom-client";

export class BaseCommand<K extends CmdType> extends Base {
  options?: CmdOpt<K>;

  constructor(client: CustomClient) {
    super(client);
  }

  execute(arg: CmdArg<K>): Promise<unknown> | unknown {
    throw new Error("Cannot be invoked in parent class");
  }
}
