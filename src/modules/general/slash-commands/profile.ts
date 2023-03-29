import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { SlashCommand } from "@decorators/commands.decorator";
import { ButtonBuilder } from "@discordjs/builders";
import { User } from "@entities/user.entity";
import { profileMmHandler } from "@handlers/multi-menu/profile.mm.handler";
import { sleep } from "@utils/sleep.util";
import { ActionRowBuilder, ButtonStyle, ComponentType } from "discord.js";

@SlashCommand({
  name: "profile",
  description: "Look up your profile",
  deferReply: true,
})
export class ProfileCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  public async execute(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    if (!arg.guildId) {
      return arg.reply({
        content: "Unexpected error happened. Try again.",
        ephemeral: true,
      });
    }

    const user = await User.findOne({
      where: {
        uid: arg.user.id,
        gid: arg.guildId,
      },
      relations: {
        wallet: true,
      },
    });

    if (!user) {
      return arg.editReply({
        content:
          "Can't find you in db.\nYou might try to use /register command.",
      });
    }

    const firstRow = [
      new ButtonBuilder({
        custom_id: "profile.base",
        style: ButtonStyle.Primary,
        label: "Profile",
        type: ComponentType.Button,
      }),
      new ButtonBuilder({
        custom_id: "profile.wallet",
        style: ButtonStyle.Primary,
        label: "Wallet",
        type: ComponentType.Button,
      }),
    ];

    const response = await arg.editReply({
      content: "Wait for profile to setup...",
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(firstRow),
      ],
    });

    await sleep(500);

    await profileMmHandler.useAction("profile.base", { arg, data: user });

    const componentCollector = arg.channel?.createMessageComponentCollector({
      time: 1000 * 60 * 2.5,
      componentType: ComponentType.Button,
      filter: (int) => int.user.id === arg.user.id,
      message: response,
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

      profileMmHandler.useAction(button.customId, { arg, data: user });
    });
  }
}
