import { BaseApi } from "@abstracts/api/base-api.abstract";
import { logger } from "@app/core/logger/logger-client";
import { RawApiUser } from "@managers/raw-api/raw-api.types";
import { Axios } from "axios";

export class RawApiManager extends BaseApi {
  constructor() {
    super(new Axios(), {
      baseURL: "https://discord.com/api",
      headers: { authorization: `Bot ${process.env.TOKEN}` },
    });

    logger.log("RawApi Manager inited");
  }

  getRawUser(uid: string) {
    return this.get<RawApiUser>(`users/${uid}`);
  }
}
