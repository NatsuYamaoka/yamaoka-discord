import { BaseEntity, PrimaryGeneratedColumn } from "typeorm";

export class PredefinedBaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
}
