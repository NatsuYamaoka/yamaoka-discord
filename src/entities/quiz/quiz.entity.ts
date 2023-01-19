import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { CompletedQuiz } from "./completed-quiz.entity";
import { QuizQuestion } from "./quiz-question.entity";
import { User } from "../user.entity";
import { PredefinedBaseEntity } from "../base/base-entity";

@Entity()
export class Quiz extends PredefinedBaseEntity {
  @Column()
  name: string;

  @Column()
  reward: number;

  @Column()
  completePercentage: number;

  @ManyToOne(() => User, (user) => user.quizes, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  author: User;

  @OneToMany(() => QuizQuestion, (quizQuestion) => quizQuestion.quiz, {
    cascade: ["insert"],
  })
  questions: QuizQuestion[];

  @OneToMany(() => CompletedQuiz, (completedQuiz) => completedQuiz.quiz)
  completedQuizes: CompletedQuiz[];
}
