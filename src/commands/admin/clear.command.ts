import {
  channelMention,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import config from "../../app.config";
import { BaseCommand } from "../../core";
import { CommandType } from "../../typings/enums";

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
      const deletedMessages = await channel.bulkDelete(amount, true);
      const deletedAmount = deletedMessages.size;

      const successEmbed = {
        ...config.embeds.Success,
      };

      const plurarizeWord = deletedAmount - 1 ? "messages" : "message";
      const description = `${deletedAmount} ${plurarizeWord} was deleted in ${channelMention(
        channel.id
      )}!`;

      successEmbed.title = successEmbed.title.replace("%proccess%", "Command");
      successEmbed.description = successEmbed.description.replace(
        "%description%",
        description
      );

      argument.reply({
        embeds: [successEmbed],
        ephemeral: true,
      });

      return;
    }
  }
}
