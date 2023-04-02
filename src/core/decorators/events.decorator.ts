import { ClientEvents } from "discord.js";

export function ClientEvent({ name, once }: ClientEventDecoratorOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Function) => {
    target.prototype.name = name;
    target.prototype.once = !!once;
  };
}

export interface ClientEventDecoratorOptions {
  name: keyof ClientEvents;
  once?: boolean;
}
