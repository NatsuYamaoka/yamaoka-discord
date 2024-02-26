import { Collection } from "discord.js";

export type VoiceInUser = {
  joined_in: Date;
};

export type VoiceInUsersCollection = Collection<string, VoiceInUser>;
