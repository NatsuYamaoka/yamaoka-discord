import { CustomClient } from "../../client/custom-client";

export class Base {
  customClient: CustomClient;

  constructor(client: CustomClient) {
    this.customClient = client;
  }
}
