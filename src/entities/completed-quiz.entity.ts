import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Quiz } from "./quiz.entity";
import { User } from "./user.entity";

@Entity()
export class CompletedQuiz extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column({
    type: "bool",
  })
  isFailed: boolean;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  timestamp: Date;

  @Column({
    type: "text",
    array: true,
  })
  questions: CompletedQuizQuestions[];

  @ManyToOne(() => Quiz, (quiz) => quiz.completedQuizes, {
    cascade: ["remove"],
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn()
  quiz: Quiz;

  @ManyToOne(() => User, (user) => user.completedQuizes)
  @JoinColumn()
  user: User;
}

interface CompletedQuizQuestions {
  questionId: string;
  isFailed: boolean;
}
