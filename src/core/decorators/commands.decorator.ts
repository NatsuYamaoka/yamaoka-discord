import { CmdOpt, CmdType } from "@abstracts/command/command.types";
import { SlashCommandBuilder } from "discord.js";

export function SlashCommand({
  name,
  data,
  description,
  deferReply,
}: CmdOpt<CmdType.SLASH_COMMAND>) {
  return (target: Function) => {
    if (!data) data = new SlashCommandBuilder();

    name = name.toLowerCase();
    deferReply = !!deferReply;

    target.prototype.options = {
      name,
      description,
      deferReply,
      data: data.setName(name).setDescription(description).toJSON(),
    };
  };
}

export function MessageCommand({
  name,
  allowedUsersOrRoles,
}: CmdOpt<CmdType.MESSAGE_COMMAND>) {
  return (target: Function) => {
    name = name.toLowerCase();

    target.prototype.options = { name, allowedUsersOrRoles };
  };
}
