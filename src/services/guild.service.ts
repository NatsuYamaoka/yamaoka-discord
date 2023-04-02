import { GuildEntity } from "@entities/guild.entity";
import { Repository } from "typeorm";

export class GuildService {
  constructor(private guildRepository: Repository<GuildEntity>) {}

  public findOneByGid(gid: string) {
    return this.guildRepository.findOne({ where: { gid } });
  }

  public createByGid(gid: string) {
    return this.guildRepository.save({ gid });
  }

  async findOneOrCreate(gid: string) {
    const foundGuild = await this.findOneByGid(gid);

    if (foundGuild) return foundGuild;

    return this.createByGid(gid);
  }
}
