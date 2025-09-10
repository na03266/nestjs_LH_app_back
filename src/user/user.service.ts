import {Injectable} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {Repository} from "typeorm";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(mbNo: number) {
    const user = await this.userRepository.findOneBy({mbNo});
    const today = new Date();

    if (user) {
      user.mbPassword = '';
      user.mbPassword2 = '';
      user.mbHp = '';
      user.mbEmail = '';
      user.mbTel = '';
      user.mbAddr1 = '';
      user.mbAddr2 = '';
      user.mbAddr3 = '';
      user.mbMemo = `${today.toLocaleString()} 삭제함`;
      await this.userRepository.save(user);
    }

    return user;
  }
}
