import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { GuildService } from "@app/services/guild.service";
import { SlashCommand } from "@decorators/commands.decorator";
import { GuildEntity } from "@entities/guild.entity";
import { UserEntity } from "@entities/user.entity";
import { createEmbed } from "@utils/create-embed.util";
import { Colors } from "discord.js";

@SlashCommand({
  name: "register",
  description: "Register in system",
})
export class RegisterCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  private userRepository = this.client.db.getRepository(UserEntity);
  private guildRepository = this.client.db.getRepository(GuildEntity);

  private guildService = new GuildService(this.guildRepository);

  public async execute(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    if (!arg.guildId) {
      return arg.reply({
        content: "Unexpected error happened. Try again.",
        ephemeral: true,
      });
    }

    const foundUser = await this.userRepository.findOne({
      where: {
        guild: { gid: arg.guildId },
        uid: arg.user.id,
      },
      select: { id: true },
    });

    if (foundUser) {
      return arg.reply({
        content: "You are already registered",
        ephemeral: true,
      });
    }

    const foundGuild = await this.guildService.findOneOrCreate(arg.guildId);

    const registeredUser = await this.userRepository.save({
      uid: arg.user.id,
      wallet: {},
      guild: foundGuild,
    });

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
