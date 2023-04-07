import { Column, Entity, ManyToOne } from "typeorm";
import { PredefinedBaseEntity } from "../base/base.entity";
import { QuizQuestionEntity } from "./quiz-question.entity";

@Entity()
export class QuizQuestionAnswerEntity extends PredefinedBaseEntity {
  @ManyToOne(() => QuizQuestionEntity, (quizQuestion) => quizQuestion.answers, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  question: QuizQuestionEntity;

  @Column()
  content: string;
}
