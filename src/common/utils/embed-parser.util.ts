import { ProfilePresetEntity } from "@entities/index";
import { defaultTemplate } from "@modules/general/slash-commands/profile.command";
import { EmbedBuilder } from "discord.js";

export function parsePresetTokens(
  tokens: { [k: string]: string | number },
  preset: ProfilePresetEntity
) {
  const embed = preset.json || JSON.stringify(defaultTemplate);
  const embedBuilder = embed.replace(/{{(.*?)}}/g, (_, mtch) => {
    return `${tokens[mtch].toString().replace(/"/g, '\\"')}`;
  });

  return new EmbedBuilder(JSON.parse(embedBuilder));
}
