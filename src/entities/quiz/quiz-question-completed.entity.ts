import { Column, Entity, ManyToOne } from "typeorm";
import { PredefinedBaseEntity } from "../base/base-entity";
import { CompletedQuiz } from "./completed-quiz.entity";
import { QuizQuestion } from "./quiz-question.entity";

@Entity()
export class QuizQuestionCompleted extends PredefinedBaseEntity {
  @ManyToOne(
    () => CompletedQuiz,
    (completedQuiz) => completedQuiz.completedQuestions,
    {
      onDelete: "CASCADE",
      orphanedRowAction: "delete",
    }
  )
  completedQuiz: CompletedQuiz;

  @ManyToOne(
    () => QuizQuestion,
    (quizQuestion) => quizQuestion.completedQuestions,
    {
      onDelete: "CASCADE",
      orphanedRowAction: "delete",
    }
  )
  question: QuizQuestion;

  @Column()
  isFailed: boolean;
}
