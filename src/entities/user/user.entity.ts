import { Column, Entity, Index, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { PredefinedBaseEntity } from "../base/base.entity";
import { WalletEntity } from "../currency/wallet.entity";
import { VoicePresetEntity } from "@entities/voice/voice-preset.entity";
import { InventoryEntity } from "@entities/user/inventory.entity";

@Entity()
export class UserEntity extends PredefinedBaseEntity {
  @Column()
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
}
