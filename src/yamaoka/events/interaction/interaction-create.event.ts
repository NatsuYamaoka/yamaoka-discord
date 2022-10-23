import { Interaction, CacheType } from "discord.js";
import { BaseEvent } from "../../core/base/base.event";
import { CommandType } from "../../typings/base-command.types";

export default class InteractionCreate extends BaseEvent<"interactionCreate"> {
  public eventName: "interactionCreate" = "interactionCreate";

  public async execute(interaction: Interaction<CacheType>) {
    if (interaction.isChatInputCommand()) {
      this.yamaokaClient.commandManager.executeCommand(
        interaction.commandName,
        interaction,
        CommandType.SLASH_COMMAND
      );
    }
  }
}
