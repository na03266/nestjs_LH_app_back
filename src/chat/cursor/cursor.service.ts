import {Injectable, NotFoundException} from '@nestjs/common';
import {UpdateCursorDto} from './dto/update-cursor.dto';
import {DataSource, Repository} from "typeorm";
import {ChatCursor} from "./entities/chat-cursor.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {ChatMessage} from "../messages/entities/chat-message.entity";

export interface AckReadInput {
  roomId: string;               // uuid
  lastReadMessageId: string;    // bigint string
}

@Injectable()
export class CursorService {
  constructor(
    private readonly ds: DataSource,
    @InjectRepository(ChatCursor) private readonly cursorRepository: Repository<ChatCursor>,
    @InjectRepository(ChatMessage) private readonly messageRepository: Repository<ChatMessage>,
  ) {
  }

  async update(updateCursorDto: UpdateCursorDto) {
    const cursor = await this.cursorRepository.findOne({
      where: {
        mbNo: updateCursorDto.userNo,
        roomId: updateCursorDto.roomId,
      }
    });
    if (!cursor) new NotFoundException('커서를 찾을 수 없습니다.')

    return cursor;
  }

  remove(id: number) {
    return `This action removes a #${id} cursor`;
  }
}
