import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { ProfileCommandSubCommandsTypes } from "@app/common/types/commands.types";
import { SlashCommand } from "@decorators/commands.decorator";
import { UserEntity } from "@entities/index";
import { ProfilePresetEntity } from "@entities/user/profile-preset.entity";
import { SlashCommandBuilder } from "discord.js";

// TODO: IMPLEMENT

@SlashCommand({
  name: "profile",
  description: "Profile command",
  data: new SlashCommandBuilder()
    .addSubcommand((sub) =>
      sub
        .setName(ProfileCommandSubCommandsTypes.CREATE)
        .setDescription("create preset")
        .addStringOption((opt) =>
          opt
            .setName("json")
            .setDescription("stringified JSON representation of the embed")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName(ProfileCommandSubCommandsTypes.UPDATE)
        .setDescription("update preset")
        .addStringOption((opt) =>
          opt.setName("id").setDescription("id of the preset").setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("json")
            .setDescription("stringified JSON representation of the embed")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName(ProfileCommandSubCommandsTypes.DELETE)
        .setDescription("delete preset")
        .addStringOption((opt) =>
          opt.setName("id").setDescription("id of the preset").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName(ProfileCommandSubCommandsTypes.LIST)
        .setDescription("list all presets")
    ),
})
export class ProfileCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  async execute(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const cmd = arg.options.getSubcommand(true);

    switch (cmd) {
      case ProfileCommandSubCommandsTypes.CREATE:
        this.createPreset(arg);
      case ProfileCommandSubCommandsTypes.UPDATE:
        this.updatePreset(arg);
      case ProfileCommandSubCommandsTypes.DELETE:
        this.deletePreset(arg);
      case ProfileCommandSubCommandsTypes.LIST:
        this.listPresets(arg);
    }
  }

  public async createPreset(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const json = arg.options.getString("json", true);

    const user = await UserEntity.findOne({
      where: {
        uid: arg.user.id,
      },
    });

    if (user) {
      await ProfilePresetEntity.save({
        user: {
          id: "",
        },
        json: "s5",
        updated_by: arg.user.id,
      });
    } else {
      await ProfilePresetEntity.save({
        user: {
          uid: arg.user.id,
        },

        json: "s5",
        updated_by: arg.user.id,
      });
    }
  }

  public updatePreset(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const id = arg.options.getString("id", true);
    const json = arg.options.getString("json", true);

    console.log(id, json);
  }

  public deletePreset(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const id = arg.options.getString("id", true);

    console.log(id);
  }

  public listPresets(arg: CmdArg<CmdType.SLASH_COMMAND>) {}
}
