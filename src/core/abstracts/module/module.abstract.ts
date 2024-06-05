import { Base } from "@abstracts/client/client.abstract";
import { MixedCommandsArray } from "@abstracts/command/command.types";
import { BaseEvent } from "@abstracts/event/event.abstract";

export class ModuleAbstract extends Base {
  commands?: MixedCommandsArray;
  events?: typeof BaseEvent[];
  imports?: typeof ModuleAbstract[];
}
