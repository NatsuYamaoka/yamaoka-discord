import { ProfilePresetEntity } from "@entities/index";
import PaginationHelper from "@helpers/pagination.helper";
import { defaultTemplate } from "@modules/general/slash-commands/profile.command";
import { IsValidJson } from "@utils/json-validator.util";
import { EmbedBuilder, resolveColor } from "discord.js";

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

export function CheckIfEmbedIsValid(embed: string) {
  if (!IsValidJson(embed)) {
    return { isValid: false, error: "JSON не валиден" };
  }

  const parsedJson = JSON.parse(embed);

  // TODO: Add more checks for other fields (should create a helper for that)
  // src: https://discordjs.guide/popular-topics/embeds.html#embed-limits
  if (!parsedJson.title && !parsedJson.description && !parsedJson.fields) {
    return {
      isValid: false,
      error: "JSON должен содержать title, description или fields",
    };
  }

  // If color is a string, try to resolve it to number
  if (parsedJson.color && typeof parsedJson.color !== "number") {
    try {
      parsedJson.color = resolveColor(parsedJson.color);
    } catch (err) {
      parsedJson.color = 0x2f3136; // Default color
    }
  }

  // FIXME: Can be hacked by writing it in unused fields
  // { "nicename": "{{user.display_name}}" }
  const requiredFields = ["{{user.display_name}}", "{{user.balance}"];
  const missingFields = requiredFields.filter(
    (field) => !embed.includes(field)
  );

  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `JSON должен содержать следующие поля: ${missingFields.join(
        ", "
      )}`,
    };
  }

  return { isValid: true, error: "", json: JSON.stringify(parsedJson) };
}
