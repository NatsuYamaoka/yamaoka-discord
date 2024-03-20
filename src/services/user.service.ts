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
      foundUser = UserEntity.create({
        uid,
        wallet: {},
        inventory: {},
      });
      await UserEntity.save(foundUser);
    }

    return foundUser;
  }

  public async usersWithHighest(
    field: keyof UserEntity,
    limit: number,
    relations: FindOptionsRelations<UserEntity> = {}
  ) {
    return UserEntity.find({
      order: { [field]: "DESC" },
      take: limit,
      relations,
    });
  }
}

export const userService = new UserService();
