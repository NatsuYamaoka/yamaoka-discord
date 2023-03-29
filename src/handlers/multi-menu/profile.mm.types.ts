import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { User } from "@entities/user.entity";

export type ProfileMmActionMap = {
  [k: string]: (opt: ProfileMmActionOptions) => Promise<unknown> | unknown;
};

export interface ProfileMmActionOptions {
  arg: CmdArg<CmdType.SLASH_COMMAND>;
  data: User;
}
