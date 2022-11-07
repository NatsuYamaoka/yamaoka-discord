import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Wallet extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column({
    default: 0,
  })
  balance: number;

  @OneToOne(() => User, (user) => user.wallet, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn()
  user: User;
}
