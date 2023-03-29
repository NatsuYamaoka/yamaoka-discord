import {
  ProfileMmActionMap,
  ProfileMmActionOptions,
} from "@handlers/multi-menu/profile.mm.types";
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

    selectedAction({ arg, ...opt });
  }

  private renderProfile({ arg }: ProfileMmActionOptions) {
    const profileEmbed = createEmbed({
      title: `Profile ${arg.user.username}`,
      description: "It's your profile :)",
      color: Colors.DarkButNotBlack,
    });

    arg.editReply({ embeds: [profileEmbed] });
  }

  private renderWallet({ arg, data }: ProfileMmActionOptions) {
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

    arg.editReply({ embeds: [walletEmbed] });
  }
}

export const profileMmHandler = new ProfileMmHandler();
