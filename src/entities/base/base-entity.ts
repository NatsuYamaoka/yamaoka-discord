import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export class PredefinedBaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @CreateDateColumn()
  updated_at: Date;
}
