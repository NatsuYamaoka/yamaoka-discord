import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CompletedQuiz } from "./completed-quiz.entity";
import { Quiz } from "./quiz.entity";
import { Wallet } from "./wallet.entity";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column()
  uid: string;

  @OneToOne(() => Wallet, (wallet) => wallet.user, {
    cascade: ["insert"],
  })
  wallet: Wallet;

  @OneToMany(() => Quiz, (quiz) => quiz.author)
  quizes: Quiz[];

  @OneToMany(() => CompletedQuiz, (completedQuiz) => completedQuiz.user)
  completedQuizes: CompletedQuiz[];
}
