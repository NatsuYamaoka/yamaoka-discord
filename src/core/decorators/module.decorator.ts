import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdType } from "@abstracts/command/command.types";
import { BaseEvent } from "@abstracts/event/event.abstract";
import { ModuleAbstract } from "@abstracts/module/module.abstract";

export function Module({ imports, commands, events }: ModuleOptions) {
  return (target: Function) => {
    target.prototype.commands = commands;
    target.prototype.imports = imports;
    target.prototype.events = events
  };
}

export interface ModuleOptions {
  imports?: typeof ModuleAbstract[];
  commands?: (
    | typeof BaseCommand<CmdType.SLASH_COMMAND>
    | typeof BaseCommand<CmdType.MESSAGE_COMMAND>
  )[];
  events?: typeof BaseEvent[];
}
