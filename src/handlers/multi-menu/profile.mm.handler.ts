import {
  ProfileMmActionMap,
  ProfileMmActionOptions,
} from "@handlers/multi-menu/profile.mm.types";
import { disableClickedComponent } from "@helpers/disable-buttons.helper";
import { createEmbed } from "@utils/create-embed.util";
import { Colors } from "discord.js";

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

  private renderProfile({ arg, user, components }: ProfileMmActionOptions) {
    const profileEmbed = createEmbed({
      author: {
        name: user.username,
        icon_url: user.displayAvatarURL(),
      },
      title: "Profile",
      description: "n1g3",
      color: Colors.DarkButNotBlack,
    });

    disableClickedComponent("Profile", components);

    arg.editReply({ embeds: [profileEmbed], components });
  }

  private renderWallet({
    arg,
    user,
    data,
    components,
  }: ProfileMmActionOptions) {
    const walletEmbed = createEmbed({
      title: `Wallet ${user.username}`,
      description: "It's your wallet",
      color: Colors.DarkButNotBlack,
      fields: [
        {
          name: "Balance",
          value: data.wallet.balance.toString(),
        },
      ],
    });

    disableClickedComponent("Wallet", components);

    arg.editReply({ embeds: [walletEmbed], components });
  }
}

export const profileMmHandler = new ProfileMmHandler();
