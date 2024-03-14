import { PredefinedBaseEntity } from "@entities/base/base.entity";
import { UserEntity } from "@entities/user/user.entity";
import { Column, Entity, JoinColumn, OneToOne, Relation } from "typeorm";

@Entity()
export class VoicePresetEntity extends PredefinedBaseEntity {
  @Column()
  name: string;

  @Column()
  slots: number;

  @OneToOne(() => UserEntity, (user) => user.voice_preset, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn()
  user: Relation<UserEntity>;
}
