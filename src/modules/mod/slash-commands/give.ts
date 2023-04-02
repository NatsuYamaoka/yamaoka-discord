import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { SlashCommand } from "@decorators/commands.decorator";
import { UserEntity } from "@entities/user.entity";
import { WalletEntity } from "@entities/wallet.entity";
import { SlashCommandBuilder } from "discord.js";

@SlashCommand({
  name: "give",
  description: "Add some coins to user",
  data: new SlashCommandBuilder()
    .addUserOption((option) =>
      option.setName("user").setDescription("Select user").setRequired(true)
    )
    .addNumberOption((option) =>
      option.setName("amount").setDescription("Amount").setRequired(true)
    ),
})
export class GiveCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  private userRepository = this.client.db.getRepository(UserEntity);
  private walletRepository = this.client.db.getRepository(WalletEntity);

  async execute(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const user = arg.options.getUser("user", true);
    const amount = arg.options.getNumber("amount", true);

    if (!arg.guildId)
      return arg.reply({
        content: "Unexpected error occure!\nPlease try again later",
        ephemeral: true,
      });

    const userData = await this.userRepository.findOne({
      where: {
        uid: user.id,
        guild: {
          gid: arg.guildId,
        },
      },
      relations: {
        guild: true,
        wallet: true,
      },
    });

    if (!userData)
      return arg.reply({
        content: `I can't give **${amount}** to user ${user.toString()} because they not registered in system.`,
        ephemeral: true,
      });

    await this.walletRepository.update(
      {
        user: {
          id: userData.id,
          guild: {
            id: userData.guild.id,
          },
        },
      },
      {
        balance: () => `balance + ${amount}`,
      }
    );

    arg.reply({
      content: `Done! Now user ${user.toString()} has ${
        userData.wallet.balance + amount
      }`,
      ephemeral: true,
    });
  }
}
