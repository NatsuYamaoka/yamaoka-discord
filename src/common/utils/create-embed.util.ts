import { EmbedBuilder } from "@discordjs/builders";
import { APIEmbed } from "discord.js";

export const createEmbed = (opt: APIEmbed) => new EmbedBuilder(opt);
