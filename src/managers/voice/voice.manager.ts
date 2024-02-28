import { Base } from "@abstracts/client/client.abstract";
import { logger } from "@app/core/logger/logger-client";
import { CustomClient } from "@client/custom-client";
import { VoiceInUsersCollection } from "@managers/voice/voice.manager.types";
import { Collection } from "discord.js";

export class VoiceManager extends Base {
  public usersInVoice: VoiceInUsersCollection = new Collection();

  constructor(client: CustomClient) {
    super(client);

    logger.log("Voice Mananger inited");
  }

  public addUserToCollection(uid: string) {
    this.usersInVoice.set(uid, {
      joined_in: new Date(),
    });
  }

  public getUserFromCollection(uid: string) {
    return this.usersInVoice.get(uid);
  }

  public removeUserFromCollection(uid: string) {
    this.usersInVoice.delete(uid);
  }
}
