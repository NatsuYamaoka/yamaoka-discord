import { Base } from "../core/base/base";
import { join } from "path";
import { BaseEvent } from "../core/base/base.event";
import { importFiles } from "../../helpers/utils";

export class EventManager extends Base {
  public async loadEvents() {
    const rootDir = this.yamaokaClient.rootDir;
    const path = join(process.cwd(), "/", rootDir, "yamaoka", "events", "**");
    const result = await importFiles<typeof BaseEvent>(path);

    if (!result) return;

    const { files, totalLoaded } = result;

    for (const Event of files) {
      const eventInstance = new Event(this.yamaokaClient);

      this.yamaokaClient.on(eventInstance.eventName, (...args) => {
        eventInstance.execute(...args);
      });
    }

    console.log(`✅ ${totalLoaded} EVENTS WAS LOADED!`);
  }
}
