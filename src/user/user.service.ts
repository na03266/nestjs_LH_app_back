import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { PagePaginationDto } from "../common/dto/page-pagination.dto";
import { CommonService } from "../common/common.service";
import { UserRole } from "../user/entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly commonService: CommonService,
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
   * @param req 요청 객체
   * @param dto 페이지 정보
   * @returns 사용자 목록
   */
  async findAll(req: any, dto: PagePaginationDto) {
    const { searchKey, searchValue } = dto;

    const qb = this.userRepository.createQueryBuilder('users');

    qb.leftJoinAndSelect('users.company', 'company')
      .leftJoinAndSelect('users.workshop', 'workshop')
      .where('users.deletedAt IS NULL');

    qb.andWhere('users.role >= :userRole', {
      userRole: req.user.role,
    });

    if (req.user.role === UserRole.SUPERADMIN) {
      qb.andWhere('users.companyId = :companyId', {
        companyId: req.user.companyId,
      });
    } else if (req.user.role === UserRole.ADMIN) {
      qb.andWhere('users.workshopId = :workshopId', {
        workshopId: req.user.workshopId,
      });
    } else if (req.user.role === UserRole.USER) {
      qb.andWhere('users.id = :id', { id: req.user.id });
    }

    if (searchKey && searchValue) {
      const tempWhiteList = [
        'users.name',
        'users.phone',
        'company.name',
        'workshop.name',
      ];

      if (tempWhiteList.includes(searchKey)) {
        qb.andWhere(`${searchKey} LIKE :value`, {
          value: `%${searchValue}%`,
        });
      } else {
        throw new BadRequestException('잘못된 검색 키입니다.');
      }
    }

    this.commonService.applyPagePaginationParamToQb(qb, dto);

    qb.orderBy('users.role', 'ASC')
      .addOrderBy('users.name', 'ASC')
      .addOrderBy('users.id', 'DESC');

    const users = await qb.getMany();
    const total = await qb.getCount();

    if (!users.length) {
      throw new NotFoundException('일치하는 정보가 없습니다.');
    }

    return { data: users, total: total };
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
