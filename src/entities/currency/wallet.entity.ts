import { Column, Entity, JoinColumn, OneToOne, Relation } from "typeorm";
import { PredefinedBaseEntity } from "../base/base.entity";
import { UserEntity } from "../user/user.entity";

@Entity()
export class WalletEntity extends PredefinedBaseEntity {
  @Column({ default: 0 })
  balance: number;

  @Column({ default: 0 })
  voice_balance: number;

  @Column()
  userUid: string;

  @OneToOne(() => UserEntity, (user) => user.wallet, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn()
  user: Relation<UserEntity>;
}
