import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { QuizEntity } from "./quiz.entity";
import { UserEntity } from "../user.entity";
import { PredefinedBaseEntity } from "../base/base.entity";
import { QuizQuestionCompletedEntity } from "./quiz-question-completed.entity";

@Entity()
export class CompletedQuizEntity extends PredefinedBaseEntity {
  @Column()
  is_failed: boolean;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  timestamp: Date;

  @OneToMany(
    () => QuizQuestionCompletedEntity,
    (quizQuestionCompleted) => quizQuestionCompleted.completed_quiz
  )
  completed_questions: QuizQuestionCompletedEntity[];

  @ManyToOne(() => QuizEntity, (quiz) => quiz.completed_quizes, {
    cascade: true,
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  quiz: QuizEntity;

  @ManyToOne(() => UserEntity, (user) => user.completed_quizes)
  user: UserEntity;
}
