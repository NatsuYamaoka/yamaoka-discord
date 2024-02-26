import { APIEmbed, EmbedBuilder } from "discord.js";

export const createEmbed = (opt: APIEmbed) => new EmbedBuilder(opt);
