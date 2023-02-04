import { Axios } from "axios";
import { BaseApi } from "../../core/abstracts/api/base-api.abstract";
import { RawApiUser } from "./types/raw-api.types";

export class RawApiManager extends BaseApi {
  constructor() {
    super(new Axios(), {
      baseURL: "https://discord.com/api",
      headers: { authorization: `Bot ${process.env.TOKEN}` },
    });
  }

  getRawUser(uid: string) {
    return this.get<RawApiUser>(`/users/${uid}`);
  }
}
