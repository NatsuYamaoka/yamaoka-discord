import { WalletEntity } from "@entities/index";
import { FindOptionsRelations } from "typeorm";

class WalletService {
  public async walletWithHighest(
    field: keyof WalletEntity,
    limit: number,
    relations: FindOptionsRelations<WalletEntity> = {}
  ) {
    return WalletEntity.find({
      order: { [field]: "DESC" },
      take: limit,
      relations,
    });
  }
}

export const walletService = new WalletService();
