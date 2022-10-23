import { ButtonBuilder, ButtonStyle } from "discord.js";
import { ScrollButtons } from "../yamaoka/typings/enums";

export const getScrollSetup = () => {
  const toLeftButton = new ButtonBuilder()
    .setCustomId(ScrollButtons.TO_LEFT)
    .setStyle(ButtonStyle.Primary)
    .setEmoji("⬅️");
  const toStopButton = new ButtonBuilder()
    .setCustomId(ScrollButtons.TO_STOP)
    .setStyle(ButtonStyle.Primary)
    .setEmoji("✖️");
  const toRightButton = new ButtonBuilder()
    .setCustomId(ScrollButtons.TO_RIGHT)
    .setStyle(ButtonStyle.Primary)
    .setEmoji("➡️");

  return {
    toLeftButton,
    toStopButton,
    toRightButton,
  };
};
