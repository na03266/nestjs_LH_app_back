import {Module} from '@nestjs/common';
import {MessagesService} from './messages.service';
import {MessagesController} from './messages.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../../user/entities/user.entity";
import {ChatMessage} from "./entities/chat-message.entity";
import {ChatRoom} from "../chat-room/entities/chat-room.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, ChatMessage, ChatRoom])],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {
}
