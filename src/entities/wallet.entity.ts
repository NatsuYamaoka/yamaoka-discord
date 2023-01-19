import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { PredefinedBaseEntity } from "./base/base-entity";
import { User } from "./user.entity";

@Entity()
export class Wallet extends PredefinedBaseEntity {
  @Column({ default: 0 })
  balance: number;

  @OneToOne(() => User, (user) => user.wallet, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn()
  user: User;
}
