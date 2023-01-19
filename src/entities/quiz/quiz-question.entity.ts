import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { PredefinedBaseEntity } from "../base/base-entity";
import { QuizQuestionAnswer } from "./quiz-question-answer.entity";
import { QuizQuestionCompleted } from "./quiz-question-completed.entity";
import { Quiz } from "./quiz.entity";

@Entity()
export class QuizQuestion extends PredefinedBaseEntity {
  @Column()
  question: string;

  @OneToMany(
    () => QuizQuestionAnswer,
    (quizQuestionAnswer) => quizQuestionAnswer.question,
    {
      cascade: ["insert"],
    }
  )
  answers: QuizQuestionAnswer[];

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  quiz: Quiz;

  @OneToMany(
    () => QuizQuestionCompleted,
    (quizQuestionCompleted) => quizQuestionCompleted.question
  )
  completedQuestions: QuizQuestionCompleted[];
}
