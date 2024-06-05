import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { userService } from "@app/services/user.service";
import { SlashCommand } from "@decorators/commands.decorator";
import { ProfilePresetEntity, UserEntity } from "@entities/index";
import {
  GetNavigationSetup,
  NavigationButtons,
} from "@helpers/navigation.helper";
import PaginationHelper from "@helpers/pagination.helper";
import {
  CreatePreviewPresetText,
  ParsePresetTokens,
} from "@utils/embed-parser.util";
import { GatherProfileTokens } from "@utils/gather-tokens.util";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  GuildMember,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";

enum SHOP_CATEGORIES {
  ROLES = "roles",
  PROFILES = "profiles",
  SERVICES = "services",
}

const TO_PROCEED = "to-proceed-button";

@SlashCommand({
  name: "shop",
  description: "Просмотреть ассортимент магазина",
  data: new SlashCommandBuilder(),
})
export class ShopCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  async execute(interaction: CmdArg<CmdType.SLASH_COMMAND>) {
    const { sendError } = this.getMethods(interaction);
    await interaction.deferReply();

    const actionRowCategories =
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .addOptions([
            {
              emoji: { name: "🖼️" },
              label: "Профили",
              description: "Купить готовый пресет профиля",
              value: SHOP_CATEGORIES.PROFILES,
            },
            // {
            //   emoji: { name: "🔧" },
            //   label: "Услуги",
            //   description: "Купить услуги (создание профиля и т.д.)",
            //   value: SHOP_CATEGORIES.SERVICES,
            // },
          ])
          .setCustomId("shop-categories")
          .setPlaceholder("Выберите категорию")
      );

    interaction.editReply({
      embeds: [shopTitileEmbed],
      components: [actionRowCategories],
    });

    const componentCollector =
      interaction.channel?.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (int) =>
          int.user.id === interaction.user.id &&
          int.message.interaction?.id === interaction.id,
        time: 5 * 60000, // 5 minutes
      });

    componentCollector?.on("collect", async (int) => {
      const category = int.values[0] as SHOP_CATEGORIES;
      componentCollector.stop();

      switch (category) {
        case SHOP_CATEGORIES.PROFILES:
          return this.handleProfilesCategory(int);
        // case SHOP_CATEGORIES.SERVICES:
        //   return this.handleServicesCategory(int);
        default:
          return sendError("Неизвестная категория");
      }
    });
  }

  async handleProfilesCategory(arg: StringSelectMenuInteraction) {
    const presets = await ProfilePresetEntity.find({
      order: {
        created_at: "DESC",
      },
    });

    let userData = await userService.findOneByIdOrCreate(arg.user.id, {
      inventory: true,
      wallet: true,
      profile_presets: true,
      selected_preset: true,
    });

    const { list } = GetNavigationSetup();
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(list);

    const paginationHelper = new PaginationHelper(presets, {
      elementsOnPage: 1,
    });

    const [firstPreset] = paginationHelper.createPage();

    const componentCollector = arg.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (int) =>
        int.user.id === arg.user.id && int.message.id === arg.message.id,
      time: 10 * 60000, // 10 minutes
    });

    const { tokens } = GatherProfileTokens(
      userData,
      arg.member as GuildMember,
      this.client.voiceManager
    );

    await arg.update({
      content: CreatePreviewPresetText(paginationHelper),
      embeds: [ParsePresetTokens(tokens, firstPreset)],
      components: [actionRow, this.getPresetButtons(firstPreset, userData)],
    });

    componentCollector?.on("collect", async (int) => {
      let preset: ProfilePresetEntity | undefined;

      // Refinding since user data could be changed
      userData = await userService.findOneByIdOrCreate(arg.user.id, {
        inventory: true,
        wallet: true,
        profile_presets: true,
        selected_preset: true,
      });

      switch (int.customId) {
        case NavigationButtons.TO_LEFT:
          preset = paginationHelper.prevPage().createPage()[0];
          break;
        case NavigationButtons.TO_RIGHT:
          preset = paginationHelper.nextPage().createPage()[0];
          break;
        case NavigationButtons.TO_STOP:
          componentCollector.stop();
          return arg.deleteReply();
        case TO_PROCEED:
          preset = paginationHelper.createPage()[0];
          userData.wallet.balance -= 500; // Placeholder price
          userData.selected_preset = [preset];
          userData.profile_presets = [
            ...(userData.profile_presets || []),
            preset,
          ];

          await UserEntity.save(userData);

          componentCollector.stop();
          arg.editReply({
            content: "",
            components: [],
            embeds: [
              {
                title: "Покупка пресета",
                description: `Вы успешно купили новый пресет для профиля! 🎉\n\nЯ уже применила его к вашему текущему профилю`,
                color: 0x2f3136,
              },
            ],
          });
      }

      if (!preset) {
        return;
      }

      await int.update({
        content: CreatePreviewPresetText(paginationHelper),
        embeds: [ParsePresetTokens(tokens, preset)],
        components: [actionRow, this.getPresetButtons(preset, userData)],
      });
    });
  }

  async handleServicesCategory(arg: StringSelectMenuInteraction) {
    // TODO: Implement this
    arg.update({
      content: "В разработке..",
      components: [],
      embeds: [],
    });
    return;
  }

  private getPresetButtons(preset: ProfilePresetEntity, userData: UserEntity) {
    const price = 500; // Note: This is a placeholder. You should get the price from the preset entity
    const isUserHasPreset = userData.profile_presets?.some(
      (p) => p.id === preset.id
    );
    const isHasMoney = userData.wallet.balance >= price;

    function getLabel() {
      if (isUserHasPreset) {
        return "Уже куплено";
      }

      if (!isHasMoney) {
        return "Недостаточно средств";
      }

      return "Купить пресет";
    }

    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("disabled-button")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🪙")
        .setLabel("Цена пресета: " + price)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(TO_PROCEED)
        .setStyle(
          isUserHasPreset || !isHasMoney
            ? ButtonStyle.Danger
            : ButtonStyle.Success
        )
        .setEmoji(isUserHasPreset || !isHasMoney ? "❗" : "✅")
        .setLabel(getLabel())
        .setDisabled(isUserHasPreset || !isHasMoney)
    );
  }
}

const shopTitileEmbed = {
  title: "Магазин",
  description:
    "Добро пожаловать в магазин! 🛒\nЗдесть вы можете купить роли, профили и многое другое! 🛍️\n\nВыберите категорию ниже чтобы начать покупки! ⬇️",
  image: {
    url: "https://media.discordapp.net/attachments/989319914701586462/1247944373270872074/509000799cb0c5e1272e695a467823a0c81ea119_47x20.png?ex=6661de44&is=66608cc4&hm=4937210ab997b3f31a9495e01eea8a9f56223e27de53478b24d5fd0153c1895f&=&format=webp&quality=lossless&width=550&height=234",
    // Anime image. Replace or comment out if you like being hit by the rock. (I'm joking)
  },
  color: 0x2f3136,
};
