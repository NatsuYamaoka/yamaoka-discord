import { Interaction, CacheType } from "discord.js";
import { BaseEvent } from "../../core";
import { CommandType } from "../../typings/enums";

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
