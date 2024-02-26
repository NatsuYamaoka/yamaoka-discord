import { UserEntity } from "@entities/user/user.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";

@Entity()
export class VoicePresetEntity {
  @Column()
  name: string;

  @Column()
  slots: number;

  @OneToOne(() => UserEntity, (user) => user.voice_preset, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn()
  user: UserEntity;
}
