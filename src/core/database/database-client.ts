import { DataSource } from "typeorm";
import * as entities from "@entities/index";
import { logger } from "@app/core/logger/logger-client";

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
      logging: ["error"],
    });

    logger.log("Database Manager inited");
  }

  public async _init() {
    await this.initialize().catch((err) => {
      logger.error("Failed to connect to db");
      logger.error(err);
      process.exit(1);
    });

    logger.log("Connected to db");
  }
}
