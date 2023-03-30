import { GuildEntity } from "@entities/guild.entity";
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { PredefinedBaseEntity } from "./base/base-entity";
import { CompletedQuizEntity } from "./quiz/completed-quiz.entity";
import { QuizEntity } from "./quiz/quiz.entity";
import { WalletEntity } from "./wallet.entity";

@Entity()
export class UserEntity extends PredefinedBaseEntity {
  @Column()
  uid: string;

  @ManyToOne(() => GuildEntity, (guild) => guild.users, {
    cascade: ["insert"],
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  guild: GuildEntity;

  @Column({ default: 0 })
  level: number;

  @Column({ default: 0 })
  message_exp: number;

  @Column({ default: 0 })
  messages_sent: number;

  @Column({ default: 0 })
  voice_time: number;

  @Column({ default: 0 })
  voice_exp: number;

  @OneToOne(() => WalletEntity, (wallet) => wallet.user, {
    cascade: ["insert"],
  })
  wallet: WalletEntity;

  @OneToMany(() => QuizEntity, (quiz) => quiz.author)
  quizes: QuizEntity[];

  @OneToMany(() => CompletedQuizEntity, (completedQuiz) => completedQuiz.user)
  completed_quizes: CompletedQuizEntity[];
}
