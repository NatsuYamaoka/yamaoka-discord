import { DataSource } from "typeorm";
import * as entities from "../../entities";

export class DatabaseClient extends DataSource {
  constructor() {
    super({
      type: "postgres",
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      synchronize: true,
      ssl: false,
      entities,
      logging: ["schema", "query", "info", "error"],
    });
  }
}
