import { BaseEvent } from "@abstracts/event/event.abstract";
import { EventArg } from "@abstracts/event/event.types";
import { logger } from "@app/core/logger/logger-client";
import { ClientEvent } from "@decorators/events.decorator";

@ClientEvent({ name: "voiceStateUpdate" })
export class VoiceLeaveEvent extends BaseEvent {
  async execute([oldState, newState]: EventArg<"voiceStateUpdate">) {
    if (!oldState.channel && newState.channel) return;
    if (oldState.channelId === newState.channelId) return;

    if (!oldState.member) return;

    const member = oldState.member;
    const voice = oldState.channel?.name || "can't get name";

    logger.log(`User ${member.displayName} left "${voice}" voice channel.`);

    this.client.voiceManager.removeUserFromCollection(member.id);
  }
}
