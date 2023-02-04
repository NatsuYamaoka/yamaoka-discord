import { Interaction, CacheType } from "discord.js";
import { CommandType } from "../../core/abstracts/command/command.types";
import { BaseEvent } from "../../core/abstracts/event/event.abstract";

export default class InteractionCreate extends BaseEvent<"interactionCreate"> {
  public eventName = "interactionCreate" as const;

  public async execute(interaction: Interaction<CacheType>) {
    if (interaction.isChatInputCommand()) {
      this.customClient.commandManager.executeCommand(
        interaction.commandName,
        interaction,
        CommandType.SLASH_COMMAND
      );
    }
  }
}
