import { logger } from "@app/core/logger/logger-client";
import { CustomClient } from "@client/custom-client";
import { UserEntity } from "@entities/index";
import { ChannelType, Collection, TextChannel } from "discord.js";
import "dotenv/config";

export class MessagesScrapper {
  private client: CustomClient;
  private isRunning = false;
  private channels: {
    total: number;
    updated: number;
    currentBatch: number;
  };

  constructor(client: CustomClient) {
    this.client = client;
  }

  public getCurrentStatus() {
    return {
      isRunning: this.isRunning,
      channels: this.channels,
    };
  }

  public async getUsersMessages() {
    const guild = this.client.guilds.cache.get(process.env.GUILDID || "");

    if (!guild) {
      return logger.warn(
        "Cannot find guild for fetching users messages. Skipping..."
      );
    } else if (this.isRunning) {
      return logger.warn("Already updating users messages");
    }

    this.isRunning = true;
    this.channels = { updated: 0, total: 0, currentBatch: 0 };

    const users = await UserEntity.find();

    const startTime = Date.now();
    logger.info("Fetching users messages...");

    const channels = guild.channels.cache.filter(
      (channel) => channel.type === ChannelType.GuildText
    ) as Collection<string, TextChannel>;
    this.channels.total = channels.size;

    const usersMessages = new Map<string, number>();

    for (const channel of channels.values()) {
      let lastMessage = undefined as string | undefined;
      let isEndOfMessages = false;
      while (!isEndOfMessages) {
        this.channels.currentBatch += 1;

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

      this.channels.currentBatch = 0;
      this.channels.updated += 1;
    }

    for (const user of users) {
      const messages = usersMessages.get(user.uid) || 0;
      user.messages_sent = messages;
      await user.save();
    }

    this.isRunning = false;

    logger.info("Users messages count updated! 🎉");
    logger.info(`Time spent: ${Date.now() - startTime}ms`);
  }
}
