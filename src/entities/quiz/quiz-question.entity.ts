import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { PredefinedBaseEntity } from "../base/base.entity";
import { QuizQuestionAnswerEntity } from "./quiz-question-answer.entity";
import { QuizQuestionCompletedEntity } from "./quiz-question-completed.entity";
import { QuizEntity } from "./quiz.entity";

@Entity()
export class QuizQuestionEntity extends PredefinedBaseEntity {
  @Column()
  question: string;

  @OneToMany(
    () => QuizQuestionAnswerEntity,
    (quizQuestionAnswer) => quizQuestionAnswer.question,
    { cascade: true }
  )
  answers: QuizQuestionAnswerEntity[];

  @ManyToOne(() => QuizEntity, (quiz) => quiz.questions, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  quiz: QuizEntity;

  @OneToMany(
    () => QuizQuestionCompletedEntity,
    (quizQuestionCompleted) => quizQuestionCompleted.question
  )
  completed_questions: QuizQuestionCompletedEntity[];
}
