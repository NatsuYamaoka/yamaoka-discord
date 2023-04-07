import { Column, Entity, ManyToOne } from "typeorm";
import { PredefinedBaseEntity } from "../base/base.entity";
import { CompletedQuizEntity } from "./completed-quiz.entity";
import { QuizQuestionEntity } from "./quiz-question.entity";

@Entity()
export class QuizQuestionCompletedEntity extends PredefinedBaseEntity {
  @ManyToOne(
    () => CompletedQuizEntity,
    (completedQuiz) => completedQuiz.completed_questions,
    {
      onDelete: "CASCADE",
      orphanedRowAction: "delete",
    }
  )
  completed_quiz: CompletedQuizEntity;

  @ManyToOne(
    () => QuizQuestionEntity,
    (quizQuestion) => quizQuestion.completed_questions,
    {
      onDelete: "CASCADE",
      orphanedRowAction: "delete",
    }
  )
  question: QuizQuestionEntity;

  @Column()
  is_failed: boolean;
}
