import { GatewayIntentBits } from "discord.js";
import { CustomClient } from "./core/client/custom-client";

export default (async () => {
  try {
    const Client = new CustomClient({
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

    throw new Error("Can't launch bot");
  }
})();
