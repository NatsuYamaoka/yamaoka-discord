import { Client } from "discord.js";
import { CommandManager } from "../managers/command.manager";
import { EventManager } from "../managers/event.manager";
import { YamaokaClientOptions } from "../typings/yamaoka-client.types";
import DatabaseClient from "./database.client";

export default class YamaokaClient extends Client {
  public databaseClient: DatabaseClient;
  public eventManager: EventManager;
  public commandManager: CommandManager;
  public rootDir = process.env.NODE_ENV === "dev" ? "src" : "build";

  constructor(options: YamaokaClientOptions) {
    super(options.core);
  }

  public async initialize() {
    this.eventManager = new EventManager(this);
    this.commandManager = new CommandManager(this);
    this.databaseClient = new DatabaseClient();

    await this.databaseClient.initialize();

    await this.eventManager.loadEvents();
    await this.commandManager.loadCommands();

    await this.login(process.env.TOKEN);
  }
}
