import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Notice} from "./entities/notice.entity";
import {Repository} from "typeorm";
import {PagePaginationDto} from "../common/dto/page-pagination.dto";
import {CommonService} from "../common/common.service";

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice) private readonly noticeRepository: Repository<Notice>,
  ) {
  }

  /**
   * 공지사항 목록 조회
   * @param dto 페이지 정보
   * @returns 공지사항 목록
   */
  async findAll(dto: PagePaginationDto): Promise<{ items: Notice[], total: number }> {
    const {page, take} = dto;
    const skip = (page - 1) * take;

    const [items, total] = await this.noticeRepository.findAndCount({
      skip,
      take,
      order: {
        wrId: 'DESC'
      }
    });

    return {items, total};
  }

  /**
   * 공지사항 상세 조회
   * @param id 공지사항 ID
   * @returns 공지사항 정보
   */
  async findOne(id: number): Promise<Notice> {
    const notice = await this.noticeRepository.findOneBy({wrId: id});

    if (!notice) {
      throw new NotFoundException(`ID ${id}인 공지사항을 찾을 수 없습니다`);
    }

    return notice;
  }

  /**
   * 공지사항 글 생성
   * @param createData 글 생성 정보
   * @returns 생성된 글 정보
   */
  async create(createData: Partial<Notice>): Promise<Notice> {
    const notice = this.noticeRepository.create(createData);
    return await this.noticeRepository.save(notice);
  }

  /**
   * 공지사항 글 업데이트
   * @param id 글 ID
   * @param updateData 업데이트 정보
   * @returns 업데이트된 글 정보
   */
  async update(id: number, updateData: Partial<Notice>): Promise<Notice> {
    const notice = await this.findOne(id);
    Object.assign(notice, updateData);

    return await this.noticeRepository.save(notice);
  }

  /**
   * 공지사항 글 삭제
   * @param id 글 ID
   * @returns 삭제된 글 정보
   */
  async delete(id: number): Promise<Notice> {
    const notice = await this.findOne(id);

    return await this.noticeRepository.remove(notice);
  }
}
