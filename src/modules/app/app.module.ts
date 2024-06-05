import { Base } from "@abstracts/client/client.abstract";
import { Module } from "@decorators/module.decorator";
import { ReadyEvent } from "@modules/app/events/ready.event";
import { DevModule } from "@modules/dev/dev.module";
import { EventsModule } from "@modules/events/events.module";
import { GeneralModule } from "@modules/general/general.module";
import { ModModule } from "@modules/mod/mod.module";

@Module({
  imports: [GeneralModule, DevModule, EventsModule, ModModule],
  events: [ReadyEvent],
})
export class AppModule extends Base {}
