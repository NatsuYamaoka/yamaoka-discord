import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import { PredefinedBaseEntity } from "./base/base-entity";
import { CompletedQuiz } from "./quiz/completed-quiz.entity";
import { Quiz } from "./quiz/quiz.entity";
import { Wallet } from "./wallet.entity";

@Entity()
export class User extends PredefinedBaseEntity {
  @Column()
  uid: string;

  @Column()
  gid: string;

  @OneToOne(() => Wallet, (wallet) => wallet.user, {
    cascade: ["insert"],
  })
  wallet: Wallet;

  @OneToMany(() => Quiz, (quiz) => quiz.author)
  quizes: Quiz[];

  @OneToMany(() => CompletedQuiz, (completedQuiz) => completedQuiz.user)
  completedQuizes: CompletedQuiz[];
}
