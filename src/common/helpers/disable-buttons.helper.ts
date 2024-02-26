import { ActionRowBuilder, ButtonBuilder } from "discord.js";

export function disableClickedComponent(
  toFilter: string,
  components: ActionRowBuilder<ButtonBuilder>[]
) {
  for (let i = 0; i < components.length; i++) {
    for (let b = 0; b < components[i].components.length; b++) {
      const element = components[i].components[b];

      if (element.data.label === toFilter) {
        element.setDisabled(true);
      } else {
        element.setDisabled(false);
      }
    }
  }
}
