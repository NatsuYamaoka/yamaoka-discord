import { UserEntity } from "@entities/index";
import { GuildMember } from "discord.js";
import { GetDuration } from "./get-duration.util";
import { VoiceManager } from "@managers/index";

interface TokensProps {
  availableTokens: string[];
  tokens: { [k: string]: string | number };
}

export function GatherProfileTokens(
  userDB: UserEntity,
  member: GuildMember,
  voiceManager: VoiceManager
): TokensProps {
  const { user } = member;

  const userVoice = voiceManager.getUserFromCollection(user.id);
  let userVoiceTime = 0;
  let userVoiceXp = 0;
  let userVoiceBalance = 0;

  if (userVoice) {
    userVoiceTime = new Date().getTime() - userVoice.joined_in.getTime();
    userVoiceXp = Math.floor(userVoiceTime * 0.01);
    userVoiceBalance = Math.floor(userVoiceTime / (50 * 1000));
  }

  // ? Add tokens if needed
  // ! Edit `profile-tokens.command.ts` if you add new tokens
  const tokens = {
    "user.avatar": user.displayAvatarURL({ size: 4096 }),
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
    "user.voice_time": GetDuration((userDB.voice_time + userVoiceTime) / 1000),
    "user.voice_balance": userDB.wallet.voice_balance + userVoiceBalance,
    "user.balance": userDB.wallet.balance,
    "user.inventory_items": userDB.inventory.shop_items?.length || 0,
    "user.profile_presets": userDB.profile_presets?.length || 0,
    "user.voice_exp": userDB.voice_exp + userVoiceXp,
    "user.message_exp": userDB.message_exp,
  };

  return {
    availableTokens: Object.keys(tokens),
    tokens,
  };
}
