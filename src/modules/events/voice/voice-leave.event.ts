import { BaseEvent } from "@abstracts/event/event.abstract";
import { EventArg } from "@abstracts/event/event.types";
import { logger } from "@app/core/logger/logger-client";
import { ClientEvent } from "@decorators/events.decorator";
import { UserEntity } from "@entities/index";

@ClientEvent({ name: "voiceStateUpdate" })
export class VoiceLeaveEvent extends BaseEvent {
  async execute([oldState, newState]: EventArg<"voiceStateUpdate">) {
    if (!oldState.channel && newState.channel) return;
    if (oldState.channelId === newState.channelId) return;
    if (!oldState.member || oldState.member.user.bot) return;

    const member = oldState.member;
    const voice = oldState.channel?.name || "can't get name";

    logger.log(`User ${member.displayName} left "${voice}" voice channel.`);

    const userData = this.client.voiceManager.getUserFromCollection(member.id);
    if (!userData) return;

    const userEntity = await UserEntity.findOne({ where: { uid: member.id } });
    const timeDifference = new Date().getTime() - userData.joined_in.getTime();
    const timeSpent = Math.floor(
      (userData.isAFK ? timeDifference : timeDifference) / 2
    );

    // todo: work on levelup system
    await UserEntity.save({
      uid: member.id,
      voice_time: timeSpent + (userEntity?.voice_time || 0),
      voice_exp: Math.floor(timeSpent * 0.1) + (userEntity?.voice_exp || 0),
    });

    this.client.voiceManager.removeUserFromCollection(member.id);
  }
}
