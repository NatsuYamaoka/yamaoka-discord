import { Base } from "@abstracts/client/client.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { SlashCommand } from "@decorators/commands.decorator";
import { User } from "@entities/user.entity";
import { createEmbed } from "@utils/create-embed.util";
import { Colors } from "discord.js";

@SlashCommand({
  name: "register",
  description: "Register in system",
})
export class RegisterCommand extends Base {
  public async execute(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    if (!arg.guildId) {
      return arg.reply({
        content: "Unexpected error happened. Try again.",
        ephemeral: true,
      });
    }

    const foundUser = await User.findOne({
      where: {
        gid: arg.guildId,
        uid: arg.user.id,
      },
      select: { id: true },
    });

    if (foundUser) {
      return arg.reply({
        content: "Sorry. You're already registered.",
        ephemeral: true,
      });
    }

    const registeredUser = await User.create({
      uid: arg.user.id,
      gid: arg.guildId,
      wallet: {},
    }).save();

    const registrationEmbed = createEmbed({
      author: {
        name: arg.user.username,
        icon_url: arg.user.displayAvatarURL(),
      },
      description: `Thanks for registering!\nYour system id is **${registeredUser.id}**.`,
      color: Colors.NotQuiteBlack,
    });

    arg.reply({ embeds: [registrationEmbed], ephemeral: true });
  }
}
