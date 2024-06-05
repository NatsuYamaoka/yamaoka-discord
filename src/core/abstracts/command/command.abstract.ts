/* eslint-disable @typescript-eslint/no-unused-vars */
import { Base } from "@abstracts/client/client.abstract";
import { CmdArg, CmdOpt, CmdType } from "@abstracts/command/command.types";
import { IsSlashCommand } from "@app/common/types/guards.types";
import { logger } from "@app/core/logger/logger-client";
import { CustomClient } from "@client/custom-client";
import { EmbedBuilder } from "discord.js";

export type ExtendedMethods = {
  sendError: (error: string, isExpected?: boolean) => void;
  sendSuccess: (message: string) => void;
};

export class BaseCommand<K extends CmdType> extends Base {
  options?: CmdOpt<K>;

  constructor(client: CustomClient) {
    super(client);
  }

  execute(arg: CmdArg<K>): Promise<unknown> | unknown {
    throw new Error("Cannot be invoked in parent class");
  }

  // Shortcut for methods that require interaction object
  getMethods(arg: CmdArg<K>) {
    return {
      sendError: (error: string) => this.sendError(error, arg),
      sendSuccess: (message: string) => this.sendSuccess(message, arg),
    };
  }

  /** Don't use this method directly, use `getMethods` instead. */
  sendError(error: string, arg: CmdArg<K>, image?: string) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("🚨 Возникла ошибка ")
        .setColor("Red")
        .setDescription(error.slice(0, 1020))
        .setTimestamp();

      if (image) {
        embed.setImage(image);
      }

      this.sendEmbed(arg, embed);
    } catch (err) {
      logger.error(`Error while sending error embed: ${err}`);
    }
  }

  /** Don't use this method directly, use `getMethods` instead. */
  sendSuccess(message: string, arg: CmdArg<K>) {
    const embed = new EmbedBuilder()
      .setTitle("Успешно! ✅")
      .setColor("Green")
      .setDescription(message.slice(0, 1023));

    this.sendEmbed(arg, embed);
  }

  private sendEmbed(arg: CmdArg<K>, embed: EmbedBuilder) {
    const reply = {
      content: "",
      embeds: [embed],
      components: [],
    };

    if (!IsSlashCommand(arg)) {
      return arg.reply(reply);
    }

    if (arg.deferred) {
      return arg.editReply(reply);
    } else if (arg.replied) {
      return arg.followUp(reply);
    } else {
      return arg.reply(reply);
    }
  }
}
