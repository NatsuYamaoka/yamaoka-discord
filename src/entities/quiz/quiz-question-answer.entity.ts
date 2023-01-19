import { Column, Entity, ManyToOne } from "typeorm";
import { PredefinedBaseEntity } from "../base/base-entity";
import { QuizQuestion } from "./quiz-question.entity";

@Entity()
export class QuizQuestionAnswer extends PredefinedBaseEntity {
  @ManyToOne(() => QuizQuestion, (quizQuestion) => quizQuestion.answers, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  question: QuizQuestion;

  @Column()
  content: string;
}
