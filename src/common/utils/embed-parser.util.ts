import { ProfilePresetEntity } from "@entities/index";
import PaginationHelper from "@helpers/pagination.helper";
import { defaultTemplate } from "@modules/general/slash-commands/profile.command";
import { EmbedBuilder } from "discord.js";

export function ParsePresetTokens(
  tokens: { [k: string]: string | number },
  preset: ProfilePresetEntity | undefined
) {
  const embed = preset?.json || JSON.stringify(defaultTemplate);
  const embedBuilder = embed.replace(/{{(.*?)}}/g, (_, mtch) => {
    return `${tokens[mtch].toString().replace(/"/g, '\\"')}`;
  });

  return new EmbedBuilder(JSON.parse(embedBuilder));
}

export function CreatePreviewPresetText(
  paginationHelper: PaginationHelper<ProfilePresetEntity>
) {
  return (
    `### 📃 Текущий пресет: [${paginationHelper.page} | ${paginationHelper.totalPages}]\n` +
    `Используйте стрелки ниже чтобы выбрать подходящий пресет\n` +
    `Нажмите кнопку с ✅ чтобы выбрать текущий пресет\n` +
    `Нажмите кнопку с ❌ чтобы закрыть меню\n` +
    `### Превью пресета:`
  );
}
