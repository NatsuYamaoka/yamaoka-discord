import { BaseEvent } from "@abstracts/event/event.abstract";
import { EventArg } from "@abstracts/event/event.types";
import { ClientEvent } from "@decorators/events.decorator";

@ClientEvent({ name: "interactionCreate" })
export class InteractionCreateEvent extends BaseEvent {
  public async execute([interaction]: EventArg<"interactionCreate">) {
    if (interaction.isChatInputCommand()) {
      this.client.commandManager.executeCommand(
        interaction.commandName,
        interaction
      );
    }
  }
}
