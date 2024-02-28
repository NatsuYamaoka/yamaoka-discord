import { BaseEvent } from "@abstracts/event/event.abstract";
import { EventArg } from "@abstracts/event/event.types";
import { logger } from "@app/core/logger/logger-client";
import { ClientEvent } from "@decorators/events.decorator";

@ClientEvent({ name: "voiceStateUpdate" })
export class VoiceJoinEvent extends BaseEvent {
  async execute([oldState, newState]: EventArg<"voiceStateUpdate">) {
    if (oldState.channel && !newState.channel) return;
    if (oldState.channelId === newState.channelId) return;
    if (!newState.member || newState.member.user.bot) return;

    const member = newState.member;
    const voice = newState.channel?.name || "can't get name";

    logger.log(`User ${member.displayName} joined "${voice}" voice channel`);

    const isAFK = newState.guild.afkChannelId === newState.channelId;
    this.client.voiceManager.addUserToCollection(member.id, isAFK);
  }
}
