import { BaseEvent } from "@abstracts/event/event.abstract";
import { EventArg } from "@abstracts/event/event.types";
import { logger } from "@app/core/logger/logger-client";
import { ClientEvent } from "@decorators/events.decorator";

@ClientEvent({ name: "ready" })
export class ReadyEvent extends BaseEvent {
  async execute([client]: EventArg<"ready">) {
    logger.info(
      `Received heartbeat from discord successfuly for ${client.user.username}`
    );
  }
}
