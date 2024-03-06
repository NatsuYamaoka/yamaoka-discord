import { Base } from "@abstracts/client/client.abstract";
import { CmdArg, CmdOpt, CmdType } from "@abstracts/command/command.types";
import { CustomClient } from "@client/custom-client";
import { EmbedBuilder, InteractionType } from "discord.js";

export class BaseCommand<K extends CmdType> extends Base {
  options?: CmdOpt<K>;

  constructor(client: CustomClient) {
    super(client);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(arg: CmdArg<K>): Promise<unknown> | unknown {
    throw new Error("Cannot be invoked in parent class");
  }

  sendError(error: string, arg: CmdArg<K>, isExpected = true) {
    try {
      const isSlash = arg.type === InteractionType.ApplicationCommand;
      const commandName = isSlash ? arg.commandName : arg.content;

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
            value: `> ${commandName} ${
              (isSlash && arg.options.getSubcommand(false)) || ""
            }`,
          },
        ]);

      if (!isExpected) {
        embed.setFooter({
          text: "Это неожиданная ошибка! 😱\nПожалуйста, сообщите об этом разработчикам",
        });
      }

      const reply = {
        content: "",
        embeds: [embed],
        components: [],
      };

      if (!isSlash) {
        return arg.reply(reply);
      }

      if (arg.deferred) {
        return arg.editReply(reply);
      } else if (arg.replied) {
        return arg.followUp({ ...reply, ephemeral: true });
      } else {
        return arg.reply({ ...reply, ephemeral: true });
      }
    } catch (err) {
      console.log(err);
    }
  }

  sendSuccess(message: string, arg: CmdArg<K>, isEphemeral = true) {
    const isSlash = arg.type === InteractionType.ApplicationCommand;
    const embed = new EmbedBuilder()
      .setTitle("Успешно! ✅")
      .setColor("Green")
      .setDescription(message.slice(0, 1023));

    const reply = {
      content: "",
      embeds: [embed],
      components: [],
    };

    if (!isSlash) {
      return arg.reply(reply);
    }

    if (arg.deferred) {
      return arg.editReply(reply);
    } else if (arg.replied) {
      return arg.followUp({ ...reply, ephemeral: isEphemeral });
    } else {
      return arg.reply({ ...reply, ephemeral: isEphemeral });
    }
  }
}
