import { InventoryEntity } from "@entities/user/inventory.entity";
import { Entity, JoinTable, ManyToMany } from "typeorm";

@Entity()
export class ShopItemEntity {
  @ManyToMany(() => InventoryEntity, (inventory) => inventory.shop_items, {
    cascade: true,
  })
  @JoinTable()
  inventory: InventoryEntity[];
}
