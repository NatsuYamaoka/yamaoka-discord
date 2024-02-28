import { Base } from "@abstracts/client/client.abstract";
import { CmdArg, CmdOpt, CmdType } from "@abstracts/command/command.types";
import { CustomClient } from "@client/custom-client";
import { EmbedBuilder } from "discord.js";

export class BaseCommand<K extends CmdType> extends Base {
  options?: CmdOpt<K>;

  constructor(client: CustomClient) {
    super(client);
  }

  execute(arg: CmdArg<K>): Promise<unknown> | unknown {
    throw new Error("Cannot be invoked in parent class");
  }

  sendError(
    error: string,
    arg: CmdArg<CmdType.SLASH_COMMAND>,
    isExpected = true
  ) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("Возникла ошибка ❗")
        .setColor("Red")
        .setDescription(`Ниже приведена дополнительная информация:`)
        .addFields([
          {
            name: "Ошибка 🚨",
            value: `> ${error.slice(0, 1020)}`,
          },
          {
            name: "Команда 📜",
            value: `> ${arg.commandName} ${
              arg.options.getSubcommand(false) || ""
            }`,
          },
        ]);

      if (!isExpected)
        embed.setFooter({
          text: "Это неожиданная ошибка! 😱\nПожалуйста, сообщите об этом разработчикам",
        });

      if (arg.deferred) {
        return arg.editReply({ embeds: [embed] });
      } else if (arg.replied) {
        return arg.followUp({ embeds: [embed], ephemeral: true });
      } else {
        return arg.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (err) {
      console.log(err);
    }
  }

  sendSuccess(
    message: string,
    arg: CmdArg<CmdType.SLASH_COMMAND>,
    isEphemeral = true
  ) {
    const embed = new EmbedBuilder()
      .setTitle("Успешно! ✅")
      .setColor("Green")
      .setDescription(message.slice(0, 1023));

    if (arg.deferred) {
      return arg.editReply({ embeds: [embed] });
    } else if (arg.replied) {
      return arg.followUp({ embeds: [embed], ephemeral: isEphemeral });
    } else {
      return arg.reply({ embeds: [embed], ephemeral: isEphemeral });
    }
  }
}
