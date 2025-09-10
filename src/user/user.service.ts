import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository, FindOptionsWhere } from "typeorm";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ mbNo: id });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(mbNo: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ mbNo });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${mbNo} not found`);
    }
    
    const today = new Date();
    
    // 마스킹 처리
    user.mbPassword = '';
    user.mbPassword2 = '';
    user.mbHp = '';
    user.mbEmail = '';
    user.mbTel = '';
    user.mbAddr1 = '';
    user.mbAddr2 = '';
    user.mbAddr3 = '';
    user.mbMemo = `${today.toLocaleString()} 삭제함`;
    
    return await this.userRepository.save(user);
  }
}
