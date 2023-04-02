import { CustomClient } from "@client/custom-client";

export class Base {
  public client: CustomClient;

  constructor(client: CustomClient) {
    this.client = client;
  }
}
