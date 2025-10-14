// src/chat/entities/chat-room.entity.ts
import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {User} from "../../../user/entities/user.entity";
import {BaseTable} from "../../../common/entity/base-table.entity";
import {Chat} from "../../entities/chat.entity";
import {ChatCursor} from "../../cursor/entities/chat-cursor.entity";

@Entity('rooms')
export class ChatRoom extends BaseTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({length: 100})
  name: string;

  @ManyToMany(
    () => User,
  )
  @JoinTable()
  users: User[];

  @OneToMany(
    () => Chat,
    (chat) => chat.chatRoom,
  )
  chats: Chat[];

  @OneToMany(
    () => ChatCursor,
    (cursor) => cursor.room,
  )
  cursors: ChatCursor;
}
