import { CustomClientOptions } from "@client/custom-client.types";
import { DatabaseClient } from "@database/database-client";
import {
  CommandManager,
  EventManager,
  MessagesScrapper,
  RawApiManager,
  VoiceManager,
} from "@managers/index";

import { Client } from "discord.js";

export class CustomClient extends Client {
  public db: DatabaseClient;
  public eventManager: EventManager;
  public messageScrapper: MessagesScrapper;
  public commandManager: CommandManager;
  public rawApiManager: RawApiManager;
  public voiceManager: VoiceManager;
  public rootDir =
    { dev: "src", prod: "build" }[process.env.NODE_ENV || "src"] || "src";
  private _token: string;

  constructor({ core, token }: CustomClientOptions) {
    super(core);

    this.messageScrapper = new MessagesScrapper(this);
    this.eventManager = new EventManager(this);
    this.commandManager = new CommandManager(this);
    this.voiceManager = new VoiceManager(this);
    this.rawApiManager = new RawApiManager();
    this.db = new DatabaseClient();

    this._token = token;
  }

  public async initialize() {
    await this.db._init();
    await this.login(this._token);
  }
}
