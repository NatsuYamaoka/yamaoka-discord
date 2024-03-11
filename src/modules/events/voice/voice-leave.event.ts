import { BaseEvent } from "@abstracts/event/event.abstract";
import { EventArg } from "@abstracts/event/event.types";
import { logger } from "@app/core/logger/logger-client";
import { userService } from "@app/services/user.service";
import { ClientEvent } from "@decorators/events.decorator";

@ClientEvent({ name: "voiceStateUpdate" })
export class VoiceLeaveEvent extends BaseEvent {
  async execute([oldState, newState]: EventArg<"voiceStateUpdate">) {
    if (!oldState.channel) {
      return;
    }

    if (oldState.channelId === newState.channelId) {
      return;
    }

    if (!oldState.member || oldState.member.user.bot) {
      return;
    }

    const member = oldState.member;
    const voice = oldState.channel?.name;

    logger.log(`🛫 User ${member.displayName} left "${voice}" voice channel.`);

    this.client.voiceManager.calculateTimeExpCoinsAndSave(member.id);
  }
}
