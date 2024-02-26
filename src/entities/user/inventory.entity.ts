import { PredefinedBaseEntity } from "@entities/base/base.entity";
import { ShopItemEntity } from "@entities/currency/shop-item.entity";
import { UserEntity } from "@entities/user/user.entity";
import { Entity, JoinColumn, ManyToMany, OneToOne } from "typeorm";

@Entity()
export class InventoryEntity extends PredefinedBaseEntity {
  @OneToOne(() => UserEntity, (user) => user.inventory, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn()
  user: UserEntity;

  @ManyToMany(() => ShopItemEntity, (shopItem) => shopItem.inventory, {
    cascade: true,
  })
  shop_items: ShopItemEntity[];
}
