import { Collection } from "discord.js";

export type VoiceInUser = {
  joined_in: Date;
  isAFK: boolean;
};

export type VoiceInUsersCollection = Collection<string, VoiceInUser>;
