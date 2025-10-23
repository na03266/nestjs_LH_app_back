import {Module} from '@nestjs/common';
import {CursorService} from './cursor.service';
import {CursorController} from './cursor.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ChatCursor} from "./entities/chat-cursor.entity";
import {ChatMessage} from "../messages/entities/chat-message.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ChatCursor, ChatMessage])],
  controllers: [CursorController],
  providers: [CursorService],
})
export class CursorModule {
}
