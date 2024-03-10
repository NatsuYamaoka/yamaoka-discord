import { AppFactory } from "@app/core/factory/app-factory";
import { logger } from "@app/core/logger/logger-client";
import { CustomClient } from "@client/custom-client";
import { AppModule as module } from "@modules/app/app.module";
import { ChannelType, GatewayIntentBits } from "discord.js";
import { UserEntity } from "./entities";
import { userService } from "./services/user.service";
import GetUsersMessages from "@scripts/db/get-users-messages";
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
      await GetUsersMessages(client);
    }

    updateVoiceCollection(client);

    process.on("SIGINT", handleExit.bind(null, client));
    process.on("SIGTERM", handleExit.bind(null, client));
    process.on("uncaughtException", handleExit.bind(null, client, true));
    process.on("unhandledRejection", handleExit.bind(null, client, true));
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
})();

async function handleExit(client: CustomClient, isUnexpected = false) {
  if (isUnexpected === true) {
    logger.error("Bot is shutting down due to an unexpected error", {
      trace: false, // ? Are we really need to log the trace here? 🤔
    });
  } else {
    logger.log("Bot is shutting down");
  }

  const voiceCollection = client.voiceManager.usersInVoice;

  for (const [userId, userData] of voiceCollection) {
    const userEntity = await userService.findOneByIdOrCreate(userId);

    const timeDifference = new Date().getTime() - userData.joined_in.getTime();
    const timeSpent = Math.floor(
      userData.isAFK ? timeDifference / 2 : timeDifference
    );

    await UserEntity.save({
      uid: userId,
      voice_time: timeDifference + (userEntity?.voice_time || 0),
      voice_exp: Math.floor(timeSpent * 0.01) + (userEntity?.voice_exp || 0),
    });
  }

  logger.log("All users data saved. Goodbye! 💤");

  process.exit(0);
}

function updateVoiceCollection(client: CustomClient) {
  const guild = client.guilds.cache.get(process.env.GUILDID || "");

  if (!guild) {
    return logger.warn("Guild by GUILDID was not found");
  }

  const channels = guild.channels.cache;

  for (const channel of channels.values()) {
    if (channel && channel.type === ChannelType.GuildVoice) {
      for (const [memberId] of channel.members) {
        const isAFK = guild.afkChannelId === channel.id;

        client.voiceManager.addUserToCollection(memberId, isAFK);
      }
    }
  }
}
