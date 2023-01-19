import { join } from "path";
import { searchCmdsOrEventsByPath } from "../../common/utils/utils";
import { Base } from "../../core/abstracts/client/client.abstract";
import { BaseEvent } from "../../core/abstracts/event/event.abstract";

export class EventManager extends Base {
  public async loadEvents() {
    const rootDir = this.customClient.rootDir;
    const eventFilesPath = join(process.cwd(), "/", rootDir, "events", "**");

    const foundEventsFiles = await searchCmdsOrEventsByPath<typeof BaseEvent>(
      eventFilesPath
    );

    if (!foundEventsFiles) return;

    const loadedEventFiles = foundEventsFiles;

    for (const Event of loadedEventFiles) {
      const eventInstance = new Event(this.customClient);

      this.customClient.on(eventInstance.eventName, (...args) =>
        eventInstance.execute(...args)
      );
    }
  }
}
