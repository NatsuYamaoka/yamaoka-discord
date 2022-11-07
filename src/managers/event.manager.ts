import { join } from "path";
import { Base, BaseEvent } from "../core";
import { searchCmdsOrEventsByPath } from "../helpers/utils";

export class EventManager extends Base {
  public async loadEvents() {
    const rootDir = this.yamaokaClient.rootDir;
    const path = join(process.cwd(), "/", rootDir, "events", "**");
    const result = await searchCmdsOrEventsByPath<typeof BaseEvent>(path);

    if (!result) return;

    const { files, totalLoaded } = result;

    for (const Event of files) {
      const eventInstance = new Event(this.yamaokaClient);

      this.yamaokaClient.on(eventInstance.eventName, (...args) =>
        eventInstance.execute(...args)
      );
    }

    console.log(`✅ ${totalLoaded} EVENTS WAS LOADED!`);
  }
}
