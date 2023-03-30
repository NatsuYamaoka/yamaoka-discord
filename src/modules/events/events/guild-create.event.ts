import { BaseEvent } from "@abstracts/event/event.abstract";
import { EventArg } from "@abstracts/event/event.types";
import { ClientEvent } from "@decorators/events.decorator";
import { GuildEntity } from "@entities/guild.entity";

@ClientEvent({ name: "guildCreate" })
export class GuildCreateEvent extends BaseEvent {
  public async execute([guild]: EventArg<"guildCreate">) {
    const foundGuild = await GuildEntity.findOne({
      where: { gid: guild.id },
      select: { id: true },
    });

    if (foundGuild) return;

    await GuildEntity.create({ gid: guild.id }).save();
  }
}
