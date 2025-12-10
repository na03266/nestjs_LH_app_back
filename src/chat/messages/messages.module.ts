import {Module} from '@nestjs/common';
import {MessagesService} from './messages.service';
import {MessagesController} from './messages.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../../user/entities/user.entity";
import {ChatMessage} from "./entities/chat-message.entity";
import {ChatRoom} from "../chat-room/entities/chat-room.entity";
import {ChatCursor} from "../cursor/entities/chat-cursor.entity";
import {CommonModule} from "../../common/common.module";

@Module({
    imports: [TypeOrmModule.forFeature([User, ChatMessage, ChatRoom, ChatCursor]), CommonModule,
    ],
    controllers: [MessagesController],
    providers: [MessagesService],
})
export class MessagesModule {
}
