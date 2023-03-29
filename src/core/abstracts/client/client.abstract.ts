import { CustomClient } from "@client/custom-client";

export class Base {
  public customClient: CustomClient;

  constructor(client: CustomClient) {
    this.customClient = client;
  }
}
