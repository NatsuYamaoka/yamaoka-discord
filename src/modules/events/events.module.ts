import { Base } from "@abstracts/client/client.abstract";
import { Module } from "@decorators/module.decorator";
import { InteractionCreateEvent } from "@modules/events/events/interaction-create.event";
import { MessageCreateEvent } from "@modules/events/events/message-create.event";
import { ReadyEvent } from "@modules/events/events/ready.event";

@Module({
  events: [InteractionCreateEvent, MessageCreateEvent, ReadyEvent],
})
export class EventsModule extends Base {}
