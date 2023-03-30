import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { CompletedQuizEntity } from "./completed-quiz.entity";
import { QuizQuestionEntity } from "./quiz-question.entity";
import { UserEntity } from "../user.entity";
import { PredefinedBaseEntity } from "../base/base-entity";

@Entity()
export class QuizEntity extends PredefinedBaseEntity {
  @Column()
  name: string;

  @Column()
  reward: number;

  @Column()
  complete_percentage: number;

  @ManyToOne(() => UserEntity, (user) => user.quizes, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  author: UserEntity;

  @OneToMany(() => QuizQuestionEntity, (quizQuestion) => quizQuestion.quiz, {
    cascade: ["insert"],
  })
  questions: QuizQuestionEntity[];

  @OneToMany(() => CompletedQuizEntity, (completedQuiz) => completedQuiz.quiz)
  completed_quizes: CompletedQuizEntity[];
}
