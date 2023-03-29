import { Base } from "@abstracts/client/client.abstract";
import { Module } from "@decorators/module.decorator";
import { DevModule } from "@modules/dev/dev.module";
import { EventsModule } from "@modules/events/events.module";
import { GeneralModule } from "@modules/general/general.module";

@Module({
  imports: [GeneralModule, DevModule, EventsModule],
})
export class AppModule extends Base {}
