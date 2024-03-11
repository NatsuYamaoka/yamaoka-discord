import { Base } from "@abstracts/client/client.abstract";
import { ModuleAbstract } from "@abstracts/module/module.abstract";
import { logger } from "@app/core/logger/logger-client";
import { CustomClient } from "@client/custom-client";

export class EventManager extends Base {
  constructor(client: CustomClient) {
    super(client);

    logger.log("Event Manager inited");
  }

  public loadEvents(module: ModuleAbstract) {
    if (!module.events) {
      return;
    }

    for (const Event of module.events) {
      const eventInstance = new Event(this.client);

      if (!eventInstance.name) {
        continue;
      }

      this.client.on(eventInstance.name, (...arg) => {
        eventInstance.execute(arg);
      });
    }
  }
}
