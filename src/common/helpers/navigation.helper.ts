import { ButtonBuilder, ButtonStyle } from "discord.js";

export enum NavigationButtons {
  TO_LEFT = "to-left-button",
  TO_STOP = "to-stop-button",
  TO_RIGHT = "to-right-button",
}

export const getNavigationSetup = () => {
  const toLeftButton = new ButtonBuilder()
    .setCustomId(NavigationButtons.TO_LEFT)
    .setStyle(ButtonStyle.Primary)
    .setEmoji("⬅️");
  const toStopButton = new ButtonBuilder()
    .setCustomId(NavigationButtons.TO_STOP)
    .setStyle(ButtonStyle.Primary)
    .setEmoji("✖️");
  const toRightButton = new ButtonBuilder()
    .setCustomId(NavigationButtons.TO_RIGHT)
    .setStyle(ButtonStyle.Primary)
    .setEmoji("➡️");

  return {
    toLeftButton,
    toStopButton,
    toRightButton,
  };
};
