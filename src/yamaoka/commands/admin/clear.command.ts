import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../../core/base/base.command";
import { CommandType } from "../../typings/base-command.types";
import { YamaokaConfig } from "../../../configs";
export default class ClearCommand extends BaseCommand<CommandType.SLASH_COMMAND> {
  public options = {
    name: "clear",
    data: new SlashCommandBuilder()
      .setName("clear")
      .setDescription("Clear command for any channel")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("Select channel")
          .setRequired(true)
      )
      .addNumberOption((option) =>
        option
          .setName("amount")
          .setDescription("Select amount of messages to delete")
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(100)
      )
      .toJSON(),
  };

  public async execute(argument: ChatInputCommandInteraction): Promise<void> {
    const channel = argument.options.getChannel("channel", true);
    const amount = argument.options.getNumber("amount", true);

    if ("bulkDelete" in channel) {
      await channel.bulkDelete(amount);
      const successEmbed = { ...YamaokaConfig.embeds.Success };
      const plurarizeWord = amount - 1 ? "messages" : "message";
      successEmbed.title = successEmbed.title.replace("%proccess%", "Command");
      successEmbed.description = successEmbed.description.replace(
        "%description%",
        `${amount} ${plurarizeWord} was deleted in <#${channel.id}>!`
      );

      argument.reply({
        embeds: [successEmbed],
        ephemeral: true,
      });
      return;
    }
  }
}
