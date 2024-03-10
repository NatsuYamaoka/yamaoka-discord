import { logger } from "@app/core/logger/logger-client";
import { CustomClient } from "@client/custom-client";
import { UserEntity } from "@entities/index";
import { ChannelType } from "discord.js";
import "dotenv/config";

export default async function GetUsersMessages(client: CustomClient) {
  const users = await UserEntity.find();
  const guild = client.guilds.cache.get(process.env.GUILDID || "");

  if (!guild) {
    return logger.warn(
      "Cannot find guild for fetching users messages. Skipping..."
    );
  }

  const startTime = Date.now();
  logger.info("Fetching users messages...");
  const channels = guild.channels.cache;
  const usersMessages = new Map<string, number>();

  for (const channel of channels.values()) {
    if (channel.type !== ChannelType.GuildText) {
      continue;
    }

    let lastMessage = undefined as string | undefined;
    let isEndOfMessages = false;
    while (!isEndOfMessages) {
      const messages = await channel.messages.fetch({
        limit: 100,
        before: lastMessage,
      });

      for (const user of users) {
        const userMessages = messages.filter(
          (msg) => msg.author.id === user.uid
        );
        usersMessages.set(
          user.uid,
          (usersMessages.get(user.uid) || 0) + userMessages.size
        );
      }

      lastMessage = messages.last()?.id;
      isEndOfMessages = messages.size < 100;
    }
  }

  for (const user of users) {
    const messages = usersMessages.get(user.uid) || 0;
    user.messages_sent = messages;
    await user.save();
  }

  logger.info("Users messages count updated! 🎉");
  logger.info(`Time spent: ${Date.now() - startTime}ms`);
}
