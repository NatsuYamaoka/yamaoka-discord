import { Axios } from "axios";

export class RawApiManager extends Axios {
  constructor() {
    super({
      baseURL: "https://discord.com/api",
      headers: { Authorization: `Bot ${process.env.TOKEN}` },
    });
  }

  //TODO: Add types for returned back user object
  getRawUser<Q>(uid: string) {
    return this.get<Q>(`/users/${uid}`);
  }
}
