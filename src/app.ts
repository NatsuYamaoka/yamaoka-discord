import { AppFactory } from "@app/core/factory/app-factory";
import { logger } from "@app/core/logger/logger-client";
import { CustomClient } from "@client/custom-client";
import { AppModule as module } from "@modules/app/app.module";
import {
  handleUncaughtException,
  handleUnhandledRejection,
} from "@utils/handle-exceptions.util";
import { ChannelType, GatewayIntentBits } from "discord.js";
import { UserEntity } from "./entities";

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
    await client.initialize();

    const guild = client.guilds.cache.get(process.env.GUILDID || "");

    if (guild) {
      const channels = await guild.channels.fetch();

      for (const channel of channels.values()) {
        if (channel && channel.type === ChannelType.GuildVoice) {
          
          for (const [memberId] of channel.members) {
            const isAFK = guild.afkChannelId === channel.id;
            client.voiceManager.addUserToCollection(memberId, isAFK);
          }
        }
      }
    }

    process.on("SIGINT", handleExit.bind(null, client));
    process.on("SIGTERM", handleExit.bind(null, client));
    process.on("uncaughtException", handleUncaughtException);
    process.on("unhandledRejection", handleUnhandledRejection);
  } catch (err) {
    logger.log(err);

    process.exit(1);
  }
})();

async function handleExit(client: CustomClient) {
  logger.log("Bot is shutting down");

  const voiceCollection = client.voiceManager.usersInVoice;
  for (const [userId, userData] of voiceCollection) {
    const userEntity = await UserEntity.findOne({ where: { uid: userId } });
    const timeDifference = new Date().getTime() - userData.joined_in.getTime();
    const timeSpent = Math.floor(
      (userData.isAFK ? timeDifference : timeDifference) / 2
    );

    await UserEntity.save({
      uid: userId,
      voice_time: timeSpent + (userEntity?.voice_time || 0),
      voice_exp: Math.floor(timeSpent * 0.1) + (userEntity?.voice_exp || 0), // Is this formula correct? @shysecre
    });
  }

  logger.log("All users data saved. Goodbye! 💤");

  process.exit(0);
}
