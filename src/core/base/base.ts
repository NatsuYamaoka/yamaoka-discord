import YamaokaClient from "../yamaoka.client";

export class Base {
  yamaokaClient: YamaokaClient;

  constructor(client: YamaokaClient) {
    this.yamaokaClient = client;
  }
}
