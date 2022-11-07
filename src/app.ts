import { GatewayIntentBits } from "discord.js";
import YamaokaClient from "./core/yamaoka.client";

export default (async () => {
  try {
    const Client = new YamaokaClient({
      core: {
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildMessageReactions,
        ],
      },
    });

    await Client.initialize();
  } catch (err) {
    console.log(err);

    throw new Error("⚠️ ERROR HAPPEN WHEN TRYING TO LAUNCH APP");
  }
})();
