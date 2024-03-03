import { UserEntity } from "@entities/index";
import { User } from "discord.js";

export function gatherProfileTokens(
  user: UserEntity,
  discordUser: User
): { availableTokens: string[]; tokens: { [k: string]: string | number } } {
  // ? Maybe add more tokens... Right now I have no idea what we can add more.

  const tokens = {
    "user.avatar": discordUser.avatarURL() || discordUser.displayAvatarURL(),
    "user.name": discordUser.globalName || discordUser.displayName,
    "user.messages": user.messages_sent,
    "user.voice_time": user.voice_time, // ! Need to execute function that will convert milliseconds to human time
    "user.voice_balance": user.wallet.voice_balance,
    "user.balance": user.wallet.balance,
    "user.inventory_items": user.inventory.shop_items?.length || 0,
    "user.profile_presets": user.profile_presets?.length || 0,
    "user.voice_exp": user.voice_exp,
    "user.message_exp": user.message_exp,
  };

  return {
    availableTokens: Object.keys(tokens),
    tokens,
  };
}
