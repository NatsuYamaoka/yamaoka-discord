import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { PredefinedBaseEntity } from "./base/base-entity";
import { UserEntity } from "./user.entity";

@Entity()
export class WalletEntity extends PredefinedBaseEntity {
  @Column({ default: 0 })
  balance: number;

  @OneToOne(() => UserEntity, (user) => user.wallet, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn()
  user: UserEntity;
}
