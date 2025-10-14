// src/chat/entities/chat-room.entity.ts
import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {User} from "../../../user/entities/user.entity";
import {BaseTable} from "../../../common/entity/base-table.entity";
import {Chat} from "../../entities/chat.entity";

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
}
