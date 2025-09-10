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

  /**
   * 새로운 사용자 생성
   * @param createUserDto 사용자 생성 정보
   * @returns 생성된 사용자 정보
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  /**
   * 모든 사용자 조회
   * @returns 사용자 목록
   */
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  /**
   * 특정 사용자 조회
   * @param id 사용자 ID
   * @returns 사용자 정보
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ mbNo: id });
    
    if (!user) {
      throw new NotFoundException(`ID ${id}인 사용자를 찾을 수 없습니다`);
    }
    
    return user;
  }

  /**
   * 사용자 정보 업데이트
   * @param id 사용자 ID
   * @param updateUserDto 업데이트할 사용자 정보
   * @returns 업데이트된 사용자 정보
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  /**
   * 사용자 삭제 (마스킹 처리)
   * @param mbNo 사용자 번호
   * @returns 삭제된 사용자 정보
   */
  async remove(mbNo: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ mbNo });
    
    if (!user) {
      throw new NotFoundException(`ID ${mbNo}인 사용자를 찾을 수 없습니다`);
    }
    
    const today = new Date();
    
    // 삭제 시 개인정보 마스킹 처리
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
