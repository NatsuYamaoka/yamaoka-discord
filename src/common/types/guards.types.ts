import { CmdArg, CmdType } from "@abstracts/command/command.types";

export function IsSlashCommand(
  arg: CmdArg<CmdType.MESSAGE_COMMAND> | CmdArg<CmdType.SLASH_COMMAND>
): arg is CmdArg<CmdType.SLASH_COMMAND> {
  return (arg as CmdArg<CmdType.SLASH_COMMAND>).deferReply !== undefined;
}
