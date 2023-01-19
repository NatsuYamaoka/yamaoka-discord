import {
  channelMention,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { BaseCommand } from "../../core/abstracts/command/command.abstract";
import { CommandType } from "../../core/abstracts/command/types/command.types";

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

    if (!("bulkDelete" in channel)) return;

    const deletedMessages = await channel.bulkDelete(amount, true);
    const deletedAmount = deletedMessages.size;

    const plurarizedWord = deletedAmount - 1 ? "messages" : "message";
    const description = `${deletedAmount} ${plurarizedWord} was deleted in ${channelMention(
      channel.id
    )}!`;

    argument.reply({ content: description, ephemeral: true });
  }
}
