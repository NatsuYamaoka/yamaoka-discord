import {
  BaseEntity,
  CreateDateColumn,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

export class PredefinedBaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @CreateDateColumn()
  updated_at: Date;
}
