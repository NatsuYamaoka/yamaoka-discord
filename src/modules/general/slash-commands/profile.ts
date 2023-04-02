import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { SlashCommand } from "@decorators/commands.decorator";
import { ButtonBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { UserEntity } from "@entities/user.entity";
import { profileMmHandler } from "@handlers/multi-menu/profile.mm.handler";
import { ActionRowBuilder, ButtonStyle, ComponentType } from "discord.js";

@SlashCommand({
  name: "profile",
  description: "Look up your profile",
  data: new SlashCommandBuilder().addUserOption((option) =>
    option.setName("user").setDescription("Select user")
  ),
})
export class ProfileCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  private userRepository = this.client.db.getRepository(UserEntity);

  public async execute(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const interactionResponse = await arg.deferReply();
    const userToFind = arg.options.getUser("user") || arg.user;

    if (!arg.guildId) {
      return arg.editReply({
        content: "Unexpected error happened. Try again.",
      });
    }

    const user = await this.userRepository.findOne({
      where: {
        uid: userToFind.id,
        guild: {
          gid: arg.guildId,
        },
      },
      relations: {
        wallet: true,
      },
    });

    if (!user) {
      const toUseId = this.client.commandManager.registerCommandId;
      const toUse = toUseId ? `</register:${toUseId}>` : "/register";

      return arg.editReply({
        content: `Can't find ${userToFind.username} in db.\nYou/they might try to use ${toUse} command.`,
      });
    }

    const components = this.createComponents();

    await profileMmHandler.useAction("profile.base", {
      arg,
      components,
      data: user,
      user: userToFind,
    });

    const componentCollector = arg.channel?.createMessageComponentCollector({
      time: 1000 * 60 * 2.5,
      componentType: ComponentType.Button,
      filter: (int) => int.user.id === arg.user.id,
      interactionResponse,
    });

    if (!componentCollector) {
      return arg.editReply({
        content: "Can't create component collector. Please try again",
        components: [],
        embeds: [],
      });
    }

    componentCollector.on("collect", (button) => {
      button.deferUpdate();

      profileMmHandler.useAction(button.customId, {
        arg,
        components,
        data: user,
        user: userToFind,
      });
    });

    componentCollector.on("end", () => {
      this.disableAllComponents(components);

      arg.editReply({ components });
    });
  }

  private disableAllComponents(components: ActionRowBuilder<ButtonBuilder>[]) {
    for (let i = 0; i < components.length; i++) {
      for (let b = 0; b < components[i].components.length; b++) {
        components[i].components[b].setDisabled(true);
      }
    }
  }

  private createComponents() {
    return [
      new ActionRowBuilder<ButtonBuilder>().setComponents([
        new ButtonBuilder()
          .setCustomId("profile.base")
          .setStyle(ButtonStyle.Primary)
          .setLabel("Profile"),
        new ButtonBuilder()
          .setCustomId("profile.wallet")
          .setStyle(ButtonStyle.Primary)
          .setLabel("Wallet"),
      ]),
    ];
  }
}
