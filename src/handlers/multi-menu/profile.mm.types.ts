import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { UserEntity } from "@entities/user/user.entity";
import { ActionRowBuilder, ButtonBuilder, User } from "discord.js";

export type ProfileMmActionMap = {
  [k: string]: (opt: ProfileMmActionOptions) => Promise<unknown> | unknown;
};

export interface ProfileMmActionOptions {
  arg: CmdArg<CmdType.SLASH_COMMAND>;
  user: User;
  data: UserEntity;
  components: ActionRowBuilder<ButtonBuilder>[];
}
