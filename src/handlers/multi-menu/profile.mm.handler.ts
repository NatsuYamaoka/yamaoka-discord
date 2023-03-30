import {
  ProfileMmActionMap,
  ProfileMmActionOptions,
} from "@handlers/multi-menu/profile.mm.types";
import { createEmbed } from "@utils/create-embed.util";
import { ActionRowBuilder, ButtonBuilder, Colors, flatten } from "discord.js";

class ProfileMmHandler {
  private _methods: ProfileMmActionMap = {
    "profile.base": this.renderProfile,
    "profile.wallet": this.renderWallet,
  };

  public useAction(action: string, { arg, ...opt }: ProfileMmActionOptions) {
    const selectedAction = this._methods[action];

    if (!selectedAction) {
      return arg.followUp({ content: "Not implemented yet!", ephemeral: true });
    }

    selectedAction.bind(this)({ arg, ...opt });
  }

  private renderProfile({ arg, components }: ProfileMmActionOptions) {
    const profileEmbed = createEmbed({
      title: `Profile ${arg.user.username}`,
      description: "It's your profile :)",
      color: Colors.DarkButNotBlack,
    });

    this.disableClickedComponent("Profile", components);

    arg.editReply({ embeds: [profileEmbed], components });
  }

  private renderWallet({ arg, data, components }: ProfileMmActionOptions) {
    const walletEmbed = createEmbed({
      title: `Wallet ${arg.user.username}`,
      description: "It's your wallet",
      color: Colors.DarkButNotBlack,
      fields: [
        {
          name: "Balance",
          value: data.wallet.balance.toString(),
        },
      ],
    });

    this.disableClickedComponent("Wallet", components);

    arg.editReply({ embeds: [walletEmbed], components });
  }

  private disableClickedComponent(
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
}

export const profileMmHandler = new ProfileMmHandler();
