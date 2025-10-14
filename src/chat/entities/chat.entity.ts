import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {BaseTable} from "../../common/entity/base-table.entity";
import {User} from "../../user/entities/user.entity";
import {ChatRoom} from "../chat-room/entities/chat-room.entity";



@Entity()
export class Chat extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => User,
  )
  author: User;

  @Column()
  message: string;

  @ManyToOne(
    () => ChatRoom,
    (chatroom) => chatroom.chats,
  )
  chatRoom: ChatRoom;
}