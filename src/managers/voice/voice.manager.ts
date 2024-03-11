import { Base } from "@abstracts/client/client.abstract";
import { logger } from "@app/core/logger/logger-client";
import { userService } from "@app/services/user.service";
import { CustomClient } from "@client/custom-client";
import { VoiceInUsersCollection } from "@managers/voice/voice.manager.types";
import { Collection } from "discord.js";

export class VoiceManager extends Base {
  public usersInVoice: VoiceInUsersCollection = new Collection();

  constructor(client: CustomClient) {
    super(client);

    logger.log("Voice Mananger inited");
  }

  public addUserToCollection(uid: string, isAFK: boolean) {
    this.usersInVoice.set(uid, {
      joined_in: new Date(),
      isAFK,
    });
  }

  public getUserFromCollection(uid: string) {
    return this.usersInVoice.get(uid);
  }

  public removeUserFromCollection(uid: string) {
    this.usersInVoice.delete(uid);
  }

  public async calculateTimeExpCoinsAndSave(uid: string, removeAfter = true) {
    try {
      const userData = this.getUserFromCollection(uid);

      if (!userData) {
        return logger.error(`User not found in collection: ${uid}`);
      }

      const userEntity = await userService.findOneByIdOrCreate(uid, {
        wallet: true,
      });
      const timeSpent = new Date().getTime() - userData.joined_in.getTime();

      if (timeSpent < 1000) {
        return; // Not enough time to calculate
      }

      const totalExp = Math.floor(
        (userData.isAFK ? timeSpent / 2 : timeSpent) * 0.01
      );

      userEntity.voice_time = timeSpent + (userEntity?.voice_time || 0);
      userEntity.voice_exp = totalExp + (userEntity?.voice_exp || 0);
      userEntity.wallet.voice_balance =
        Math.floor(timeSpent / (50 * 1000)) + // 50 seconds = 1 coin
        (userEntity?.wallet.voice_balance || 0);
      userEntity.save();

      if (removeAfter) {
        this.removeUserFromCollection(uid);
      }
    } catch (e) {
      logger.error(e);
    }
  }
}
