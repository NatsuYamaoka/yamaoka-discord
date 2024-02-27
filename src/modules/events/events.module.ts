import { Base } from "@abstracts/client/client.abstract";
import { Module } from "@decorators/module.decorator";
import { InteractionCreateEvent } from "@modules/events/interactions/interaction-create.event";
import { MessageCreateEvent } from "@modules/events/messages/message-create.event";
import { VoiceJoinEvent } from "@modules/events/voice/voice-join.event";
import { VoiceLeaveEvent } from "@modules/events/voice/voice-leave.event";

@Module({
  events: [
    InteractionCreateEvent,
    MessageCreateEvent,
    VoiceJoinEvent,
    VoiceLeaveEvent,
  ],
})
export class EventsModule extends Base {}
