import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CompletedQuiz } from "./completed-quiz.entity";
import { QuizQuestion } from "./quiz-question.entity";
import { User } from "./user.entity";

@Entity()
export class Quiz extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column()
  name: string;

  @Column()
  reward: string;

  @Column({ type: "int" })
  completePercentage: number;

  @ManyToOne(() => User, (user) => user.quizes, {
    cascade: ["remove"],
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn()
  author: User;

  @OneToMany(() => QuizQuestion, (quizQuestion) => quizQuestion.quiz, {
    cascade: ["insert", "update"],
  })
  questions: QuizQuestion[];

  @OneToMany(() => CompletedQuiz, (completedQuiz) => completedQuiz.quiz)
  completedQuizes: CompletedQuiz[];
}
