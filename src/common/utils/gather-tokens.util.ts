import { UserEntity } from "@entities/index";
import { GuildMember, User } from "discord.js";
import { convertMilisToString } from "./converter.util";

interface TokensProps {
  availableTokens: string[];
  tokens: { [k: string]: string | number };
}

export function gatherProfileTokens(
  userDB: UserEntity,
  user: User,
  member?: GuildMember
): TokensProps {
  // ? Add tokens if needed
  const tokens = {
    "user.avatar": user.displayAvatarURL(),
    "user.name": user.globalName || user.username,
    "user.display_name": member?.displayName || user.username,
    "user.id": user.id,
    "user.joined_discord": Math.floor(user.createdTimestamp / 1000),
    "user.joined_server": Math.floor((member?.joinedTimestamp || 0) / 1000),
    "user.roles":
      member?.roles?.cache
        ?.map((role) => role.name)
        .filter((role) => role !== "@everyone")
        .join(", ") || "",
    "user.messages": userDB.messages_sent,
    "user.voice_time": convertMilisToString(userDB.voice_time),
    "user.voice_balance": userDB.wallet.voice_balance,
    "user.balance": userDB.wallet.balance,
    "user.inventory_items": userDB.inventory.shop_items?.length || 0,
    "user.profile_presets": userDB.profile_presets?.length || 0,
    "user.voice_exp": userDB.voice_exp,
    "user.message_exp": userDB.message_exp,
  };

  return {
    availableTokens: Object.keys(tokens),
    tokens,
  };
}
