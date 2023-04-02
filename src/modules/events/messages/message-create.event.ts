import { BaseEvent } from "@abstracts/event/event.abstract";
import { EventArg } from "@abstracts/event/event.types";
import { ClientEvent } from "@decorators/events.decorator";
import appConfig from "@app/app.config";

@ClientEvent({ name: "messageCreate" })
export class MessageCreateEvent extends BaseEvent {
  public async execute([message]: EventArg<"messageCreate">) {
    const [cmdName] = message.content.trim().split(" ");

    if (cmdName.startsWith(appConfig.prefix)) {
      this.client.commandManager.executeCommand(
        cmdName.slice(1),
        message,
        false
      );
    }
  }
}
