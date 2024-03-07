import { UserEntity } from "@entities/index";
import { FindOptionsRelations } from "typeorm";

class UserService {
  public async findOneByIdOrCreate(
    uid: string,
    relations: FindOptionsRelations<UserEntity> = {}
  ) {
    let foundUser = await UserEntity.findOne({
      where: { uid },
      relations,
    });

    if (!foundUser) {
      foundUser = await UserEntity.save({
        uid,
        wallet: {},
        inventory: {},
      });
    }

    return foundUser;
  }
}

export const userService = new UserService();
