import { Base } from "@abstracts/client/client.abstract";
import { Module } from "@decorators/module.decorator";
import { InteractionCreateEvent } from "@modules/events/interactions/interaction-create.event";
import { MessageCreateEvent } from "@modules/events/messages/message-create.event";

@Module({
  events: [InteractionCreateEvent, MessageCreateEvent],
})
export class EventsModule extends Base {}
