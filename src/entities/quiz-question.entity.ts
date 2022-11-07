import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Quiz } from "./quiz.entity";

@Entity()
export class QuizQuestion extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column()
  question: string;

  @Column({
    default: 0,
  })
  correctAnswers: number;

  @Column({
    default: 0,
  })
  failedAnswers: number;

  @Column({
    type: "simple-array",
    default: [],
  })
  answers: string[];

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, {
    cascade: ["remove"],
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn()
  quiz: Quiz;
}
