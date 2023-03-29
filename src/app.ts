import { AppFactory } from "@app/core/factory/app-factory";
import { logger } from "@app/core/logger/logger-client";
import { CustomClient } from "@client/custom-client";
import { AppModule as module } from "@modules/app/app.module";
import { GatewayIntentBits } from "discord.js";

export default (async () => {
  try {
    const intents = [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessages,
    ];

    const client = new CustomClient({
      core: { intents },
      token: process.env.TOKEN!,
    });

    const appFactory = new AppFactory({ module, client });

    await appFactory.createApp();

    await client.initialize();
  } catch (err) {
    logger.log(`${err}`);

    process.exit();
  }
})();
