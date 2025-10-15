import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {BaseTable} from "../../../common/entity/base-table.entity";
import {ChatCursor} from "../../cursor/entities/chat-cursor.entity";
import {ChatMessage} from "../../messages/entities/chat-message.entity";
import {User} from "../../../user/entities/user.entity";

@Entity()
export class ChatRoom extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({length: 100})
  name: string;

  @ManyToMany(
    () => User,
    {onDelete: 'CASCADE', eager: false, createForeignKeyConstraints: false}
  )
  @JoinTable()
  members: User[];

  @OneToMany(
    () => ChatMessage,
    (messages) => messages.room,
  )
  messages: ChatMessage[];

  @OneToMany(
    () => ChatCursor,
    (cursor) => cursor.room,
  )
  cursors: ChatCursor;
}
