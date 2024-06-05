import { PredefinedBaseEntity } from "@entities/base/base.entity";
import { UserEntity } from "@entities/user/user.entity";
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  Relation,
} from "typeorm";

@Entity()
export class ProfilePresetEntity extends PredefinedBaseEntity {
  @Column()
  json: string;

  @Column()
  updated_by: string;

  @ManyToOne(() => UserEntity, (user) => user.profile_presets, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    orphanedRowAction: "delete",
    nullable: true,
  })
  @JoinColumn()
  user?: Relation<UserEntity>;

  @ManyToMany(() => UserEntity, (user) => user.selected_preset)
  @JoinTable()
  selected_by: Relation<UserEntity>;
}
