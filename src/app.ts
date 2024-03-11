import { AppFactory } from "@app/core/factory/app-factory";
import { logger } from "@app/core/logger/logger-client";
import { CustomClient } from "@client/custom-client";
import { AppModule as module } from "@modules/app/app.module";
import { ChannelType, GatewayIntentBits } from "discord.js";
import { UserEntity } from "./entities";
import { userService } from "./services/user.service";
import appConfig from "@app/app.config";

export default (async () => {
  try {
    const intents = [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
    ];

    const client = new CustomClient({
      core: { intents },
      token: process.env.TOKEN || "",
    });

    const appFactory = new AppFactory({ module, client });

    appFactory.createApp();
    await client.initialize();

    if (appConfig.getUsersMessages) {
      client.messageScrapper.getUsersMessages();
    }

    updateVoiceCollection(client);

    process.on("SIGINT", handleExit.bind(null, client));
    process.on("SIGTERM", handleExit.bind(null, client));
    process.on("uncaughtException", (e) =>
      handleExit.bind(null, client, true, e)
    );
    process.on("unhandledRejection", handleExit.bind(null, client, true));
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
})();

async function handleExit(
  client: CustomClient,
  isUnexpected = false,
  error?: Error
) {
  if (isUnexpected === true) {
    logger.error("Bot is shutting down due to an unexpected error", {
      trace: false,
    });

    logger.error(error);
  } else {
    logger.log("Bot is shutting down");
  }

  const voiceManager = client.voiceManager;

  for (const [userId] of voiceManager.usersInVoice) {
    await voiceManager.calculateTimeExpCoinsAndSave(userId);
  }

  logger.log("All users data saved. Goodbye! 💤");

  process.exit(0);
}

function updateVoiceCollection(client: CustomClient) {
  const guild = client.guilds.cache.get(process.env.GUILDID || "");

  if (!guild) {
    return logger.warn("Guild by GUILDID was not found");
  }

  guild.channels.fetch().then((channels) => {
    for (const channel of channels.values()) {
      if (channel && channel.type === ChannelType.GuildVoice) {
        for (const [memberId] of channel.members) {
          const isAFK = guild.afkChannelId === channel.id;

          client.voiceManager.addUserToCollection(memberId, isAFK);
        }
      }
    }
  });
}
