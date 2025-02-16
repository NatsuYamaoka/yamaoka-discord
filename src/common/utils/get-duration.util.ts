/* eslint-disable @typescript-eslint/no-unused-vars */
import { Pluralize } from "./pluralize.util";

const pluralizations = {
  d: {
    oneObject: "день",
    someObjects: "дня",
    manyObjects: "дней",
  },
  h: {
    oneObject: "час",
    someObjects: "часа",
    manyObjects: "часов",
  },
  m: {
    oneObject: "минута",
    someObjects: "минуты",
    manyObjects: "минут",
  },
  s: {
    oneObject: "секунда",
    someObjects: "секунды",
    manyObjects: "секунд",
  },
};

export function GetDuration(seconds: number, precise = false) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const values = ["d", "h", "m", "s"] as const;
  let return_value = "";

  for (let i = 0; i < values.length; i++) {
    const value = eval(values[i]);

    if (value > 0 || (seconds == 0 && i == 3)) {
      const word = Pluralize(value, "", pluralizations[values[i]]);
      return_value += `${value} ${word} `;
      if (!precise && i > 0 && eval(values[i - 1]) > 0) {
        break;
      }
    }
  }
  return return_value.trim();
}
