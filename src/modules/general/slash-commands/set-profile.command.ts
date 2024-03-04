import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { SlashCommand } from "@decorators/commands.decorator";
import { UserEntity } from "@entities/index";

// TODO: WORK IN PROGRESS
@SlashCommand({
  name: "set-profile",
  description: "sets your profile",
})
export class SetProfileCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  async execute(interaction: CmdArg<CmdType.SLASH_COMMAND>) {
    await interaction.deferReply();

    // TODO: Remove this when the command is ready
    const devMode = true;
    if (devMode) {
      return this.sendError("This command is not available yet", interaction);
    }

    const userData = await UserEntity.findOne({
      where: {
        uid: interaction.user.id,
      },
      relations: {
        inventory: true,
        wallet: true,
        profile_presets: true,
        selected_preset: true,
      },
    }).then((user) => {
      if (!user) {
        return UserEntity.save({
          uid: interaction.user.id,
          inventory: {},
          wallet: {},
        });
      } else {
        return user;
      }
    });

    if (!userData.profile_presets || userData.profile_presets?.length == 0) {
      return this.sendError(
        "You don't have any profile presets, please create one",
        interaction
      );
    }

    // TODO: Let user select a preset with a dropdown
    let selectedPreset = undefined;
    if (userData.selected_preset?.length === 0) {
      selectedPreset = userData.profile_presets[0];
    }

    userData.selected_preset = selectedPreset ? [selectedPreset] : [];
    await UserEntity.save(userData);

    this.sendSuccess("Profile preset selected", interaction);
  }
}
