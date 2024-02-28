import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { PredefinedBaseEntity } from "../base/base.entity";
import { WalletEntity } from "../currency/wallet.entity";
import { VoicePresetEntity } from "@entities/voice/voice-preset.entity";
import { InventoryEntity } from "@entities/user/inventory.entity";
import { ProfilePresetEntity } from "@entities/user/profile-preset.entity";

@Entity()
export class UserEntity extends BaseEntity {
  @PrimaryColumn()
  @Index()
  uid: string;

  @Column({
    default: 0,
  })
  level: number;

  @Column({
    default: 0,
  })
  message_exp: number;

  @Column({
    default: 0,
  })
  messages_sent: number;

  @Column({
    default: 0,
  })
  voice_time: number;

  @Column({
    default: 0,
  })
  voice_exp: number;

  @OneToOne(() => WalletEntity, (wallet) => wallet.user, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  wallet: WalletEntity;

  @OneToOne(() => VoicePresetEntity, (voicePreset) => voicePreset.user, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  voice_preset: VoicePresetEntity;

  @OneToOne(() => InventoryEntity, (inventory) => inventory.user, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  inventory: InventoryEntity;

  @OneToMany(() => ProfilePresetEntity, (profilePreset) => profilePreset.user, {
    nullable: true,
  })
  profile_presets?: ProfilePresetEntity[];

  @CreateDateColumn()
  created_at: Date;

  @CreateDateColumn()
  updated_at: Date;
}
