import { logger } from "@app/core/logger/logger-client";
import { CustomClientOptions } from "@client/custom-client.types";
import { DatabaseClient } from "@database/database-client";
import { CommandManager, EventManager, RawApiManager } from "@managers/index";
import { Client } from "discord.js";

export class CustomClient extends Client {
  public db: DatabaseClient;
  public eventManager: EventManager;
  public commandManager: CommandManager;
  public rawApiManager: RawApiManager;
  public rootDir =
    { dev: "src", prod: "build" }[process.env.NODE_ENV || "src"] || "src";
  private _token: string;

  constructor({ core, token }: CustomClientOptions) {
    super(core);

    this.eventManager = new EventManager(this);
    this.commandManager = new CommandManager(this);
    this.rawApiManager = new RawApiManager();
    this.db = new DatabaseClient();

    this._token = token;
  }

  public async initialize() {
    try {
      await this.db._init().catch((err) => {
        logger.error("Can't establish successful connection with DB");
        process.exit(1);
      });

      await this.login(this._token);
    } catch (err) {
      logger.error("Error happened during bot init");
    }
  }
}
