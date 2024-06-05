import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { ProfileCommandSubCommandsTypes } from "@app/common/types/commands.types";
import { SlashCommand } from "@decorators/commands.decorator";
import { ProfilePresetEntity } from "@entities/user/profile-preset.entity";
import {
  NavigationButtons,
  GetNavigationSetup,
} from "@helpers/navigation.helper";
import PaginationHelper from "@helpers/pagination.helper";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ComponentType,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
  resolveColor,
} from "discord.js";
import { IsValidJson } from "@utils/json-validator.util";
import { ParsePresetTokens } from "@utils/embed-parser.util";
import { GatherProfileTokens } from "@utils/gather-tokens.util";
import { userService } from "@app/services/user.service";

@SlashCommand({
  name: "profile-preset",
  description: "Манипуляция с пресетами профилей для модераторов",
  data: new SlashCommandBuilder()
    .addSubcommand((sub) =>
      sub
        .setName(ProfileCommandSubCommandsTypes.CREATE)
        .setDescription("Создать пресет")
        .addStringOption((opt) =>
          opt
            .setName("json")
            .setDescription(
              "Валидный JSON-объект, который будет использоваться для создания пресета"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName(ProfileCommandSubCommandsTypes.UPDATE)
        .setDescription("Обновить пресет")
        .addStringOption((opt) =>
          opt.setName("id").setDescription("Айди пресета").setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("json")
            .setDescription(
              "Валидный JSON-объект, который будет использоваться для создания пресета"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName(ProfileCommandSubCommandsTypes.DELETE)
        .setDescription("Удалить пресет")
        .addStringOption((opt) =>
          opt.setName("id").setDescription("Айди пресета").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName(ProfileCommandSubCommandsTypes.LIST)
        .setDescription("Получить список всех пресетов")
    )
    .addSubcommand((sub) =>
      sub
        .setName(ProfileCommandSubCommandsTypes.INFO)
        .setDescription("Информация о использовании команд для пресетов")
    ),
})
export class ProfilePresetsCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  async execute(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const subCommandName = arg.options.getSubcommand(true);

    await arg.deferReply({ ephemeral: true });

    const { CREATE, UPDATE, DELETE, LIST, INFO } =
      ProfileCommandSubCommandsTypes;

    switch (subCommandName) {
      case CREATE:
        return this.createPreset(arg);
      case UPDATE:
        return this.updatePreset(arg);
      case DELETE:
        return this.deletePreset(arg);
      case LIST:
        return this.listPresets(arg);
      case INFO:
        return this.infoPreset(arg);
    }
  }

  // Possible to use this method for custom presets (for users)
  public async createPreset(
    arg: CmdArg<CmdType.SLASH_COMMAND>,
    isCustom = false
  ) {
    const json = arg.options.getString("json", true);

    if (!IsValidJson(json)) {
      return this.sendError("JSON который вы предоставили невалиден", arg);
    }

    const parsedJson = JSON.parse(json);

    // TODO: Add more checks for other fields (should create a helper for that)
    // src: https://discordjs.guide/popular-topics/embeds.html#embed-limits
    if (!parsedJson.title && !parsedJson.description && !parsedJson.fields) {
      return this.sendError(
        "JSON должен содержать title, description или fields",
        arg
      );
    }

    // If color is a string, try to resolve it to number
    if (parsedJson.color && typeof parsedJson.color !== "number") {
      try {
        parsedJson.color = resolveColor(parsedJson.color);
      } catch (err) {
        parsedJson.color = 0x2f3136; // Default color
      }
    }

    const data = {
      updated_by: arg.user.id,
      json: JSON.stringify(parsedJson),
    };

    if (isCustom) {
      await ProfilePresetEntity.save({ user: { uid: arg.user.id }, ...data });
    } else {
      await ProfilePresetEntity.save({ ...data });
    }

    return this.sendSuccess("Пресет создан!", arg);
  }

  public async updatePreset(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const id = arg.options.getString("id", true);
    const json = arg.options.getString("json", true);

    if (!id.match(/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/)) {
      return this.sendError("Невалидный ID", arg);
    }

    const foundPreset = await ProfilePresetEntity.findOne({ where: { id } });

    if (!foundPreset) {
      return this.sendError("Не могу найти пресет по предоставленному ID", arg);
    }

    if (!IsValidJson(json)) {
      return this.sendError("JSON который вы предоставили невалиден", arg);
    }

    await ProfilePresetEntity.save({
      ...foundPreset,
      json: JSON.stringify(JSON.parse(json)), // Normalize JSON for storing in db (remove spaces etc.)
    });

    return this.sendSuccess("Preset updated!", arg);
  }

  public async deletePreset(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const id = arg.options.getString("id", true);

    if (!id.match(/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/)) {
      return this.sendError("Невалидный ID", arg);
    }

    const foundPreset = await ProfilePresetEntity.findOne({ where: { id } });

    if (!foundPreset) {
      return this.sendError("Не могу найти пресет по предоставленному ID", arg);
    }

    await ProfilePresetEntity.remove(foundPreset);

    return this.sendSuccess("Пресет удалён!", arg);
  }

  public async listPresets(interaction: CmdArg<CmdType.SLASH_COMMAND>) {
    const presets = await ProfilePresetEntity.find();

    const { list } = GetNavigationSetup();
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(list);

    if (!presets.length) {
      return this.sendError(
        "В базе данных нет пресетов для профиля",
        interaction
      );
    }

    const paginationHelper = new PaginationHelper(presets, {
      elementsOnPage: 1,
    });

    const [firstPreset] = paginationHelper.createPage();

    const componentCollector =
      interaction.channel?.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (int) =>
          int.user.id === interaction.user.id &&
          int.message.interaction?.id === interaction.id,
        time: 5 * 60000, // 5 minutes
      });

    const userData = await userService.findOneByIdOrCreate(
      interaction.user.id,
      {
        inventory: true,
        wallet: true,
        profile_presets: true,
        selected_preset: true,
      }
    );

    const { tokens } = GatherProfileTokens(
      userData,
      interaction.member as GuildMember,
      this.client.voiceManager
    );

    await interaction.editReply({
      content: this.createContent(firstPreset, paginationHelper),
      embeds: [ParsePresetTokens(tokens, firstPreset)],
      components: [actionRow],
    });

    return componentCollector?.on("collect", (int) => {
      let preset: ProfilePresetEntity | undefined;

      switch (int.customId) {
        case NavigationButtons.TO_LEFT:
          preset = paginationHelper.prevPage().createPage()[0];
          break;
        case NavigationButtons.TO_RIGHT:
          preset = paginationHelper.nextPage().createPage()[0];
          break;
        case NavigationButtons.TO_STOP:
          componentCollector.stop();
          interaction.deleteReply();
          return;
      }

      if (!preset) {
        return;
      }

      int.update({
        content: this.createContent(preset, paginationHelper),
        embeds: [ParsePresetTokens(tokens, preset)],
      });
    });
  }

  public async infoPreset(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const embed = new EmbedBuilder()
      .setTitle("📂 Информация о пресетах")
      .setDescription(
        "Ниже указаны FAQ по пресетам. Если у вас есть дополнительные вопросы, обратитесь к администратору."
      )
      .addFields([
        {
          name: " ",
          value:
            "Пресеты - это предустановленные шаблоны для профиля, которые можно использовать для быстрого изменения внешнего вида профиля.",
        },
        {
          name: "Как создать пресет?",
          value:
            "Используйте сайт для геренации embed-объекта, например [Discord Embed Creator](https://embed.dan.onl/), и эскортируйте JSON-объект в команду.\n " +
            '```/profile-preset create json: {"title":"My Profile","description":"Hello, world!"}```',
        },
        {
          name: "Как получить список пресетов?",
          value:
            "С помощью команды `/profile-preset list` вы можете получить список всех пресетов в базе данных и их ID.",
        },
        {
          name: "Как обновить пресет?",
          value:
            "Команда `/profile-preset update id:uuid json:object` поможет вам обновить пресет по его ID.",
        },
        {
          name: "Как удалить пресет?",
          value:
            "Команда `/profile-preset delete id:uuid` удалит пресет, если он существует.",
        },
      ])
      .setImage("https://i.imgur.com/Ut7zM46.png");

    return arg.editReply({ embeds: [embed] });
  }

  public createContent(
    preset: ProfilePresetEntity,
    paginationHelper: PaginationHelper<ProfilePresetEntity>
  ) {
    return (
      `### 📃 Страница: [${paginationHelper.page} | ${paginationHelper.totalPages}]\n` +
      `ID в бд: \`\`${preset.id}\`\`\n` +
      `Последний редактор: <@${preset.updated_by}>\n` +
      `Создан: <t:${Math.floor(preset.created_at.getTime() / 1000)}:R>\n` +
      `Обновлён: <t:${Math.floor(preset.created_at.getTime() / 1000)}:R>\n`
    );
  }
}
