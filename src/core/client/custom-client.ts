import { Client } from "discord.js";
import { CommandManager, EventManager, RawApiManager } from "../../managers";
import { DatabaseClient } from "../database/database-client";
import { CustomClientOptions } from "./types/client.types";

export class CustomClient extends Client {
  public databaseClient: DatabaseClient;
  public eventManager: EventManager;
  public commandManager: CommandManager;
  public rawApiManager: RawApiManager;
  public rootDir = process.env.NODE_ENV === "dev" ? "src" : "build";

  constructor(options: CustomClientOptions) {
    super(options.core);
  }

  public async initialize() {
    this.eventManager = new EventManager(this);
    this.commandManager = new CommandManager(this);
    this.databaseClient = new DatabaseClient();
    this.rawApiManager = new RawApiManager();

    await this.databaseClient.initialize();

    await this.eventManager.loadEvents();
    await this.commandManager.loadCommands();

    await this.login(process.env.TOKEN);
  }
}
