import { PredefinedBaseEntity } from "@entities/base/base-entity";
import { UserEntity } from "@entities/user.entity";
import { Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class GuildEntity extends PredefinedBaseEntity {
  @PrimaryColumn()
  gid: string;

  @OneToMany(() => UserEntity, (user) => user.guild)
  users: UserEntity[];
}
