import { AppFactory } from "@app/core/factory/app-factory";
import { logger } from "@app/core/logger/logger-client";
import { CustomClient } from "@client/custom-client";
import { AppModule as module } from "@modules/app/app.module";
import {
  handleUncaughtException,
  handleUnhandledRejection,
} from "@utils/handle-exceptions.util";
import { GatewayIntentBits } from "discord.js";

export default (async () => {
  try {
    const intents = [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
    ];

    if (!process.env.TOKEN) {
      logger.error("No bot token was found in env file");

      return process.exit(0);
    }

    const client = new CustomClient({
      core: { intents },
      token: process.env.TOKEN,
    });

    const appFactory = new AppFactory({ module, client });

    appFactory.createApp();

    client.initialize();

    process.on("uncaughtException", handleUncaughtException);
    process.on("unhandledRejection", handleUnhandledRejection);
  } catch (err) {
    logger.log(err);

    process.exit(1);
  }
})();
