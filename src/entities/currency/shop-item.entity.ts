import { PredefinedBaseEntity } from "@entities/base/base.entity";
import { InventoryEntity } from "@entities/user/inventory.entity";
import { Entity, JoinTable, ManyToMany } from "typeorm";

@Entity()
export class ShopItemEntity extends PredefinedBaseEntity {
  @ManyToMany(() => InventoryEntity, (inventory) => inventory.shop_items)
  @JoinTable()
  inventory: InventoryEntity[];
}
