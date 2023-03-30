import { logger } from "@app/core/logger/logger-client";
import { CustomClientOptions } from "@client/custom-client.types";
import { DatabaseClient } from "@database/database-client";
import { CommandManager, EventManager, RawApiManager } from "@managers/index";
import { Client } from "discord.js";

export class CustomClient extends Client {
  public databaseClient: DatabaseClient;
  public eventManager: EventManager;
  public commandManager: CommandManager;
  public rawApiManager: RawApiManager;
  public rootDir =
    { dev: "src", prod: "build" }[process.env.NODE_ENV!] || "src";
  private _token: string;

  constructor({ core, token }: CustomClientOptions) {
    super(core);

    this.eventManager = new EventManager(this);
    this.commandManager = new CommandManager(this);
    this.rawApiManager = new RawApiManager();
    this.databaseClient = new DatabaseClient();

    this._token = token;
  }

  public async initialize() {
    await this.databaseClient._init();

    await this.login(this._token);

    logger.info("Executing CommandManager#setRegisterCommandId");

    await this.commandManager.setRegisterCommandId();
  }
}
