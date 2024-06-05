/* eslint-disable @typescript-eslint/ban-types */
import { ClientEvents } from "discord.js";

export function ClientEvent({ name, once }: ClientEventDecoratorOptions) {
  return (target: Function) => {
    target.prototype.name = name;
    target.prototype.once = !!once;
  };
}

export interface ClientEventDecoratorOptions {
  name: keyof ClientEvents;
  once?: boolean;
}
