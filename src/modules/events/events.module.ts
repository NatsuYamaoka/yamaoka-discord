import { Base } from "@abstracts/client/client.abstract";
import { Module } from "@decorators/module.decorator";
import { GuildCreateEvent } from "@modules/events/guild/guild-create.event";
import { InteractionCreateEvent } from "@modules/events/interactions/interaction-create.event";
import { MessageCreateEvent } from "@modules/events/messages/message-create.event";
import { ReadyEvent } from "@modules/events/general/ready.event";

@Module({
  events: [
    InteractionCreateEvent,
    MessageCreateEvent,
    ReadyEvent,
    GuildCreateEvent,
  ],
})
export class EventsModule extends Base {}
