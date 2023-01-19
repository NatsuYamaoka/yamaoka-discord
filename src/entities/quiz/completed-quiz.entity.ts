import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Quiz } from "./quiz.entity";
import { User } from "../user.entity";
import { PredefinedBaseEntity } from "../base/base-entity";
import { QuizQuestionCompleted } from "./quiz-question-completed.entity";

@Entity()
export class CompletedQuiz extends PredefinedBaseEntity {
  @Column()
  isFailed: boolean;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  timestamp: Date;

  @OneToMany(() => QuizQuestionCompleted, (quizQuestionCompleted) => quizQuestionCompleted.completedQuiz)
  completedQuestions: QuizQuestionCompleted[];

  @ManyToOne(() => Quiz, (quiz) => quiz.completedQuizes, {
    cascade: ["remove"],
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  quiz: Quiz;

  @ManyToOne(() => User, (user) => user.completedQuizes)
  user: User;
}