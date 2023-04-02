import { PredefinedBaseEntity } from "@entities/base/base-entity";
import { UserEntity } from "@entities/user.entity";
import { Column, Entity, Index, OneToMany } from "typeorm";

@Entity()
export class GuildEntity extends PredefinedBaseEntity {
  @Column()
  @Index()
  gid: string;

  @OneToMany(() => UserEntity, (user) => user.guild)
  users: UserEntity[];
}
